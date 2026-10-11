export const TOPICS = ["technology", "us-stocks", "ai", "epl", "arlington"] as const;
export type Topic = (typeof TOPICS)[number];
export interface Source { name: string; url: string; }
export interface BriefingItem { id: string; topic: Topic; title: string; summary: string; source: Source; }
export interface Briefing { date: string; generatedAt: string; items: BriefingItem[]; }

export const TOPIC_META: Record<Topic, { label: string; emoji: string }> = {
  technology: { label: "Technology", emoji: "💻" },
  "us-stocks": { label: "US Stocks", emoji: "📈" },
  ai: { label: "AI", emoji: "🤖" },
  epl: { label: "EPL", emoji: "⚽" },
  arlington: { label: "Arlington, VA", emoji: "📍" },
};

const SAMPLE_BRIEFING: Briefing = {
  date: "2026-10-11",
  generatedAt: "2026-10-11T12:02:00.000Z",
  items: [
    {
      id: "ai-foundation-round",
      topic: "ai",
      title: "Frontier lab closes $12B round at a $260B valuation",
      summary:
        "A leading AI lab raised fresh capital led by a sovereign wealth fund, nearly doubling its valuation from last year. The round earmarks most of the proceeds for data-center buildout and custom inference silicon. Investors are betting that enterprise agent deployments will drive the next leg of revenue growth.",
      source: { name: "The Information", url: "https://www.theinformation.com/" },
    },
    {
      id: "tech-chip-export",
      topic: "technology",
      title: "New export rules reshape the advanced-chip supply chain",
      summary:
        "Updated trade rules widen restrictions on high-bandwidth memory and the tools used to make it. Suppliers are rerouting orders and pulling forward shipments ahead of the compliance deadline. Analysts expect margin pressure for equipment makers through the first half of next year.",
      source: { name: "TechCrunch", url: "https://techcrunch.com/" },
    },
    {
      id: "stocks-cpi-reaction",
      topic: "us-stocks",
      title: "Stocks drift higher as cooler inflation revives rate-cut bets",
      summary:
        "Equities edged up after the latest inflation print came in below forecasts, lifting expectations for a cut at the next policy meeting. Rate-sensitive sectors led the gains while energy lagged on softer crude prices. Treasury yields slipped as traders repriced the path of policy.",
      source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
    },
    {
      id: "stocks-earnings-megacap",
      topic: "us-stocks",
      title: "Megacap earnings season opens with cloud and ad spend in focus",
      summary:
        "The first wave of big-tech results lands this week, with investors watching cloud growth and the payoff from heavy AI capital spending. Options markets are pricing larger-than-usual post-earnings swings. Guidance on margins may matter more than the headline beats.",
      source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
    },
    {
      id: "epl-weekend-fixtures",
      topic: "epl",
      title: "Title race tightens ahead of a crowded weekend of fixtures",
      summary:
        "Only two points separate the top three going into a round that features a marquee derby. Several clubs are managing injuries picked up during the international break. A congested schedule before the next continental midweek adds to the rotation calculus for managers.",
      source: { name: "BBC Sport", url: "https://www.bbc.com/sport/football/premier-league" },
    },
    {
      id: "arlington-metro-plan",
      topic: "arlington",
      title: "County advances plan to add housing near Metro corridors",
      summary:
        "The county board moved ahead with zoning changes meant to add homes along transit corridors in Arlington. Supporters point to affordability and ridership, while some neighbors raised concerns about parking and density. A final vote is expected after the next round of public comment.",
      source: { name: "ARLnow", url: "https://www.arlnow.com/" },
    },
  ],
};

export async function getLatestBriefing(): Promise<Briefing | null> {
  return SAMPLE_BRIEFING;
}
