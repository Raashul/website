import "server-only";
import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import { TOPICS, type Briefing, type BriefingItem, type Topic } from "@/lib/briefing";

export interface BriefingStore {
  listDates(): Promise<string[]>;
  get(date: string): Promise<Briefing | null>;
  put(briefing: Briefing): Promise<void>;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})\.json$/;

// Dev-only backend. Vercel's filesystem is read-only at runtime, so a cloud
// store (Blob/KV) implementing this same interface plugs in here for prod.
const BRIEFINGS_DIR = path.join(process.cwd(), "content", "briefings");

const fileStore: BriefingStore = {
  async listDates() {
    let entries: string[];
    try {
      entries = await readdir(BRIEFINGS_DIR);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
    return entries
      .map((name) => FILE_PATTERN.exec(name)?.[1])
      .filter((date): date is string => date !== undefined)
      .sort((a, b) => b.localeCompare(a));
  },

  async get(date) {
    try {
      const raw = await readFile(path.join(BRIEFINGS_DIR, `${date}.json`), "utf8");
      return JSON.parse(raw) as Briefing;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  },

  async put(briefing) {
    await mkdir(BRIEFINGS_DIR, { recursive: true });
    await writeFile(
      path.join(BRIEFINGS_DIR, `${briefing.date}.json`),
      JSON.stringify(briefing, null, 2) + "\n",
    );
  },
};

export function getBriefingStore(): BriefingStore {
  return fileStore;
}

function fail(message: string): never {
  throw new Error(`Invalid briefing: ${message}`);
}

function parseItem(input: unknown, index: number): BriefingItem {
  if (typeof input !== "object" || input === null) fail(`items[${index}] must be an object`);
  const item = input as Record<string, unknown>;
  const at = (field: string) => `items[${index}].${field}`;

  if (typeof item.id !== "string") fail(`${at("id")} must be a string`);
  if (typeof item.title !== "string") fail(`${at("title")} must be a string`);
  if (typeof item.summary !== "string") fail(`${at("summary")} must be a string`);
  if (typeof item.topic !== "string" || !TOPICS.includes(item.topic as Topic)) {
    fail(`${at("topic")} must be one of ${TOPICS.join(", ")}`);
  }
  if (typeof item.source !== "object" || item.source === null) fail(`${at("source")} must be an object`);
  const source = item.source as Record<string, unknown>;
  if (typeof source.name !== "string") fail(`${at("source.name")} must be a string`);
  if (typeof source.url !== "string") fail(`${at("source.url")} must be a string`);

  return {
    id: item.id,
    topic: item.topic as Topic,
    title: item.title,
    summary: item.summary,
    source: { name: source.name, url: source.url },
  };
}

export function parseBriefing(input: unknown): Briefing {
  if (typeof input !== "object" || input === null) fail("body must be an object");
  const obj = input as Record<string, unknown>;

  if (typeof obj.date !== "string" || !DATE_PATTERN.test(obj.date)) {
    fail("date must be a string matching YYYY-MM-DD");
  }
  if (typeof obj.generatedAt !== "string") fail("generatedAt must be a string");
  if (!Array.isArray(obj.items) || obj.items.length === 0) fail("items must be a non-empty array");

  return {
    date: obj.date,
    generatedAt: obj.generatedAt,
    items: obj.items.map(parseItem),
  };
}
