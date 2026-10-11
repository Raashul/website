import "server-only";
import { TOPIC_META, type BriefingItem, type Topic } from "@/lib/briefing";
import { openrouterJSON, type Annotation } from "@/lib/openrouter";

type NewsTopic = Extract<Topic, "technology" | "ai" | "us-stocks">;

interface RawItem {
  title?: unknown;
  summary?: unknown;
  sourceName?: unknown;
  sourceUrl?: unknown;
}

// Keep only URLs the model actually grounded in its web results; fall back to
// the first citation when it invented one, so hallucinated links never ship.
function resolveUrl(candidate: string, annotations: Annotation[]): string | null {
  if (annotations.some((a) => a.url === candidate)) return candidate;
  return annotations[0]?.url ?? null;
}

export async function fetchTopicNews(topic: NewsTopic, date: string): Promise<BriefingItem[]> {
  const label = TOPIC_META[topic].label;
  try {
    const { data, annotations } = await openrouterJSON({
      online: true,
      messages: [
        {
          role: "system",
          content:
            "You are a news editor. Use your live web results. Return ONLY valid JSON of the form " +
            '{"items":[{"title","summary","sourceName","sourceUrl"}]}. ' +
            "Every sourceUrl MUST be copied verbatim from one of the real URLs in your web results; never invent a URL.",
        },
        {
          role: "user",
          content:
            `Give the 1-2 most important and RECENT (within the last ~3 days) US-relevant ${label} stories. ` +
            `Each summary should be 2-3 sentences. Today is ${date}.`,
        },
      ],
    });

    const raw = (data as { items?: unknown }).items;
    if (!Array.isArray(raw)) return [];

    const items: BriefingItem[] = [];
    raw.forEach((entry, index) => {
      const r = entry as RawItem;
      if (typeof r.title !== "string" || typeof r.summary !== "string") return;
      if (typeof r.sourceUrl !== "string") return;

      const url = resolveUrl(r.sourceUrl, annotations);
      if (!url) return;

      items.push({
        id: `${date}-${topic}-${index}`,
        topic,
        title: r.title,
        summary: r.summary,
        source: {
          name: typeof r.sourceName === "string" && r.sourceName ? r.sourceName : "Web",
          url,
        },
      });
    });

    return items;
  } catch (err) {
    console.error(`[news:${topic}] failed: ${(err as Error).message}`);
    return [];
  }
}
