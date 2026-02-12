import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ConversationRepository } from "@/lib/repositories/conversation.repository";

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
    // Generate title using LLM (Non-streaming for simplicity)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not defined");
    }

    let title = "";

    // Retry up to 5 times if title is empty
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer":
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              "X-Title": "LLM Chat Workbench",
            },
            body: JSON.stringify({
              model: TITLE_GENERATION_MODEL,
              messages: [
                {
                  role: "system",
                  content:
                    "Generate a short, concise title (max 5 words) for the following conversation. Return ONLY the title, no quotes.",
                },
                { role: "user", content },
              ],
              temperature: 0.7,
              max_tokens: 50,
              stream: false,
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          console.warn(`Attempt ${i + 1} failed:`, error);
          continue;
        }

        const json = await response.json();
        title = json.choices?.[0]?.message?.content || "";

        if (title) {
          break;
        }
      } catch (e) {
        console.warn(`Attempt ${i + 1} exception:`, e);
      }
    }

    if (!title) {
      console.warn("Generated title was empty after 5 attempts.");
      // Fallback to truncated content
      title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
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
