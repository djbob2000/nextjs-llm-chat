"use client";

import { useState, useEffect, useCallback } from "react";
import { Conversation } from "@prisma/client";
import { useRouter, useParams } from "next/navigation";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

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
        body: JSON.stringify({ title: "New Chat" }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations([newConversation, ...conversations]);
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
        setConversations(conversations.filter((c) => c.id !== id));
        if (conversationId === id) {
          router.push("/chat");
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  return {
    conversations,
    isLoading,
    search,
    setSearch,
    createConversation,
    deleteConversation,
    refresh: () => fetchConversations(search),
    conversationId,
  };
}
