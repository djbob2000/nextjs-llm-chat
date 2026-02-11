import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ConversationRepository } from "@/lib/repositories/conversation.repository";
import { z } from "zod";

const updateConversationSchema = z.object({
  title: z.string().optional(),
  model: z.string().optional(),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

export const GET = auth(async (req, { params }) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await params) as { id: string };

  try {
    const conversation = await ConversationRepository.findById(id);

    if (!conversation) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (conversation.userId !== req.auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Failed to get conversation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}) as any;

export const PATCH = auth(async (req, { params }) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await params) as { id: string };

  try {
    const conversation = await ConversationRepository.findById(id);

    if (!conversation) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (conversation.userId !== req.auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateConversationSchema.parse(body);

    const updatedConversation = await ConversationRepository.update(
      id,
      validatedData,
    );

    return NextResponse.json(updatedConversation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Failed to update conversation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}) as any;

export const DELETE = auth(async (req, { params }) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await params) as { id: string };

  try {
    const conversation = await ConversationRepository.findById(id);

    if (!conversation) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (conversation.userId !== req.auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ConversationRepository.delete(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}) as any;
