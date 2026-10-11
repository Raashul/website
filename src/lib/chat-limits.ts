import "server-only";

// In-memory limits: per serverless instance, so they bound abuse and cost but
// are not a global guarantee. Swap for a shared store if hard caps are needed.
const PER_IP_LIMIT = 10;
const PER_IP_WINDOW_MS = 10 * 60_000;
const DAILY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT ?? 300);

const hits = new Map<string, number[]>();
let day = "";
let dayCount = 0;

export type LimitResult = { ok: true } | { ok: false; reason: "rate" | "daily" };

export function checkChatLimit(ip: string, now = Date.now()): LimitResult {
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    dayCount = 0;
  }
  if (dayCount >= DAILY_LIMIT) return { ok: false, reason: "daily" };

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < PER_IP_WINDOW_MS);
  if (recent.length >= PER_IP_LIMIT) {
    hits.set(ip, recent);
    return { ok: false, reason: "rate" };
  }
  recent.push(now);
  hits.set(ip, recent);
  dayCount++;
  return { ok: true };
}
