"use client";

import { Button } from "@/components/ui/button";
import { Plus, Search, Settings, LogOut, PanelLeftClose } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ConversationList } from "./ConversationList";
import { useConversations } from "@/contexts/ConversationsContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { createConversation, search, setSearch } = useConversations();
  const { isOpen, setIsOpen, toggle } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-muted/40 transition-all duration-300 ease-in-out lg:relative",
          isOpen
            ? "w-72 translate-x-0"
            : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden",
        )}
      >
        <div className="flex h-full w-72 flex-col">
          <div className="flex items-center justify-between p-4">
            <Button
              className="flex-1 justify-start gap-2"
              variant="outline"
              onClick={() => {
                createConversation();
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="ml-2"
              title="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
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
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-9 px-3"
            >
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
        </div>
      </aside>
    </>
  );
}
