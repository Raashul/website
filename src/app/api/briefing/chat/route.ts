import { getBriefing } from "@/lib/briefing";
import { fetchArticleText } from "@/lib/article";
import { checkChatLimit } from "@/lib/chat-limits";
import { openrouterStream, type OpenrouterMessage } from "@/lib/openrouter";

export const maxDuration = 60;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_QUESTION = 500;
const MAX_HISTORY = 6;

function badRequest(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    date?: unknown;
    itemId?: unknown;
    question?: unknown;
    history?: unknown;
  } | null;

  if (
    !body ||
    typeof body.date !== "string" ||
    !DATE_PATTERN.test(body.date) ||
    typeof body.itemId !== "string" ||
    typeof body.question !== "string" ||
    body.question.trim() === "" ||
    body.question.length > MAX_QUESTION
  ) {
    return badRequest("Expected { date, itemId, question } with a question up to 500 characters.");
  }

  const history: OpenrouterMessage[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (m): m is { role: "user" | "assistant"; content: string } =>
            typeof m === "object" &&
            m !== null &&
            ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "assistant") &&
            typeof (m as { content?: unknown }).content === "string",
        )
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    : [];

  // Look the item up server-side: the client never supplies the URL we fetch.
  const briefing = await getBriefing(body.date);
  const item = briefing?.items.find((i) => i.id === body.itemId);
  if (!item) return badRequest("Unknown briefing item.", 404);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = checkChatLimit(ip);
  if (!limit.ok) {
    return badRequest(
      limit.reason === "daily"
        ? "Chat has reached its daily limit. Try again tomorrow."
        : "Too many questions. Please wait a few minutes.",
      429,
    );
  }

  const article = await fetchArticleText(item.source.url);
  const context = article
    ? `Article text (from ${item.source.url}):\n${article}`
    : `The full article could not be fetched, so only this summary is available:\n${item.summary}`;

  const messages: OpenrouterMessage[] = [
    {
      role: "system",
      content:
        "You answer questions about one news item from a daily briefing. Ground answers in the provided " +
        "material and say so when it does not cover the question. Be concise (a short paragraph or a few bullets). " +
        (article ? "" : "Mention that you are working from the summary only, not the full article. ") +
        `\n\nTitle: ${item.title}\nSummary: ${item.summary}\n\n${context}`,
    },
    ...history,
    { role: "user", content: body.question.trim() },
  ];

  try {
    const stream = await openrouterStream({ messages, signal: request.signal });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Grounded": article ? "article" : "summary",
      },
    });
  } catch (err) {
    console.error("[briefing/chat]", err);
    return badRequest("The assistant is unavailable right now.", 502);
  }
}
