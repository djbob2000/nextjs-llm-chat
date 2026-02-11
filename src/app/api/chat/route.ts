import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { openRouter } from "@/lib/llm/openrouter";
import { ConversationRepository } from "@/lib/repositories/conversation.repository";
import { MessageRepository } from "@/lib/repositories/message.repository";
import { ChatMessage } from "@/lib/llm/types";
import { toolRegistry } from "@/lib/llm/tools";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeContent, MAX_MESSAGES_PER_REQUEST } from "@/lib/sanitize";
import { z } from "zod";

export const runtime = "edge";

const MAX_ITERATIONS = 5;

const ChatRequestSchema = z.object({
  conversationId: z.string().uuid(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system", "tool"]),
      content: z.string().nullable(),
      toolCalls: z.any().optional(),
      toolCallId: z.string().optional(),
    }),
  ),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().optional(),
});

export const POST = auth(async (req) => {
  const userId = req.auth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting
  const limitResult = await rateLimit(req, userId);
  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();

    // Zod Validation
    const validation = ChatRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.format() },
        { status: 400 },
      );
    }

    const { conversationId, messages, model, temperature, maxTokens } =
      validation.data;

    // Safety: limit history length
    if (messages.length > MAX_MESSAGES_PER_REQUEST) {
      return NextResponse.json(
        { error: "Chat history too long" },
        { status: 400 },
      );
    }

    const conversation = await ConversationRepository.findById(conversationId);
    if (!conversation || conversation.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Sanitize last message if user
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user" && lastMessage.content) {
      try {
        lastMessage.content = sanitizeContent(lastMessage.content);
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    }

    const llmHistory: ChatMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
      toolCalls: m.toolCalls,
      toolCallId: m.toolCallId,
    }));

    if (
      conversation.systemPrompt &&
      !llmHistory.some((m) => m.role === "system")
    ) {
      llmHistory.unshift({
        role: "system",
        content: conversation.systemPrompt,
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const customStream = new ReadableStream({
      async start(controller) {
        let currentIteration = 0;
        let finalAssistantContent = "";

        while (currentIteration < MAX_ITERATIONS) {
          currentIteration++;

          const stream = await openRouter.chat({
            model: model || conversation.model,
            messages: llmHistory,
            temperature: temperature ?? conversation.temperature,
            maxTokens: maxTokens ?? conversation.maxTokens,
            tools: toolRegistry.getDefinitions(),
          });

          const reader = stream.getReader();
          let iterationContent = "";
          let toolCalls: any[] = [];
          let isToolCall = false;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") continue;

                  try {
                    const json = JSON.parse(data);
                    const delta = json.choices?.[0]?.delta;

                    if (delta?.content) {
                      iterationContent += delta.content;
                      finalAssistantContent += delta.content;
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: "token", content: delta.content })}\n\n`,
                        ),
                      );
                    }

                    if (delta?.tool_calls) {
                      isToolCall = true;
                      delta.tool_calls.forEach((tc: any) => {
                        const index = tc.index;
                        if (!toolCalls[index]) {
                          toolCalls[index] = {
                            id: tc.id,
                            type: "function",
                            function: { name: "", arguments: "" },
                          };
                        }
                        if (tc.id) toolCalls[index].id = tc.id;
                        if (tc.function?.name)
                          toolCalls[index].function.name += tc.function.name;
                        if (tc.function?.arguments)
                          toolCalls[index].function.arguments +=
                            tc.function.arguments;
                      });
                    }
                  } catch (e) {
                    // Ignore malformed JSON
                  }
                }
              }
            }

            if (isToolCall) {
              const assistantMsg: ChatMessage = {
                role: "assistant",
                content: iterationContent || null,
                toolCalls: toolCalls.map((tc) => ({
                  id: tc.id,
                  type: "function",
                  function: {
                    name: tc.function.name,
                    arguments: tc.function.arguments,
                  },
                })),
              };

              llmHistory.push(assistantMsg);

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "tool_calls", toolCalls: assistantMsg.toolCalls })}\n\n`,
                ),
              );

              for (const tc of assistantMsg.toolCalls!) {
                let args = {};
                try {
                  args = JSON.parse(tc.function.arguments);
                } catch (e) {}

                const result = await toolRegistry.execute(
                  tc.function.name,
                  args,
                );
                const toolMsg: ChatMessage = {
                  role: "tool",
                  content: result,
                  toolCallId: tc.id,
                  name: tc.function.name,
                };
                llmHistory.push(toolMsg);

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "tool_result",
                      name: tc.function.name,
                      result,
                    })}\n\n`,
                  ),
                );
              }

              continue;
            } else {
              await MessageRepository.create({
                conversationId,
                role: "assistant",
                content: finalAssistantContent,
              });

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
              );
              controller.close();
              return;
            }
          } catch (error) {
            controller.error(error);
            return;
          } finally {
            reader.releaseLock();
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
        );
        controller.close();
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}) as any;
