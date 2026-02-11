"use client";

import { Message } from "@prisma/client";

export function downloadAsMarkdown(title: string, messages: Message[]) {
  let content = `# ${title}\n\n`;

  messages.forEach((msg) => {
    const role = msg.role.toUpperCase();
    content += `### ${role}\n${msg.content}\n\n`;

    if (msg.toolCalls && Array.isArray(msg.toolCalls)) {
      content += `> **Tool Calls:** ${JSON.stringify(msg.toolCalls, null, 2)}\n\n`;
    }
  });

  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
