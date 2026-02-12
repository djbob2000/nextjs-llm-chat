"use client";

import { Button } from "@/components/ui/button";
import { FileText, Code2, ShieldAlert } from "lucide-react";

interface PromptTemplatesProps {
  onSelect: (prompt: string) => void;
}

const TEMPLATES = [
  {
    icon: FileText,
    label: "Summarize",
    prompt:
      "Please provide a concise summary of the following text, highlighting its key points:",
  },
  {
    icon: Code2,
    label: "Explain Code",
    prompt:
      "Analyze this code and explain how it works step by step. Highlight any potential improvements or best practices:",
  },
  {
    icon: ShieldAlert,
    label: "Security Audit",
    prompt:
      "Perform a security audit of the following code or system description. Identify potential vulnerabilities and suggest fixes:",
  },
];

export function PromptTemplates({ onSelect }: PromptTemplatesProps) {
  return (
    <div className="flex flex-wrap gap-2 pb-2 justify-center">
      {TEMPLATES.map((template) => (
        <Button
          key={template.label}
          variant="outline"
          size="sm"
          className="h-7 text-[10px] uppercase font-bold tracking-tight bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all hover:scale-105 active:scale-95"
          onClick={() => onSelect(template.prompt)}
        >
          <template.icon className="mr-1.5 h-3 w-3" />
          {template.label}
        </Button>
      ))}
    </div>
  );
}
