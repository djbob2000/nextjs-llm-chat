import { ChatParams, LLMProvider } from "./types";

export class OpenRouterProvider implements LLMProvider {
  private baseUrl = "https://openrouter.ai/api/v1";

  async chat(params: ChatParams): Promise<ReadableStream<Uint8Array>> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not defined");
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "LLM Chat Workbench",
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4096,
        tools: params.tools,
        stream: true,
      }),
      signal: params.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error?.error?.message || `OpenRouter API error: ${response.statusText}`,
      );
    }

    return response.body!;
  }
}

export const openRouter = new OpenRouterProvider();
