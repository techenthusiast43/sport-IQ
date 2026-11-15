import { BetLeg, RiskLevel, MarketType } from './types';

export interface FixtureOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25?: number;
  under25?: number;
  dc1X: number;
  dcX2: number;
  dc12: number;
}

export interface RealFixture {
  id: string;
  sportKey: string;
  league: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  odds: FixtureOdds;
  bookmaker: string;
}

export interface FixturesResult {
  fixtures: RealFixture[];
  source: 'live-api' | 'cached-fixtures';
  cachedAt: string;
  totalAvailable: number;
}

export const SUPPORTED_LEAGUES: { key: string; name: string }[] = [
  { key: 'soccer_epl', name: 'Premier League' },
  { key: 'soccer_spain_la_liga', name: 'La Liga' },
  { key: 'soccer_italy_serie_a', name: 'Serie A' },
  { key: 'soccer_germany_bundesliga', name: 'Bundesliga' },
  { key: 'soccer_france_ligue_one', name: 'Ligue 1' },
  { key: 'soccer_uefa_champs_league', name: 'UEFA Champions League' },
];

// Helper to mathematically derive Double Chance odds from 1X2 odds
export function deriveDoubleChanceOdds(oddsA: number, oddsB: number): number {
  if (!oddsA || !oddsB || oddsA <= 0 || oddsB <= 0) return 1.25;
  // Combined implied probability with slight margin
  const prob = (1 / oddsA) + (1 / oddsB);
  const dcOdds = 1 / (prob * 0.96);
  return Math.max(1.10, Math.min(2.50, Math.round(dcOdds * 100) / 100));
}

