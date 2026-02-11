"use client";

import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { Loader2, Download, Terminal, Bot } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ToolCallDisplay } from "./ToolCallDisplay";
import { SettingsPanel } from "./SettingsPanel";
import { Button } from "@/components/ui/button";
import { downloadAsMarkdown } from "@/lib/export";
import { Separator } from "@/components/ui/separator";
import { PromptTemplates } from "./PromptTemplates";
import { AVAILABLE_MODELS } from "@/lib/constants";

interface ChatAreaProps {
  conversationId: string;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const [inputContent, setInputContent] = useState("");
  const {
    messages,
    conversation,
    isLoading,
    streamingMessage,
    activeToolCalls,
    sendMessage,
    updateSettings,
    stop,
    scrollRef,
  } = useChat(conversationId);

  const handleSend = (content: string) => {
    setInputContent("");
    setTimeout(() => {
      sendMessage(content);
    }, 0);
  };

  const handleSelectTemplate = (prompt: string) => {
    setInputContent(prompt);
  };

  const modelName =
    AVAILABLE_MODELS.find((m) => m.id === conversation?.model)?.name ||
    conversation?.model ||
    "Unknown Model";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card shadow-sm z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h2 className="text-sm font-semibold truncate leading-tight">
              {conversation?.title || "New Conversation"}
            </h2>
            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-mono">
              {modelName} • Temp {conversation?.temperature}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              downloadAsMarkdown(conversation?.title || "Chat", messages)
            }
            disabled={messages.length === 0}
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Export as Markdown"
          >
            <Download className="h-5 w-5" />
          </Button>

          {conversation && (
            <SettingsPanel
              initialSettings={{
                model: conversation.model,
                temperature: conversation.temperature,
                systemPrompt: conversation.systemPrompt,
              }}
              onSave={updateSettings}
              disabled={isLoading}
            />
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-8 py-4">
          {messages.length === 0 && !streamingMessage && !isLoading && (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground space-y-4 animate-in fade-in duration-700">
              <Terminal className="h-12 w-12 opacity-10" />
              <p className="italic text-sm">
                Waiting for your first message...
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {(streamingMessage !== null || activeToolCalls.length > 0) && (
            <div className="flex w-full mb-4 justify-start">
              <div className="flex gap-3 max-w-[80%] flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-xl px-4 py-3 shadow-sm bg-secondary text-secondary-foreground min-w-[60px]">
                  <div className="text-[10px] font-bold mb-2 tracking-tighter opacity-50 uppercase flex items-center gap-2 text-primary">
                    <span className="h-1 w-1 bg-primary rounded-full animate-ping" />
                    Assistant is thinking
                  </div>

                  {streamingMessage && (
                    <MarkdownRenderer content={streamingMessage} />
                  )}

                  {activeToolCalls.length > 0 && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-border/50">
                      {activeToolCalls.map((tc, idx) => (
                        <ToolCallDisplay
                          key={tc.id || idx}
                          toolName={tc.function.name}
                          args={tc.function.arguments}
                          result={tc.result}
                          isLoading={!tc.result}
                        />
                      ))}
                    </div>
                  )}

                  {!activeToolCalls.some((tc) => !tc.result) &&
                    streamingMessage !== null && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
                    )}
                </div>
              </div>
            </div>
          )}

          {isLoading && messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground opacity-50" />
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Footer / Input */}
      <div className="bg-background pt-2 p-4">
        <div className="max-w-3xl mx-auto">
          <PromptTemplates onSelect={handleSelectTemplate} />
          <MessageInput
            value={inputContent}
            onChange={setInputContent}
            onSend={handleSend}
            isLoading={isLoading}
            onStop={stop}
          />
        </div>
      </div>
    </div>
  );
}
