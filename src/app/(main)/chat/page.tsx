"use client";

import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import { useConversations } from "@/contexts/ConversationsContext";
import { useState } from "react";

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { createConversation } = useConversations();

  const handleCreateChat = async () => {
    setIsLoading(true);
    try {
      await createConversation();
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="rounded-full bg-muted p-6">
        <MessageSquarePlus className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">LLM Chat Workbench</h1>
        <p className="max-w-[420px] text-muted-foreground">
          Select a conversation from the sidebar or start a new one to begin.
        </p>
      </div>
      <Button
        size="lg"
        className="mt-4"
        onClick={handleCreateChat}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Start New Conversation"
        )}
      </Button>
    </div>
  );
}
