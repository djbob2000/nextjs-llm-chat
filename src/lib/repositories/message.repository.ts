import prisma from "@/lib/prisma";
import { Message, Prisma } from "@prisma/client";

export class MessageRepository {
  static async create(data: {
    conversationId: string;
    role: string;
    content?: string;
    toolCalls?: any;
    toolCallId?: string;
    toolName?: string;
  }): Promise<Message> {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        toolCalls: data.toolCalls as any,
        toolCallId: data.toolCallId,
        toolName: data.toolName,
      },
    });
  }

  static async createMany(
    messages: {
      conversationId: string;
      role: string;
      content?: string;
      toolCalls?: any;
      toolCallId?: string;
      toolName?: string;
    }[],
  ): Promise<void> {
    await prisma.message.createMany({
      data: messages.map((m) => ({
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        toolCalls: m.toolCalls as any,
        toolCallId: m.toolCallId,
        toolName: m.toolName,
      })),
    });

    // Update conversation updatedAt
    if (messages.length > 0) {
      await prisma.conversation.update({
        where: { id: messages[0].conversationId },
        data: { updatedAt: new Date() },
      });
    }
  }

  static async listByConversationId(
    conversationId: string,
  ): Promise<Message[]> {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }
}
