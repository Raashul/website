import "server-only";
import { get, list, put } from "@vercel/blob";
import type { Briefing } from "@/lib/briefing";
import type { BriefingStore } from "@/lib/briefing-store";

const PREFIX = "briefings/";
const PATHNAME_PATTERN = /^briefings\/(\d{4}-\d{2}-\d{2})\.json$/;

// Prod backend (selected when BLOB_READ_WRITE_TOKEN is set). The Blob store
// must be created with private access. Only this app writes here (via
// parseBriefing-validated input), so `get` casts like the file store does.
export const blobStore: BriefingStore = {
  async listDates() {
    const dates: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: PREFIX, cursor });
      for (const blob of page.blobs) {
        const date = PATHNAME_PATTERN.exec(blob.pathname)?.[1];
        if (date) dates.push(date);
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return dates.sort((a, b) => b.localeCompare(a));
  },

  async get(date) {
    const result = await get(`${PREFIX}${date}.json`, { access: "private", useCache: false });
    if (!result) return null;
    return (await new Response(result.stream).json()) as Briefing;
  },

  async put(briefing) {
    await put(`${PREFIX}${briefing.date}.json`, JSON.stringify(briefing, null, 2) + "\n", {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  },
};
