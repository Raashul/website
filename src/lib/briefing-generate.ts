import "server-only";
import { TOPICS, type Briefing, type BriefingItem } from "@/lib/briefing";
import { fetchStories, type StorySection } from "@/lib/sources/stories";
import { fetchEplItems } from "@/lib/sources/football";

const BBC = (path: string) => `https://feeds.bbci.co.uk/${path}/rss.xml`;

// Feeds are open-access outlets so the full article can be read and summarized.
const SECTIONS: StorySection[] = [
  {
    topic: "ai",
    count: 3,
    angle: "AI models, products, research, funding, and policy, and what they change for companies building on or competing with AI",
    feeds: [
      { name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
      { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/" },
      { name: "The Guardian", url: "https://www.theguardian.com/technology/artificialintelligenceai/rss" },
      { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/ai" },
    ],
  },
  {
    topic: "technology",
    count: 3,
    angle:
      "tech-company and industry news: product launches, earnings and deals, semiconductors, cloud, major cyber incidents, and tech regulation. Prefer stories about companies and markets over speeches or commentary. " +
      "Skip stories primarily about AI models or AI companies (covered in a separate section)",
    feeds: [
      { name: "BBC News", url: BBC("news/technology") },
      { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
      { name: "The Guardian", url: "https://www.theguardian.com/technology/rss" },
      { name: "CNBC", url: "https://www.cnbc.com/id/19854910/device/rss/rss.html" },
    ],
  },
  {
    topic: "us-stocks",
    count: 3,
    angle: "US markets and the economy: index moves, major earnings, the Fed and rates, and the macro news that moves funding and valuations",
    feeds: [
      { name: "CNBC", url: "https://www.cnbc.com/id/10000664/device/rss/rss.html" },
      { name: "CNBC", url: "https://www.cnbc.com/id/20910258/device/rss/rss.html" },
      { name: "BBC News", url: BBC("news/business") },
      { name: "MarketWatch", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories" },
    ],
  },
  {
    topic: "world",
    count: 3,
    angle: "the most consequential world news: geopolitics, trade and sanctions, elections, conflicts, and events that affect the global economy and business environment",
    feeds: [
      { name: "BBC News", url: BBC("news/world") },
      { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
      { name: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
    ],
  },
  {
    topic: "epl",
    count: 2,
    angle: "Premier League news: results, title race, big transfers, and rule or ownership developments",
    whyItMatters: false,
    feeds: [{ name: "BBC Sport", url: BBC("sport/football/premier-league") }],
  },
  {
    topic: "arlington",
    count: 2,
    angle: "Arlington, Virginia local news: development, transit, schools, county government, and public safety that affect residents",
    feeds: [{ name: "ARLnow", url: "https://www.arlnow.com/feed/" }],
  },
];

const TOPIC_ORDER = new Map(TOPICS.map((topic, index) => [topic, index]));

export async function generateBriefing(date: string): Promise<Briefing> {
  const settled = await Promise.allSettled([
    ...SECTIONS.map((section) => fetchStories(section, date)),
    fetchEplItems(date),
  ]);

  // The same story can surface in two sections (AI is listed first, so it wins); ship each link once.
  const seen = new Set<string>();
  const items: BriefingItem[] = settled
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter((item) => !seen.has(item.source.url) && !!seen.add(item.source.url))
    .sort((a, b) => (TOPIC_ORDER.get(a.topic) ?? 0) - (TOPIC_ORDER.get(b.topic) ?? 0));

  if (items.length === 0) throw new Error("generation produced no items");

  return { date, generatedAt: new Date().toISOString(), items };
}