// In-memory cache with 15-minute TTL
let fixturesCache: {
  data: RealFixture[];
  source: 'live-api' | 'cached-fixtures';
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Rich fallback dataset of realistic upcoming European fixtures
export const FALLBACK_FIXTURES: RealFixture[] = [
  {
    id: 'epl-ars-che',
    sportKey: 'soccer_epl',
    league: 'Premier League',
    kickoff: 'Today 20:00',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    odds: {
      homeWin: 1.88,
      draw: 3.60,
      awayWin: 4.10,
      over25: 1.78,
      under25: 2.05,
      dc1X: deriveDoubleChanceOdds(1.88, 3.60),
      dcX2: deriveDoubleChanceOdds(3.60, 4.10),
      dc12: deriveDoubleChanceOdds(1.88, 4.10),
    },
    bookmaker: 'Pinnacle',
  },
  {
    id: 'epl-mci-new',
    sportKey: 'soccer_epl',
    league: 'Premier League',
    kickoff: 'Saturday 15:00',
    homeTeam: 'Manchester City',
    awayTeam: 'Newcastle United',
    odds: {
      homeWin: 1.45,
      draw: 4.80,
      awayWin: 6.50,
      over25: 1.55,
      under25: 2.45,
      dc1X: deriveDoubleChanceOdds(1.45, 4.80),
      dcX2: deriveDoubleChanceOdds(4.80, 6.50),
      dc12: deriveDoubleChanceOdds(1.45, 6.50),
    },
    bookmaker: 'Betfair',
  },
  {
    id: 'epl-liv-sou',
    sportKey: 'soccer_epl',
    league: 'Premier League',
    kickoff: 'Sunday 16:30',
    homeTeam: 'Liverpool',
    awayTeam: 'Southampton',
    odds: {
      homeWin: 1.28,
      draw: 5.90,
      awayWin: 9.80,
      over25: 1.42,
      under25: 2.85,
      dc1X: deriveDoubleChanceOdds(1.28, 5.90),
      dcX2: deriveDoubleChanceOdds(5.90, 9.80),
      dc12: deriveDoubleChanceOdds(1.28, 9.80),
    },
    bookmaker: 'Pinnacle',
  },
  {
    id: 'laliga-rma-val',
    sportKey: 'soccer_spain_la_liga',
    league: 'La Liga',
    kickoff: 'Saturday 21:00',
    homeTeam: 'Real Madrid',
    awayTeam: 'Valencia',
    odds: {
      homeWin: 1.35,
      draw: 5.20,
      awayWin: 8.50,
      over25: 1.62,
      under25: 2.30,
      dc1X: deriveDoubleChanceOdds(1.35, 5.20),
      dcX2: deriveDoubleChanceOdds(5.20, 8.50),
      dc12: deriveDoubleChanceOdds(1.35, 8.50),
    },
    bookmaker: 'Betfair',
  },
  {
    id: 'laliga-bar-get',
    sportKey: 'soccer_spain_la_liga',
    league: 'La Liga',
    kickoff: 'Sunday 21:00',
    homeTeam: 'Barcelona',
    awayTeam: 'Getafe',
    odds: {
      homeWin: 1.30,
      draw: 5.50,
      awayWin: 9.50,
      over25: 1.58,
      under25: 2.38,
      dc1X: deriveDoubleChanceOdds(1.30, 5.50),
      dcX2: deriveDoubleChanceOdds(5.50, 9.50),
      dc12: deriveDoubleChanceOdds(1.30, 9.50),
    },
    bookmaker: 'DraftKings',
  },
  {
    id: 'bundes-lev-dor',
    sportKey: 'soccer_germany_bundesliga',
    league: 'Bundesliga',
    kickoff: 'Saturday 15:30',
    homeTeam: 'Bayer Leverkusen',
    awayTeam: 'Borussia Dortmund',
    odds: {
      homeWin: 2.15,
      draw: 3.75,
      awayWin: 3.10,
      over25: 1.50,
      under25: 2.55,
      dc1X: deriveDoubleChanceOdds(2.15, 3.75),
      dcX2: deriveDoubleChanceOdds(3.75, 3.10),
      dc12: deriveDoubleChanceOdds(2.15, 3.10),
    },
    bookmaker: 'Pinnacle',
  },
  {
    id: 'bundes-bay-fra',
    sportKey: 'soccer_germany_bundesliga',
    league: 'Bundesliga',
    kickoff: 'Sunday 17:30',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Frankfurt',
    odds: {
      homeWin: 1.25,
      draw: 6.50,
      awayWin: 10.00,
      over25: 1.36,
      under25: 3.10,
      dc1X: deriveDoubleChanceOdds(1.25, 6.50),
      dcX2: deriveDoubleChanceOdds(6.50, 10.00),
      dc12: deriveDoubleChanceOdds(1.25, 10.00),
    },
    bookmaker: 'Betfair',
  },
  {
    id: 'seriea-int-nap',
    sportKey: 'soccer_italy_serie_a',
    league: 'Serie A',
    kickoff: 'Sunday 18:00',
    homeTeam: 'Inter Milan',
    awayTeam: 'Napoli',
    odds: {
      homeWin: 1.95,
      draw: 3.45,
      awayWin: 3.90,
      over25: 1.85,
      under25: 1.95,
      dc1X: deriveDoubleChanceOdds(1.95, 3.45),
      dcX2: deriveDoubleChanceOdds(3.45, 3.90),
      dc12: deriveDoubleChanceOdds(1.95, 3.90),
    },
    bookmaker: 'DraftKings',
  },
  {
    id: 'seriea-juv-mil',
    sportKey: 'soccer_italy_serie_a',
    league: 'Serie A',
    kickoff: 'Sunday 20:45',
    homeTeam: 'Juventus',
    awayTeam: 'AC Milan',
    odds: {
      homeWin: 2.25,
      draw: 3.25,
      awayWin: 3.30,
      over25: 2.10,
      under25: 1.72,
      dc1X: deriveDoubleChanceOdds(2.25, 3.25),
      dcX2: deriveDoubleChanceOdds(3.25, 3.30),
      dc12: deriveDoubleChanceOdds(2.25, 3.30),
    },
    bookmaker: 'Pinnacle',
  },
  {
    id: 'ucl-psg-bay',
    sportKey: 'soccer_uefa_champs_league',
    league: 'UEFA Champions League',
    kickoff: 'Tuesday 21:00',
    homeTeam: 'Paris Saint-Germain',
    awayTeam: 'Bayern Munich',
    odds: {
      homeWin: 2.70,
      draw: 3.65,
      awayWin: 2.45,
      over25: 1.60,
      under25: 2.35,
      dc1X: deriveDoubleChanceOdds(2.70, 3.65),
      dcX2: deriveDoubleChanceOdds(3.65, 2.45),
      dc12: deriveDoubleChanceOdds(2.70, 2.45),
    },
    bookmaker: 'Betfair',
  },
];

/**
 * Fetches upcoming fixtures from The Odds API v4 across major football leagues.
 * Employs a 15-minute in-memory cache to conserve API quota and provides
 * a high-fidelity fallback dataset if API key is missing or rate limited.
 */
export async function getUpcomingFixtures(forceRefresh = false): Promise<FixturesResult> {
  const now = Date.now();

  // 1. Check in-memory cache
  if (!forceRefresh && fixturesCache && now - fixturesCache.timestamp < CACHE_TTL_MS) {
    return {
      fixtures: fixturesCache.data,
      source: fixturesCache.source,
      cachedAt: new Date(fixturesCache.timestamp).toISOString(),
      totalAvailable: fixturesCache.data.length,
    };
  }

  const apiKey = process.env.ODDS_API_KEY?.trim();

  // 2. Fallback when ODDS_API_KEY is missing or template default
  if (!apiKey || apiKey === 'your_odds_api_key_here') {
    fixturesCache = {
      data: FALLBACK_FIXTURES,
      source: 'cached-fixtures',
      timestamp: now,
    };

    return {
      fixtures: FALLBACK_FIXTURES,
      source: 'cached-fixtures',
      cachedAt: new Date(now).toISOString(),
      totalAvailable: FALLBACK_FIXTURES.length,
    };
  }

  // 3. Attempt live fetch from The Odds API across top leagues
  try {
    const fetchedFixtures: RealFixture[] = [];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // Fetch primary leagues in parallel
    const leaguePromises = SUPPORTED_LEAGUES.slice(0, 4).map(async ({ key, name }) => {
      const url = `https://api.the-odds-api.com/v4/sports/${key}/odds/?regions=eu&markets=h2h,totals&oddsFormat=decimal&apiKey=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        throw new Error(`The Odds API returned status ${res.status} for ${key}`);
      }

      const events = await res.json();
      if (!Array.isArray(events)) return [];

      return events.slice(0, 3).map((event: any): RealFixture | null => {
        const homeTeam = event.home_team;
        const awayTeam = event.away_team;
        const kickoffDate = new Date(event.commence_time);
        const kickoff = `${kickoffDate.toLocaleDateString([], { weekday: 'short' })} ${kickoffDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        // Extract best odds from first bookmaker
        const bookmaker = event.bookmakers?.[0] || {};
        const h2hMarket = bookmaker.markets?.find((m: any) => m.key === 'h2h');
        const totalsMarket = bookmaker.markets?.find((m: any) => m.key === 'totals');

        const homeOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === homeTeam);
        const awayOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === awayTeam);
        const drawOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === 'Draw');

        const overOutcome = totalsMarket?.outcomes?.find((o: any) => o.name === 'Over');
        const underOutcome = totalsMarket?.outcomes?.find((o: any) => o.name === 'Under');

        const homeWin = homeOutcome?.price || 1.85;
        const draw = drawOutcome?.price || 3.40;
        const awayWin = awayOutcome?.price || 3.80;

        return {
          id: event.id || `live-${key}-${homeTeam}-${awayTeam}`,
          sportKey: key,
          league: name,
          kickoff,
          homeTeam,
          awayTeam,
          odds: {
            homeWin,
            draw,
            awayWin,
            over25: overOutcome?.price || 1.75,
            under25: underOutcome?.price || 2.05,
            dc1X: deriveDoubleChanceOdds(homeWin, draw),
            dcX2: deriveDoubleChanceOdds(draw, awayWin),
            dc12: deriveDoubleChanceOdds(homeWin, awayWin),
          },
          bookmaker: bookmaker.title || 'European Bookmaker',
        };
      }).filter(Boolean) as RealFixture[];
    });

    const results = await Promise.allSettled(leaguePromises);
    clearTimeout(timeoutId);

    for (const r of results) {
      if (r.status === 'fulfilled') {
        fetchedFixtures.push(...r.value);
      }
    }

    if (fetchedFixtures.length > 0) {
      fixturesCache = {
        data: fetchedFixtures,
        source: 'live-api',
        timestamp: now,
      };

      return {
        fixtures: fetchedFixtures,
        source: 'live-api',
        cachedAt: new Date(now).toISOString(),
        totalAvailable: fetchedFixtures.length,
      };
    }
  } catch (err: unknown) {
    console.warn('The Odds API live fetch failed or timed out; utilizing cached fixtures:', err);
  }

  // Fallback if live fetch failed
  fixturesCache = {
    data: FALLBACK_FIXTURES,
    source: 'cached-fixtures',
    timestamp: now,
  };

  return {
    fixtures: FALLBACK_FIXTURES,
    source: 'cached-fixtures',
    cachedAt: new Date(now).toISOString(),
    totalAvailable: FALLBACK_FIXTURES.length,
  };
}

