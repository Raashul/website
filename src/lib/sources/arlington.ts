import "server-only";
import type { BriefingItem } from "@/lib/briefing";

const FEED_URL = "https://www.arlnow.com/feed/";

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

function clean(value: string): string {
  return decodeEntities(stripCdata(value).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function summarize(description: string): string {
  const text = clean(description);
  if (text.length <= 300) return text;
  const slice = text.slice(0, 300);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  return lastStop > 120 ? slice.slice(0, lastStop + 1) : slice.trimEnd() + "…";
}

function field(block: string, tag: string): string {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  return match ? match[1] : "";
}

export async function fetchArlingtonNews(date: string): Promise<BriefingItem[]> {
  try {
    const res = await fetch(FEED_URL, { headers: { "User-Agent": "daily-briefing/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const blocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 2);
    const items: BriefingItem[] = [];
    blocks.forEach((block, index) => {
      const raw = block[0];
      const title = clean(field(raw, "title"));
      const link = stripCdata(field(raw, "link"));
      const summary = summarize(field(raw, "description"));
      if (!title || !link) return;
      items.push({
        id: `${date}-arlington-${index}`,
        topic: "arlington",
        title,
        summary: summary || title,
        source: { name: "ARLnow", url: link },
      });
    });
    return items;
  } catch (err) {
    console.error(`[arlington] failed: ${(err as Error).message}`);
    return [];
  }
}
