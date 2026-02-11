export const MAX_MESSAGE_LENGTH = 50_000;
export const MAX_MESSAGES_PER_REQUEST = 100;

export function sanitizeContent(content: string): string {
  if (!content) return "";
  if (content.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
  }
  return content.trim();
}
