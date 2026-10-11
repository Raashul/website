import { getBriefingStore, parseBriefing } from "@/lib/briefing-store";

export async function POST(request: Request) {
  const secret = process.env.BRIEFING_GENERATE_SECRET;
  if (!secret || request.headers.get("Authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let briefing;
  try {
    briefing = parseBriefing(await request.json());
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }

  await getBriefingStore().put(briefing);
  return Response.json({ ok: true, date: briefing.date, items: briefing.items.length });
}
