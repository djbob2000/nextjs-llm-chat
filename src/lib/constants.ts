export const AVAILABLE_MODELS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    provider: "Google",
  },
  { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    provider: "Meta",
  },
];

export const DEFAULT_MODEL = "openai/gpt-4o-mini";

export const DEFAULT_USER_EMAIL =
  process.env.DEFAULT_USER_EMAIL || "admin@llmchat.local";
export const DEFAULT_USER_PASSWORD =
  process.env.DEFAULT_USER_PASSWORD || "changeme123";

export const MAX_MESSAGE_LENGTH = 50_000;
export const MAX_MESSAGES_PER_REQUEST = 100;
export const TOOL_ITERATION_LIMIT = 5;
