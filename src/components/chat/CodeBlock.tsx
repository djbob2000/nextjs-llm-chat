"use client";

import { useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedCode = hljs.getLanguage(language)
    ? hljs.highlight(value, { language }).value
    : hljs.highlightAuto(value).value;

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border bg-zinc-950 text-zinc-50">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <span className="text-xs font-medium text-zinc-400">{language}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
          onClick={onCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre>
          <code
            className={`hljs language-${language} text-sm leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}
