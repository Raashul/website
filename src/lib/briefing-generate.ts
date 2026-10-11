import "server-only";
import { TOPICS, type Briefing, type BriefingItem } from "@/lib/briefing";
import { fetchTopicNews } from "@/lib/sources/news";
import { fetchArlingtonNews } from "@/lib/sources/arlington";
import { fetchEplItems } from "@/lib/sources/football";

const TOPIC_ORDER = new Map(TOPICS.map((topic, index) => [topic, index]));

export async function generateBriefing(date: string): Promise<Briefing> {
  const settled = await Promise.allSettled([
    fetchTopicNews("ai", date),
    fetchTopicNews("technology", date),
    fetchTopicNews("us-stocks", date),
    fetchEplItems(date),
    fetchArlingtonNews(date),
  ]);

  const items: BriefingItem[] = settled
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => (TOPIC_ORDER.get(a.topic) ?? 0) - (TOPIC_ORDER.get(b.topic) ?? 0));

  if (items.length === 0) throw new Error("generation produced no items");

  return { date, generatedAt: new Date().toISOString(), items };
}
