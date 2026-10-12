import "server-only";

export interface FeedEntry {
  title: string;
  link: string;
  description: string;
  publishedAt: number | null;
  sourceName: string;
}

function stripCdata(value: string): string {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8230;/g, "…")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&nbsp;/g, " ");
}

export function cleanText(value: string): string {
  return decodeEntities(stripCdata(value).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function field(block: string, tag: string): string {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  return match ? match[1] : "";
}

// Feeds append tracking params (BBC's at_medium, utm_*); drop them so stored
// links are the plain article URL.
function canonicalLink(raw: string): string | null {
  try {
    const url = new URL(decodeEntities(stripCdata(raw)));
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("at_") || key.startsWith("utm_")) url.searchParams.delete(key);
    }
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export async function fetchFeed(url: string, sourceName: string): Promise<FeedEntry[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; BriefingBot/1.0)" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`${sourceName} feed HTTP ${res.status}`);
  const xml = await res.text();

  const entries: FeedEntry[] = [];
  for (const [block] of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const title = cleanText(field(block, "title"));
    const link = canonicalLink(field(block, "link") || field(block, "guid"));
    if (!title || !link) continue;
    const published = Date.parse(stripCdata(field(block, "pubDate")));
    entries.push({
      title,
      link,
      description: cleanText(field(block, "description")),
      publishedAt: Number.isNaN(published) ? null : published,
      sourceName,
    });
  }
  return entries;
}
