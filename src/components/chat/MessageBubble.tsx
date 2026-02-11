"use client";

import { cn } from "@/lib/utils";
import { Message } from "@prisma/client";
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
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted text-muted-foreground rounded-tl-none",
          isSystem &&
            "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-200 border border-orange-200 dark:border-orange-800",
        )}
      >
        <div className="text-xs font-semibold mb-1 opacity-70">
          {message.role.toUpperCase()}
        </div>

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
  );
}
