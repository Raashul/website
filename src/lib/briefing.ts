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

const SAMPLE_BRIEFINGS: Briefing[] = [
  {
    date: "2026-10-07",
    generatedAt: "2026-10-07T12:01:00.000Z",
    items: [
      {
        id: "2026-10-07-ai-open-weights",
        topic: "ai",
        title: "Startup releases open-weight model that rivals closed frontier systems",
        summary:
          "A well-funded startup published the weights for a model it claims matches last year's closed frontier systems on reasoning benchmarks. The permissive license lets companies fine-tune and self-host without usage fees. Rivals dismissed the benchmark scores as cherry-picked while enterprises rushed to test it.",
        source: { name: "The Information", url: "https://www.theinformation.com/" },
      },
      {
        id: "2026-10-07-tech-antitrust-ruling",
        topic: "technology",
        title: "Appeals court narrows landmark antitrust remedy against app store",
        summary:
          "An appeals court trimmed the sweeping remedies ordered against a dominant app store, sparing the company a forced breakup. It left intact rules requiring support for third-party payment links. Developers called the decision a partial win that still leaves core commissions untouched.",
        source: { name: "TechCrunch", url: "https://techcrunch.com/" },
      },
      {
        id: "2026-10-07-stocks-jobs-report",
        topic: "us-stocks",
        title: "Markets slip as a hot jobs report dims near-term rate-cut hopes",
        summary:
          "Equities pulled back after payrolls came in far above forecasts, pushing traders to reprice the odds of a cut this quarter. Financials outperformed on firmer yields while homebuilders sagged. The dollar strengthened against most major currencies.",
        source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
      },
      {
        id: "2026-10-07-stocks-ipo-pipeline",
        topic: "us-stocks",
        title: "A crowded IPO pipeline tests investor appetite for new listings",
        summary:
          "Several venture-backed companies set terms for offerings this month, the busiest stretch for new listings in two years. Bankers say demand hinges on whether the first few deals hold their opening price. A weak debut could push the rest to delay.",
        source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
      },
      {
        id: "2026-10-07-epl-transfer-window",
        topic: "epl",
        title: "Promoted side stuns early leaders with a late winner",
        summary:
          "A newly promoted club took three points off one of the early-season front-runners thanks to a stoppage-time strike. The result leaves the title favorites with a surprise early gap to close. The winning manager praised a game plan built around rapid counterattacks.",
        source: { name: "BBC Sport", url: "https://www.bbc.com/sport/football/premier-league" },
      },
      {
        id: "2026-10-07-arlington-schools-budget",
        topic: "arlington",
        title: "School board weighs budget pressures as enrollment shifts",
        summary:
          "The county school board opened hearings on a budget strained by rising staff costs and uneven enrollment across neighborhoods. Administrators floated boundary adjustments to balance crowded and under-filled schools. Parents packed the meeting to object to any redistricting.",
        source: { name: "ARLnow", url: "https://www.arlnow.com/" },
      },
    ],
  },
  {
    date: "2026-10-08",
    generatedAt: "2026-10-08T12:03:00.000Z",
    items: [
      {
        id: "2026-10-08-ai-agent-security",
        topic: "ai",
        title: "Researchers expose prompt-injection flaw across popular AI agents",
        summary:
          "Security researchers showed that hidden instructions in web pages could hijack several widely used AI browsing agents. The attack quietly exfiltrated data the agent had access to during a session. Vendors issued guidance to sandbox tool use while patches roll out.",
        source: { name: "TechCrunch", url: "https://techcrunch.com/" },
      },
      {
        id: "2026-10-08-tech-datacenter-power",
        topic: "technology",
        title: "Utilities warn data-center demand is straining the grid",
        summary:
          "Regional utilities told regulators that clustered data-center projects are outpacing their ability to add transmission capacity. Some operators are signing deals for dedicated gas and nuclear power to avoid the queue. Consumer advocates worry the buildout will lift household rates.",
        source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
      },
      {
        id: "2026-10-08-stocks-bank-earnings",
        topic: "us-stocks",
        title: "Big banks kick off earnings with resilient lending and soft trading",
        summary:
          "The largest banks reported steady net interest income but a pullback in trading revenue from a quiet quarter. Executives struck a cautious tone on loan losses tied to commercial real estate. Shares were mixed as investors parsed guidance on buybacks.",
        source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
      },
      {
        id: "2026-10-08-ai-chip-roadmap",
        topic: "ai",
        title: "Chipmaker pulls forward next-gen accelerator to answer demand",
        summary:
          "A leading accelerator vendor said it would ship its next architecture months ahead of schedule as cloud providers lock in orders through next year. The new parts promise large gains in memory bandwidth for inference. Supply remains the gating factor despite the earlier date.",
        source: { name: "The Information", url: "https://www.theinformation.com/" },
      },
      {
        id: "2026-10-08-epl-var-controversy",
        topic: "epl",
        title: "Disallowed goal reignites debate over video review",
        summary:
          "A tight offside call overturned a late equalizer and reopened the long-running argument over video review in the league. The losing manager said the delay drained the match of momentum. Officials defended the decision as technically correct if slow.",
        source: { name: "BBC Sport", url: "https://www.bbc.com/sport/football/premier-league" },
      },
      {
        id: "2026-10-08-arlington-bike-lanes",
        topic: "arlington",
        title: "County opens a protected bike corridor through Rosslyn",
        summary:
          "Arlington cut the ribbon on a protected bike corridor connecting Rosslyn to neighboring commercial districts. Officials framed it as a link in a longer regional trail network. Some business owners worried about the loss of curbside parking during the transition.",
        source: { name: "ARLnow", url: "https://www.arlnow.com/" },
      },
    ],
  },
  {
    date: "2026-10-09",
    generatedAt: "2026-10-09T11:59:00.000Z",
    items: [
      {
        id: "2026-10-09-ai-enterprise-deals",
        topic: "ai",
        title: "Software giant bundles AI agents into its core suite at no extra cost",
        summary:
          "A major enterprise-software vendor said it would fold AI agents into its flagship suite rather than charge a separate add-on. The move pressures standalone AI startups that sell the same workflows. Analysts expect rivals to match the bundling within a quarter.",
        source: { name: "The Information", url: "https://www.theinformation.com/" },
      },
      {
        id: "2026-10-09-tech-privacy-law",
        topic: "technology",
        title: "New state privacy law forces changes to ad-tracking defaults",
        summary:
          "A sweeping state privacy law took effect requiring opt-in consent before cross-site tracking. Large platforms rolled out new consent prompts to comply nationwide rather than per state. Advertisers are bracing for weaker targeting and higher acquisition costs.",
        source: { name: "TechCrunch", url: "https://techcrunch.com/" },
      },
      {
        id: "2026-10-09-stocks-energy-rally",
        topic: "us-stocks",
        title: "Energy shares lead the market as crude jumps on supply fears",
        summary:
          "Oil majors rallied after a supply disruption pushed crude to a multi-month high. The move lifted the broader index even as rate-sensitive sectors lagged. Traders warned the gains could reverse quickly if the disruption proves short-lived.",
        source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
      },
      {
        id: "2026-10-09-stocks-retail-sales",
        topic: "us-stocks",
        title: "Soft retail-sales data points to a cooling consumer",
        summary:
          "Retail sales came in below expectations, adding to signs that consumer spending is losing steam heading into the holidays. Discount chains held up better than discretionary retailers. Economists said the figures strengthen the case for a year-end rate cut.",
        source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
      },
      {
        id: "2026-10-09-epl-injury-crisis",
        topic: "epl",
        title: "Title contender faces defensive crisis after international break",
        summary:
          "One of the title contenders returned from the international break with three defenders sidelined by injury. The manager hinted at reshuffling midfielders into the back line for the coming fixtures. The club is weighing an emergency loan before the registration deadline.",
        source: { name: "BBC Sport", url: "https://www.bbc.com/sport/football/premier-league" },
      },
      {
        id: "2026-10-09-arlington-restaurant-scene",
        topic: "arlington",
        title: "Clarendon welcomes a wave of new restaurant openings",
        summary:
          "A cluster of restaurant openings is reshaping the dining scene in Clarendon, filling storefronts that had sat empty since the pandemic. Owners cited falling rents and renewed foot traffic as reasons to bet on the neighborhood. The county fast-tracked outdoor-seating permits to help.",
        source: { name: "ARLnow", url: "https://www.arlnow.com/" },
      },
    ],
  },
  {
    date: "2026-10-10",
    generatedAt: "2026-10-10T12:02:00.000Z",
    items: [
      {
        id: "2026-10-10-ai-regulation-framework",
        topic: "ai",
        title: "Regulators unveil a tiered framework for high-risk AI systems",
        summary:
          "Officials proposed a tiered framework that would impose audits and incident reporting on the highest-risk AI deployments. Lower-risk tools would face only transparency rules. Industry groups welcomed the clarity while warning the audit burden could slow smaller firms.",
        source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
      },
      {
        id: "2026-10-10-tech-foldable-launch",
        topic: "technology",
        title: "Hardware maker debuts a thinner foldable with a day-long battery",
        summary:
          "A major hardware maker unveiled its thinnest foldable yet, pairing a lighter hinge with a battery it says lasts a full day of heavy use. Reviewers praised the crease reduction but flagged the premium price. Pre-orders open ahead of the holiday quarter.",
        source: { name: "TechCrunch", url: "https://techcrunch.com/" },
      },
      {
        id: "2026-10-10-stocks-cpi-cooldown",
        topic: "us-stocks",
        title: "Stocks climb as inflation cools more than forecast",
        summary:
          "Equities advanced after a softer-than-expected inflation reading revived bets on a near-term rate cut. Technology and real estate led the rally while energy slipped with crude. Treasury yields fell across the curve as traders repriced policy.",
        source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
      },
      {
        id: "2026-10-10-ai-model-funding",
        topic: "ai",
        title: "Robotics lab raises mega-round to train foundation models for machines",
        summary:
          "A robotics lab closed a large round to build foundation models that control physical machines from shared sensor data. Investors are betting that a single model can generalize across warehouse and household tasks. The company plans to license the model to hardware partners.",
        source: { name: "The Information", url: "https://www.theinformation.com/" },
      },
      {
        id: "2026-10-10-epl-managerial-change",
        topic: "epl",
        title: "Struggling club parts ways with its manager after winless run",
        summary:
          "A club near the relegation zone dismissed its manager following a winless run that left it short of expectations. The board installed a caretaker while it sounds out replacements. Supporters were split on whether the squad or the tactics were to blame.",
        source: { name: "BBC Sport", url: "https://www.bbc.com/sport/football/premier-league" },
      },
      {
        id: "2026-10-10-arlington-metro-weekend",
        topic: "arlington",
        title: "Weekend Metro closures to disrupt Orange and Silver line service",
        summary:
          "The transit authority announced weekend track work that will shut several Arlington stations on the Orange and Silver lines. Shuttle buses will bridge the closed segments during the project. Officials urged riders to budget extra travel time through the end of the month.",
        source: { name: "ARLnow", url: "https://www.arlnow.com/" },
      },
    ],
  },
  {
    date: "2026-10-11",
    generatedAt: "2026-10-11T12:02:00.000Z",
    items: [
      {
        id: "2026-10-11-ai-foundation-round",
        topic: "ai",
        title: "Frontier lab closes $12B round at a $260B valuation",
        summary:
          "A leading AI lab raised fresh capital led by a sovereign wealth fund, nearly doubling its valuation from last year. The round earmarks most of the proceeds for data-center buildout and custom inference silicon. Investors are betting that enterprise agent deployments will drive the next leg of revenue growth.",
        source: { name: "The Information", url: "https://www.theinformation.com/" },
      },
      {
        id: "2026-10-11-tech-chip-export",
        topic: "technology",
        title: "New export rules reshape the advanced-chip supply chain",
        summary:
          "Updated trade rules widen restrictions on high-bandwidth memory and the tools used to make it. Suppliers are rerouting orders and pulling forward shipments ahead of the compliance deadline. Analysts expect margin pressure for equipment makers through the first half of next year.",
        source: { name: "TechCrunch", url: "https://techcrunch.com/" },
      },
      {
        id: "2026-10-11-stocks-cpi-reaction",
        topic: "us-stocks",
        title: "Stocks drift higher as cooler inflation revives rate-cut bets",
        summary:
          "Equities edged up after the latest inflation print came in below forecasts, lifting expectations for a cut at the next policy meeting. Rate-sensitive sectors led the gains while energy lagged on softer crude prices. Treasury yields slipped as traders repriced the path of policy.",
        source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
      },
      {
        id: "2026-10-11-stocks-earnings-megacap",
        topic: "us-stocks",
        title: "Megacap earnings season opens with cloud and ad spend in focus",
        summary:
          "The first wave of big-tech results lands this week, with investors watching cloud growth and the payoff from heavy AI capital spending. Options markets are pricing larger-than-usual post-earnings swings. Guidance on margins may matter more than the headline beats.",
        source: { name: "Bloomberg", url: "https://www.bloomberg.com/markets" },
      },
      {
        id: "2026-10-11-epl-weekend-fixtures",
        topic: "epl",
        title: "Title race tightens ahead of a crowded weekend of fixtures",
        summary:
          "Only two points separate the top three going into a round that features a marquee derby. Several clubs are managing injuries picked up during the international break. A congested schedule before the next continental midweek adds to the rotation calculus for managers.",
        source: { name: "BBC Sport", url: "https://www.bbc.com/sport/football/premier-league" },
      },
      {
        id: "2026-10-11-arlington-metro-plan",
        topic: "arlington",
        title: "County advances plan to add housing near Metro corridors",
        summary:
          "The county board moved ahead with zoning changes meant to add homes along transit corridors in Arlington. Supporters point to affordability and ridership, while some neighbors raised concerns about parking and density. A final vote is expected after the next round of public comment.",
        source: { name: "ARLnow", url: "https://www.arlnow.com/" },
      },
    ],
  },
];

export async function getBriefingDates(): Promise<string[]> {
  return SAMPLE_BRIEFINGS.map((b) => b.date).sort((a, b) => b.localeCompare(a));
}

export async function getBriefing(date: string): Promise<Briefing | null> {
  return SAMPLE_BRIEFINGS.find((b) => b.date === date) ?? null;
}
