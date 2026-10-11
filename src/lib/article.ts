import "server-only";

const MAX_BYTES = 1_500_000;
const MAX_CHARS = 12_000;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8_000;

// Source URLs come from LLM citations and RSS, so treat them as untrusted:
// http(s) only, and never loopback/private/link-local hosts.
function isPublicHttpUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return null;
  }
  if (host.startsWith("[") || host.includes(":")) return null; // IPv6 literals
  const octets = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (octets) {
    const [a, b] = [Number(octets[1]), Number(octets[2])];
    if (a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
      return null;
    }
  }
  return url;
}

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|nav|footer|header|aside|form)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Fetches a page and returns its readable text, or null if unavailable. */
export async function fetchArticleText(rawUrl: string): Promise<string | null> {
  let url = isPublicHttpUrl(rawUrl);
  try {
    for (let hop = 0; url && hop <= MAX_REDIRECTS; hop++) {
      const res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BriefingBot/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        url = location ? isPublicHttpUrl(new URL(location, url).toString()) : null;
        continue;
      }
      if (!res.ok) return null;
      if (!(res.headers.get("content-type") ?? "").includes("html")) return null;

      const html = (await res.text()).slice(0, MAX_BYTES);
      const text = htmlToText(html);
      // Very short text usually means a paywall, consent wall, or JS-only page.
      return text.length >= 400 ? text.slice(0, MAX_CHARS) : null;
    }
  } catch {
    return null;
  }
  return null;
}
