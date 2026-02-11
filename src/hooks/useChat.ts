"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@prisma/client";
import { useConversations } from "@/contexts/ConversationsContext";

interface Conversation {
  id: string;
  title: string;
  model: string;
  temperature: number;
  systemPrompt: string | null;
  maxTokens: number;
}

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [activeToolCalls, setActiveToolCalls] = useState<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { updateConversation } = useConversations();

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    }
  }, [conversationId]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/messages?conversationId=${conversationId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchConversation();
    fetchMessages();
  }, [fetchConversation, fetchMessages, conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage, activeToolCalls]);

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const updateSettings = async (settings: Partial<Conversation>) => {
    if (!conversationId) return;
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        const updated = await response.json();
        setConversation(updated);
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);

      const userMsgRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          role: "user",
          content,
        }),
      });

      if (!userMsgRes.ok) throw new Error("Failed to save user message");
      const userMessage = await userMsgRes.json();
      setMessages((prev) => [...prev, userMessage]);

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setStreamingMessage("");
      setActiveToolCalls([]);

      // Generate title if first message
      if (messages.length === 0) {
        fetch("/api/conversations/generate-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Title generated:", data);
            if (data.title) {
              // Update local state if we have it
              if (conversation) {
                setConversation({ ...conversation, title: data.title });
              }
              // Update context
              updateConversation(conversationId, { title: data.title });
            }
          })
          .catch((err) => console.error("Failed to generate title:", err));
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messages: [...messages, userMessage],
          model: conversation?.model,
          temperature: conversation?.temperature,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start chat");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = JSON.parse(line.slice(6));

                if (data.type === "token") {
                  accumulatedContent += data.content;
                  setStreamingMessage(accumulatedContent);
                } else if (data.type === "tool_calls") {
                  setActiveToolCalls((prev) => [...prev, ...data.toolCalls]);
                } else if (data.type === "tool_result") {
                  setActiveToolCalls((prev) =>
                    prev.map((tc) =>
                      tc.function.name === data.name
                        ? { ...tc, result: data.result }
                        : tc,
                    ),
                  );
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      await fetchMessages();
      setStreamingMessage(null);
      setActiveToolCalls([]);
      abortControllerRef.current = null;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Stream aborted");
      } else {
        console.error("Failed to send message:", error);
      }
    } finally {
      setIsLoading(false);
      setStreamingMessage(null);
      setActiveToolCalls([]);
    }
  };

  return {
    messages,
    conversation,
    isLoading,
    streamingMessage,
    activeToolCalls,
    sendMessage,
    updateSettings,
    stop,
    scrollRef,
  };
}
