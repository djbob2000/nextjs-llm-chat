"use client";

import { Wrench, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCallDisplayProps {
  toolName: string;
  args: any;
  result?: string;
  isLoading?: boolean;
}

export function ToolCallDisplay({
  toolName,
  args,
  result,
  isLoading,
}: ToolCallDisplayProps) {
  return (
    <div className="my-2 rounded-lg border bg-blue-50/50 dark:bg-blue-900/10 p-3 text-xs border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-300 mb-2">
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Wrench className="h-3 w-3" />
        )}
        <span>Calling tool: {toolName}</span>
      </div>

      <div className="space-y-1">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-12 shrink-0">Args:</span>
          <code className="bg-black/5 dark:bg-white/5 px-1 rounded break-all whitespace-pre-wrap">
            {typeof args === "string" ? args : JSON.stringify(args, null, 2)}
          </code>
        </div>

        {result && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
            <span className="text-muted-foreground w-12 shrink-0">Result:</span>
            <div className="flex-1 flex gap-2 items-start">
              <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
              <code className="bg-black/5 dark:bg-white/5 px-1 rounded break-all whitespace-pre-wrap flex-1 text-blue-900 dark:text-blue-300">
                {result}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
