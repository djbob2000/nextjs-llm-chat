import prisma from "@/lib/prisma";
import { Conversation, Prisma } from "@prisma/client";

export class ConversationRepository {
  static async create(data: {
    userId: string;
    title?: string;
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<Conversation> {
    return prisma.conversation.create({
      data: {
        userId: data.userId,
        title: data.title || "New Chat",
        model: data.model,
        systemPrompt: data.systemPrompt,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
      },
    });
  }

  static async findById(id: string): Promise<Conversation | null> {
    return prisma.conversation.findUnique({
      where: { id },
    });
  }

  static async listByUserId(
    userId: string,
    search?: string,
  ): Promise<Conversation[]> {
    const where: Prisma.ConversationWhereInput = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        {
          messages: {
            some: {
              content: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    return prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
  }

  static async update(
    id: string,
    data: {
      title?: string;
      model?: string;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<Conversation> {
    return prisma.conversation.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.conversation.delete({
      where: { id },
    });
  }
}
