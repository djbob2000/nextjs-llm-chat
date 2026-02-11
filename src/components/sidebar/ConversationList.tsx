"use client";

import { useConversations } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ConversationList() {
  const { conversations, isLoading, deleteConversation, conversationId } =
    useConversations();

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground italic">
        No conversations found.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <div key={conversation.id} className="group relative">
            <Link href={`/chat/${conversation.id}`}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3 py-6 text-left font-normal",
                  conversationId === conversation.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50",
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                <div className="flex-1 overflow-hidden">
                  <div className="truncate text-sm font-medium">
                    {conversation.title}
                  </div>
                  <div className="truncate text-xs text-muted-foreground opacity-70">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm("Delete this conversation?")) {
                  deleteConversation(conversation.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
