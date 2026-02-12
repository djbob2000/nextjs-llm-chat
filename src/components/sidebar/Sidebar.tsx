"use client";

import { Button } from "@/components/ui/button";
import { Plus, Search, Settings, LogOut, PanelLeftClose } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ConversationList } from "./ConversationList";
import { useConversations } from "@/contexts/ConversationsContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import FocusTrap from "focus-trap-react";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const { createConversation, search, setSearch } = useConversations();
  const { isOpen, setIsOpen, toggle, isMobile } = useSidebar();

  const sidebarContent = (
    <div className="flex h-full w-72 flex-col">
      <div className="flex items-center justify-between p-4">
        <Button
          className="flex-1 justify-start gap-2"
          variant="outline"
          onClick={() => {
            createConversation();
            if (isMobile) setIsOpen(false);
          }}
          aria-label="Create new chat"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="ml-2"
          aria-label="Close sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search
            className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-transparent py-2 pl-8 pr-4 text-sm outline-none focus:ring-1 focus:ring-ring"
            aria-label="Search conversations"
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
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
            role="presentation"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={isMobile ? { x: -300 } : false}
        animate={{
          x: isOpen ? 0 : -300,
          width: isOpen ? (isMobile ? "auto" : 288) : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: -300, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50 || info.velocity.x < -500) {
            setIsOpen(false);
          }
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-muted/40 lg:relative",
          !isOpen && "overflow-hidden",
        )}
        role="navigation"
        aria-label="Sidebar navigation"
        aria-hidden={!isOpen}
      >
        {isOpen && isMobile ? (
          <FocusTrap
            focusTrapOptions={{
              allowOutsideClick: true,
              escapeDeactivates: false,
            }}
          >
            {sidebarContent}
          </FocusTrap>
        ) : (
          sidebarContent
        )}
      </motion.aside>
    </>
  );
}
