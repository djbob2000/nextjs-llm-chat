"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, StopCircle } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  isLoading,
  onStop,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (value.trim() && !isLoading) {
      onSend(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-background p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[44px] max-h-48 resize-none bg-card focus-visible:ring-1 focus-visible:ring-primary shadow-none border-muted"
          disabled={isLoading && !onStop}
        />
        {isLoading && onStop ? (
          <Button
            size="icon"
            variant="destructive"
            onClick={onStop}
            className="shrink-0 h-[44px] w-[44px] rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <StopCircle className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            disabled={!value.trim() || isLoading}
            onClick={handleSend}
            className="shrink-0 h-[44px] w-[44px] rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <Send className="h-5 w-5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
