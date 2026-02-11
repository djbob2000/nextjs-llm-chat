"use client";

import { cn } from "@/lib/utils";
import { Message } from "@prisma/client";
import { User, Bot } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ToolCallDisplay } from "./ToolCallDisplay";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isTool = message.role === "tool";

  if (isTool) {
    return (
      <div className="flex w-full mb-2 justify-start pl-8 opacity-80">
        <div className="max-w-[80%]">
          <ToolCallDisplay
            toolName={message.role}
            args={message.content}
            result={message.content || ""}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex gap-3 max-w-[80%]",
          isUser ? "flex-row-reverse" : "flex-row",
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
            isUser ? "bg-background" : "bg-primary/10 text-primary",
          )}
        >
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </div>
        <div
          className={cn(
            "rounded-xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-muted text-foreground"
              : "bg-secondary text-secondary-foreground",
            isSystem &&
              "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-200 border border-orange-200 dark:border-orange-800",
          )}
        >
          {message.content && <MarkdownRenderer content={message.content} />}

          {message.toolCalls && Array.isArray(message.toolCalls) && (
            <div className="mt-2 space-y-2">
              {(message.toolCalls as any[]).map((tc, idx) => (
                <ToolCallDisplay
                  key={tc.id || idx}
                  toolName={tc.function.name}
                  args={tc.function.arguments}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
