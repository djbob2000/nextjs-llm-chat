import { ToolHandler } from "./registry";

export const summarizeText: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "summarize_text",
      description: "Summarize a given text to a shorter version",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The text to summarize",
          },
        },
        required: ["text"],
      },
    },
  },
  execute: (args: { text: string }) => {
    const sentences = args.text.split(/[.!?]+/).filter(Boolean);
    if (sentences.length <= 2) return args.text;

    const count = Math.max(1, Math.ceil(sentences.length * 0.3));
    const summary = sentences.slice(0, count).join(". ") + ".";
    return `Summary: ${summary}`;
  },
};
