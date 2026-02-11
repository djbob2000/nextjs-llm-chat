"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Conversation } from "@prisma/client";
import { useRouter, useParams } from "next/navigation";
import { DEFAULT_MODEL } from "@/lib/constants";

interface ConversationsContextType {
  conversations: Conversation[];
  isLoading: boolean;
  search: string;
  setSearch: (value: string) => void;
  createConversation: () => Promise<Conversation | undefined>;
  deleteConversation: (id: string) => Promise<void>;
  refresh: () => void;
  updateConversation: (id: string, data: Partial<Conversation>) => void;
}

const ConversationsContext = createContext<
  ConversationsContextType | undefined
>(undefined);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchConversations = useCallback(async (searchQuery?: string) => {
    setIsLoading(true);
    try {
      const url = new URL("/api/conversations", window.location.origin);
      if (searchQuery) url.searchParams.append("search", searchQuery);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, fetchConversations]);

  const createConversation = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Chat",
          model: DEFAULT_MODEL,
        }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations((prev) => [newConversation, ...prev]);
        router.push(`/chat/${newConversation.id}`);
        return newConversation;
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (window.location.pathname.includes(id)) {
          router.push("/chat");
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const updateConversation = (id: string, data: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
  };

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        isLoading,
        search,
        setSearch,
        createConversation,
        deleteConversation,
        refresh: () => fetchConversations(search),
        updateConversation,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error(
      "useConversations must be used within a ConversationsProvider",
    );
  }
  const params = useParams();
  // We augment the context with current conversation ID from params in a somewhat hacky way
  // allowing components to just access `conversationId`
  return { ...context, conversationId: params.conversationId as string };
}
