export const AVAILABLE_MODELS = [
  { id: "openrouter/free", name: "Free", provider: "OpenRouter" },
];

export const DEFAULT_MODEL = "openrouter/free";
export const TITLE_GENERATION_MODEL = "openrouter/free";

export const DEFAULT_USER_EMAIL =
  process.env.DEFAULT_USER_EMAIL || "admin@llmchat.local";
export const DEFAULT_USER_PASSWORD =
  process.env.DEFAULT_USER_PASSWORD || "changeme123";

export const MAX_MESSAGE_LENGTH = 50_000;
export const MAX_MESSAGES_PER_REQUEST = 100;
export const TOOL_ITERATION_LIMIT = 5;
