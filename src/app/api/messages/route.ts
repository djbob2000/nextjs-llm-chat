import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MessageRepository } from "@/lib/repositories/message.repository";
import { ConversationRepository } from "@/lib/repositories/conversation.repository";
import { z } from "zod";

const createMessageSchema = z.object({
  conversationId: z.string(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string().optional(),
});

export const GET = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 },
    );
  }

  try {
    const conversation = await ConversationRepository.findById(conversationId);

    if (!conversation) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (conversation.userId !== req.auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages =
      await MessageRepository.listByConversationId(conversationId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to list messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}) as any;

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = createMessageSchema.parse(body);

    const conversation = await ConversationRepository.findById(
      validatedData.conversationId,
    );

    if (!conversation) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (conversation.userId !== req.auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await MessageRepository.create(validatedData);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Failed to create message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}) as any;
