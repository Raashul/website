import { getBriefingStore } from "@/lib/briefing-store";

export const TOPICS = ["technology", "us-stocks", "ai", "world", "epl", "arlington"] as const;
export type Topic = (typeof TOPICS)[number];
export interface Source { name: string; url: string; }
export interface BriefingItem {
  id: string;
  topic: Topic;
  title: string;
  summary: string;
  /** Implication for the reader; absent on older briefings and data-driven items. */
  whyItMatters?: string;
  source: Source;
}
export interface Briefing { date: string; generatedAt: string; items: BriefingItem[]; }

export const TOPIC_META: Record<Topic, { label: string; emoji: string }> = {
  technology: { label: "Technology", emoji: "💻" },
  "us-stocks": { label: "US Stocks", emoji: "📈" },
  ai: { label: "AI", emoji: "🤖" },
  world: { label: "World", emoji: "🌍" },
  epl: { label: "EPL", emoji: "⚽" },
  arlington: { label: "Local News", emoji: "📍" },
};

export async function getBriefingDates(): Promise<string[]> {
  return getBriefingStore().listDates();
}

export async function getBriefing(date: string): Promise<Briefing | null> {
  return getBriefingStore().get(date);
}
