import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export default function ChatPage() {
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
      <Button size="lg" className="mt-4">
        Start New Conversation
      </Button>
    </div>
  );
}
