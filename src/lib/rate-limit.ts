import { NextRequest } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

export async function rateLimit(request: NextRequest, userId: string) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const key = `${ip}:${userId}`;

  const now = Date.now();
  const record = store[key];

  if (!record || now > record.resetAt) {
    store[key] = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    return { success: true, count: 1, limit: MAX_REQUESTS };
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    return { success: false, count: record.count, limit: MAX_REQUESTS };
  }

  return { success: true, count: record.count, limit: MAX_REQUESTS };
}
