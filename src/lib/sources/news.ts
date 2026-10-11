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

// Prompting alone still lets lookalike/aggregator domains through, so links
// are also restricted to known outlets in code.
const ALLOWED_HOSTS = [
  "reuters.com", "apnews.com", "bloomberg.com", "wsj.com", "ft.com", "cnbc.com", "nytimes.com",
  "washingtonpost.com", "theverge.com", "arstechnica.com", "techcrunch.com", "wired.com",
  "axios.com", "npr.org", "bbc.com", "bbc.co.uk", "cnn.com", "forbes.com", "fortune.com",
  "barrons.com", "marketwatch.com", "finance.yahoo.com", "theinformation.com", "technologyreview.com",
  "engadget.com", "zdnet.com", "venturebeat.com", "semafor.com", "politico.com", "theguardian.com",
  "businessinsider.com", "investopedia.com", "nasdaq.com", "seekingalpha.com", "cnet.com",
];

function isAllowedHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

// A link ships only if the model's own sourceUrl was grounded in its web
// results and is from an allowed outlet. No fallback to another citation: that
// would attach an unrelated article to the story.
function isShippable(url: string, annotations: Annotation[]): boolean {
  return isAllowedHost(url) && annotations.some((a) => a.url === url);
}

// Distinct scopes keep Technology and AI from returning the same stories.
const TOPIC_SCOPE: Record<NewsTopic, string> = {
  technology:
    "consumer and enterprise technology, semiconductors, cybersecurity, and big-tech business news. " +
    "Exclude stories primarily about AI models or AI companies (those belong to a separate AI section)",
  ai: "AI models, AI research, AI products, and AI policy",
  "us-stocks": "US equity markets: index moves, notable earnings, and the macro news driving them",
};

const MAX_ITEMS = 2;

const REPUTABLE_SOURCES =
  "Prefer original reporting from reputable outlets (e.g. Reuters, AP, Bloomberg, WSJ, FT, CNBC, NYT, " +
  "The Verge, Ars Technica, TechCrunch, Wired). Avoid content farms, aggregators, and press-release mirrors.";

export async function fetchTopicNews(topic: NewsTopic, date: string): Promise<BriefingItem[]> {
  const label = TOPIC_META[topic].label;
  try {
    const { data, annotations } = await openrouterJSON({
      online: true,
      includeDomains: ALLOWED_HOSTS,
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
            `Give up to 4 important and RECENT (within the last ~3 days) US-relevant ${label} stories, most important first, ` +
            `covering ${TOPIC_SCOPE[topic]}. ${REPUTABLE_SOURCES} ` +
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

      const url = r.sourceUrl;
      if (!isShippable(url, annotations)) return;

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

    return items.slice(0, MAX_ITEMS);
  } catch (err) {
    console.error(`[news:${topic}] failed: ${(err as Error).message}`);
    return [];
  }
}
