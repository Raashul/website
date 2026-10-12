import { getBriefingStore, parseBriefing } from "@/lib/briefing-store";
import { generateBriefing } from "@/lib/briefing-generate";
import type { Topic } from "@/lib/briefing";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Generation fans out to several LLM/web sources; the default limit is too short.
export const maxDuration = 300;

// Vercel Cron invokes the path with GET; manual triggers (make brief) use POST.
export async function GET(request: Request) {
  return generate(request, new URL(request.url).searchParams.get("date"));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return generate(request, (body as { date?: unknown }).date);
}

async function generate(request: Request, requested: unknown) {
  // CRON_SECRET: sent automatically by Vercel Cron. BRIEFING_GENERATE_SECRET: manual triggers.
  // Outside production, `local-dev` (the Makefile default) works with a plain `npm run dev`.
  const secrets = [
    process.env.CRON_SECRET,
    process.env.BRIEFING_GENERATE_SECRET,
    process.env.NODE_ENV === "production" ? undefined : "local-dev",
  ].filter(Boolean);
  const authorization = request.headers.get("Authorization");
  if (!authorization || !secrets.some((secret) => authorization === `Bearer ${secret}`)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const date =
    typeof requested === "string" && DATE_PATTERN.test(requested)
      ? requested
      : new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

  let briefing;
  try {
    briefing = parseBriefing(await generateBriefing(date));
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }

  await getBriefingStore().put(briefing);

  const byTopic = briefing.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.topic] = (acc[item.topic] ?? 0) + 1;
    return acc;
  }, {} as Record<Topic, number>);

  return Response.json({ ok: true, date, items: briefing.items.length, byTopic });
}
