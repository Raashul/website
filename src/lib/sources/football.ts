import "server-only";
import type { BriefingItem } from "@/lib/briefing";

const BASE = "https://api.football-data.org/v4/competitions/PL";
const TABLES_URL = "https://www.premierleague.com/tables";
const FIXTURES_URL = "https://www.premierleague.com/fixtures";

interface TableRow {
  position: number;
  team: { name: string; shortName?: string };
  points: number;
  playedGames: number;
}

interface Match {
  utcDate: string;
  homeTeam: { shortName?: string; name: string };
  awayTeam: { shortName?: string; name: string };
}

function authHeaders(): HeadersInit {
  const token = process.env.FOOTBALL_API_KEY;
  if (!token) throw new Error("FOOTBALL_API_KEY is not set");
  return { "X-Auth-Token": token };
}

function teamName(team: { shortName?: string; name: string }): string {
  return team.shortName ?? team.name;
}

function formatKickoff(utcDate: string): string {
  return new Date(utcDate).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

async function standingsItem(date: string): Promise<BriefingItem | null> {
  const res = await fetch(`${BASE}/standings`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`standings HTTP ${res.status}`);
  const data = (await res.json()) as { standings?: { table?: TableRow[] }[] };
  const table = data.standings?.[0]?.table;
  if (!table || table.length === 0) return null;

  const top = table.slice(0, 4);
  const leader = teamName(top[0].team);
  const summary = top
    .map((row) => `${row.position}. ${teamName(row.team)} (${row.points} pts, ${row.playedGames} played)`)
    .join("; ");

  return {
    id: `${date}-epl-standings`,
    topic: "epl",
    title: `Premier League: ${leader} lead the table`,
    summary: `${summary}.`,
    source: { name: "Premier League", url: TABLES_URL },
  };
}

async function fixturesItem(date: string): Promise<BriefingItem | null> {
  const res = await fetch(`${BASE}/matches?status=SCHEDULED`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`matches HTTP ${res.status}`);
  const data = (await res.json()) as { matches?: Match[] };
  const upcoming = (data.matches ?? []).slice(0, 4);
  if (upcoming.length === 0) return null;

  const summary = upcoming
    .map((m) => `${teamName(m.homeTeam)} vs ${teamName(m.awayTeam)} (${formatKickoff(m.utcDate)})`)
    .join("; ");

  return {
    id: `${date}-epl-fixtures`,
    topic: "epl",
    title: "Premier League: upcoming fixtures",
    summary: `Next matches — ${summary}.`,
    source: { name: "Premier League", url: FIXTURES_URL },
  };
}

export async function fetchEplItems(date: string): Promise<BriefingItem[]> {
  const items: BriefingItem[] = [];
  try {
    const standings = await standingsItem(date);
    if (standings) items.push(standings);
  } catch (err) {
    console.error(`[epl:standings] failed: ${(err as Error).message}`);
  }
  try {
    const fixtures = await fixturesItem(date);
    if (fixtures) items.push(fixtures);
  } catch (err) {
    console.error(`[epl:fixtures] failed: ${(err as Error).message}`);
  }
  return items;
}
