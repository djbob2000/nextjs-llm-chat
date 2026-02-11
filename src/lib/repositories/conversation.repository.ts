import prisma from "@/lib/prisma";
import { Conversation } from "@prisma/client";

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
    return prisma.conversation.findMany({
      where: {
        userId,
        OR: search
          ? [
              { title: { contains: search, mode: "insensitive" } },
              {
                messages: {
                  some: {
                    content: { contains: search, mode: "insensitive" },
                  },
                },
              },
            ]
          : undefined,
      },
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
