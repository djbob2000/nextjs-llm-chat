import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ConversationRepository } from "@/lib/repositories/conversation.repository";
import { openRouter } from "@/lib/llm/openrouter";
import { TITLE_GENERATION_MODEL } from "@/lib/constants";
import { z } from "zod";

const generateTitleSchema = z.object({
  conversationId: z.string(),
  content: z.string(),
});

export const POST = auth(async (req) => {
  const userId = req.auth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { conversationId, content } = generateTitleSchema.parse(body);

    const conversation = await ConversationRepository.findById(conversationId);
    if (!conversation || conversation.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate title using LLM
    const stream = await openRouter.chat({
      model: TITLE_GENERATION_MODEL, // Fast and cheap model for titles
      messages: [
        {
          role: "system",
          content:
            "Generate a short, concise title (max 5 words) for the following conversation. Return ONLY the title, no quotes.",
        },
        { role: "user", content },
      ],
      temperature: 0.7,
      maxTokens: 50,
    });

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let title = "";

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
            const content = json.choices?.[0]?.delta?.content;
            if (content) title += content;
          } catch (e) {}
        }
      }
    }

    title = title.trim().replace(/^["']|["']$/g, "");

    // Update conversation in DB
    const updated = await ConversationRepository.update(conversationId, {
      title,
    });

    return NextResponse.json({ title: updated.title });
  } catch (error) {
    console.error("Failed to generate title:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}) as any;
