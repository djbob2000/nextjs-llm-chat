"use client";

import { Button } from "@/components/ui/button";
import { Plus, Search, Settings, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ConversationList } from "./ConversationList";
import { useConversations } from "@/hooks/useConversations";
import { signOut } from "next-auth/react";

export function Sidebar() {
  const { createConversation, search, setSearch } = useConversations();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="p-4">
        <Button
          className="w-full justify-start gap-2"
          variant="outline"
          onClick={() => createConversation()}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-transparent py-2 pl-8 pr-4 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <Separator />

      <ConversationList />

      <Separator />

      <div className="p-2 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-3">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
