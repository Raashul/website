import { getBriefingStore, parseBriefing } from "@/lib/briefing-store";
import { generateBriefing } from "@/lib/briefing-generate";
import type { Topic } from "@/lib/briefing";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  const secret = process.env.BRIEFING_GENERATE_SECRET;
  if (!secret || request.headers.get("Authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const requested = (body as { date?: unknown }).date;
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
