import "server-only";
import type { BriefingItem, Topic } from "@/lib/briefing";
import { openrouterJSON } from "@/lib/openrouter";
import { fetchArticleText } from "@/lib/article";
import { fetchFeed, type FeedEntry } from "@/lib/sources/rss";

export interface Feed {
  name: string;
  url: string;
}

export interface StorySection {
  topic: Topic;
  feeds: Feed[];
  /** How many stories to ship. */
  count: number;
  /** What this section is for, used to pick stories and to frame "why it matters". */
  angle: string;
  /** Set false for sections where a business takeaway would be forced (e.g. sport). */
  whyItMatters?: boolean;
}

const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_CANDIDATES = 40;
const READER =
  "The reader is a startup CEO who wants to stay on top of what is happening in the world and in their industry, " +
  "without opening every article.";

// Video pages, live blogs and podcasts have no article body to summarize.
const MEDIA_PATH = /\/(videos?|live|podcasts?|audio|gallery)\//i;

// Newest first, one outlet at a time round-robin so a prolific feed can't crowd out the rest.
function pickCandidates(perFeed: FeedEntry[][], now: number): FeedEntry[] {
  const seen = new Set<string>();
  const queues = perFeed.map((entries) =>
    entries
      .filter((e) => e.publishedAt === null || now - e.publishedAt <= MAX_AGE_MS)
      .filter((e) => new URL(e.link).pathname.length > 1 && !MEDIA_PATH.test(new URL(e.link).pathname))
      .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0)),
  );

  const out: FeedEntry[] = [];
  for (let i = 0; out.length < MAX_CANDIDATES && queues.some((q) => i < q.length); i++) {
    for (const queue of queues) {
      const entry = queue[i];
      if (!entry || seen.has(entry.link)) continue;
      seen.add(entry.link);
      out.push(entry);
    }
  }
  return out;
}

// The model only chooses by index, so every shipped link is a real article URL from a feed.
async function selectStories(section: StorySection, candidates: FeedEntry[]): Promise<FeedEntry[]> {
  const list = candidates
    .map((c, i) => `[${i}] ${c.sourceName}: ${c.title} — ${c.description.slice(0, 200)}`)
    .join("\n");

  const { data } = await openrouterJSON({
    messages: [
      {
        role: "system",
        content:
          `You are the editor of a daily briefing. ${READER} ` +
          'Return ONLY JSON of the form {"picks":[indexes]}, most important first, no duplicates.',
      },
      {
        role: "user",
        content:
          `Section focus: ${section.angle}\n` +
          `Pick the ${section.count + 3} most important, substantive stories from the candidates below. ` +
          "Prefer concrete news with consequences over opinion, listicles, reviews, and fluff. " +
          "Do not pick two stories about the same event.\n\n" +
          list,
      },
    ],
  });

  const picks = (data as { picks?: unknown }).picks;
  if (!Array.isArray(picks)) return [];
  const chosen = new Set<number>();
  for (const pick of picks) {
    if (Number.isInteger(pick) && pick >= 0 && pick < candidates.length) chosen.add(pick as number);
  }
  return [...chosen].map((i) => candidates[i]);
}

async function summarize(
  section: StorySection,
  entry: FeedEntry,
  articleText: string,
): Promise<{ summary: string; whyItMatters: string } | null> {
  const { data } = await openrouterJSON({
    maxTokens: 700,
    messages: [
      {
        role: "system",
        content:
          `You write entries for a daily briefing. ${READER} ` +
          'Return ONLY JSON of the form {"summary","whyItMatters"}. Use ONLY facts from the article text; never add outside claims.\n' +
          "summary: 4-6 sentences (about 90-140 words) that let the reader get the full gist without opening the article: " +
          "what happened, who is involved, the key numbers, dates and quotes, the background needed to understand it, and what happens next. " +
          "Lead with the news itself. No filler, no phrases like 'the article says'.\n" +
          (section.whyItMatters === false
            ? 'whyItMatters: always "".'
            : `whyItMatters: 1-2 sentences on the concrete implication for this reader (${section.angle}): markets, funding, hiring, competition, regulation, costs, or local impact. ` +
              'Be specific. If there is no genuine implication, return "". Never write filler like "staying informed is crucial".'),
      },
      {
        role: "user",
        content: `Title: ${entry.title}\nOutlet: ${entry.sourceName}\n\nArticle text:\n${articleText}`,
      },
    ],
  });

  const result = data as { summary?: unknown; whyItMatters?: unknown };
  if (typeof result.summary !== "string" || result.summary.length < 120) return null;
  return {
    summary: result.summary.trim(),
    whyItMatters: typeof result.whyItMatters === "string" ? result.whyItMatters.trim() : "",
  };
}

export async function fetchStories(section: StorySection, date: string): Promise<BriefingItem[]> {
  const { topic } = section;
  try {
    const settled = await Promise.allSettled(section.feeds.map((f) => fetchFeed(f.url, f.name)));
    settled.forEach((result, i) => {
      if (result.status === "rejected") console.error(`[stories:${topic}] ${section.feeds[i].name}: ${result.reason}`);
    });
    const perFeed = settled.map((r) => (r.status === "fulfilled" ? r.value : []));

    const candidates = pickCandidates(perFeed, Date.now());
    if (candidates.length === 0) return [];

    // Over-select, then keep only stories whose full text we could read (paywalls and JS-only pages drop out).
    const selected = await selectStories(section, candidates);
    const texts = await Promise.all(selected.map((e) => fetchArticleText(e.link)));
    const readable = selected
      .map((entry, i) => ({ entry, text: texts[i] }))
      .filter((r): r is { entry: FeedEntry; text: string } => r.text !== null)
      .slice(0, section.count);

    const summaries = await Promise.all(
      readable.map(({ entry, text }) =>
        summarize(section, entry, text).catch((err) => {
          console.error(`[stories:${topic}] summarize failed for ${entry.link}: ${(err as Error).message}`);
          return null;
        }),
      ),
    );

    const items: BriefingItem[] = [];
    readable.forEach(({ entry }, i) => {
      const result = summaries[i];
      if (!result) return;
      items.push({
        id: `${date}-${topic}-${items.length}`,
        topic,
        title: entry.title,
        summary: result.summary,
        ...(result.whyItMatters && { whyItMatters: result.whyItMatters }),
        source: { name: entry.sourceName, url: entry.link },
      });
    });
    return items;
  } catch (err) {
    console.error(`[stories:${topic}] failed: ${(err as Error).message}`);
    return [];
  }
}
