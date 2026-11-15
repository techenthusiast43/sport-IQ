import { BetLeg, MarketType } from './types';
import { generateTargetBookingCode } from './bookmakerMapper';

export interface SportybetSelection {
  eventId: string;
  marketId: string;
  outcomeId: string;
  specifier?: string;
}

export interface SportybetEvent {
  eventId: string;
  gameId?: string;
  homeTeamName: string;
  awayTeamName: string;
  tournamentName?: string;
  markets: Array<{
    id: string;
    desc: string;
    specifier?: string;
    outcomes: Array<{
      id: string;
      desc: string;
      odds: string;
    }>;
  }>;
}

export interface SportybetRegistrationResult {
  bookingCode: string;
  isOfficialCode: boolean;
  unmatchedLegs: string[];
  shareUrl?: string;
  message: string;
  matchedCount: number;
  totalLegs: number;
}

const SPORTY_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Referer: 'https://www.sportybet.com/ng/sport/football',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  operid: '2',
};

// In-memory cache for SportyBet upcoming prematch events (5-minute TTL)
let cachedEvents: SportybetEvent[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Normalizes football team names for fuzzy string matching across diverse providers.
 */
function normalizeTeamName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(fc|cf|cd|afc|sc|ac|as|ssc|rb|1\.)\b/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Computes a similarity score between two team names (0 to 1).
 */
function calculateTeamMatchScore(rawA: string, rawB: string): number {
  const normA = normalizeTeamName(rawA);
  const normB = normalizeTeamName(rawB);

  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;
  if (normA.includes(normB) || normB.includes(normA)) return 0.92;

  // Well-known football team alias pairs
  const KNOWN_ALIASES: [string, string][] = [
    ['man city', 'manchester city'],
    ['man utd', 'manchester united'],
    ['wolves', 'wolverhampton'],
    ['spurs', 'tottenham'],
    ['nottingham', 'nottingham forest'],
    ['nottm forest', 'nottingham forest'],
    ['psg', 'paris saint germain'],
    ['inter', 'inter milan'],
    ['dortmund', 'borussia dortmund'],
    ['leverkusen', 'bayer leverkusen'],
    ['bilbao', 'athletic bilbao'],
    ['athletic club', 'athletic bilbao'],
    ['atletico', 'atletico madrid'],
    ['roma', 'as roma'],
    ['bayern', 'bayern munich'],
    ['leipzig', 'rb leipzig'],
    ['sporting', 'sporting cp'],
    ['sunderland', 'sunderland afc'],
  ];

  for (const [x, y] of KNOWN_ALIASES) {
    if (
      (normA.includes(x) && normB.includes(y)) ||
      (normA.includes(y) && normB.includes(x))
    ) {
      return 0.95;
    }
  }

  // Jaccard word token similarity
  const wordsA = new Set(normA.split(' ').filter((w) => w.length > 2));
  const wordsB = new Set(normB.split(' ').filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersect = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersect++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? intersect / union : 0;
}

/**
 * Fetches upcoming prematch football events from SportyBet Nigeria's public API.
 */
export async function getSportybetUpcomingEvents(forceRefresh = false): Promise<SportybetEvent[]> {
  const now = Date.now();
  if (!forceRefresh && cachedEvents && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedEvents;
  }

  const events: SportybetEvent[] = [];

  // Attempt 1: pcUpcomingEvents with markets 1 (1X2), 10 (Double Chance), 18 (Over/Under), 29 (GG/NG)
  try {
    const pcUrl =
      'https://www.sportybet.com/api/ng/factsCenter/pcUpcomingEvents?sportId=sr:sport:1&marketId=1,10,18,29&pageSize=100&pageNum=1';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(pcUrl, {
      method: 'GET',
      headers: SPORTY_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json && json.bizCode === 10000 && json.data?.tournaments) {
        for (const t of json.data.tournaments) {
          for (const ev of t.events || []) {
            events.push({
              eventId: ev.eventId,
              gameId: ev.gameId,
              homeTeamName: ev.homeTeamName,
              awayTeamName: ev.awayTeamName,
              tournamentName: t.name,
              markets: ev.markets || [],
            });
          }
        }
      }
    }
  } catch (err: unknown) {
    console.warn('SportyBet pcUpcomingEvents fetch failed or timed out:', err);
  }

  // Attempt 2: If PC endpoint returned 0 events, try wapUpcomingEvents
  if (events.length === 0) {
    try {
      const wapUrl =
        'https://www.sportybet.com/api/ng/factsCenter/wapUpcomingEvents?sportId=sr:sport:1&marketId=1,10,18,29&pageSize=100';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(wapUrl, {
        method: 'GET',
        headers: SPORTY_HEADERS,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json && json.bizCode === 10000 && Array.isArray(json.data)) {
          for (const ev of json.data) {
            events.push({
              eventId: ev.eventId,
              gameId: ev.gameId,
              homeTeamName: ev.homeTeamName,
              awayTeamName: ev.awayTeamName,
              tournamentName: ev.sport?.category?.tournament?.name,
              markets: ev.markets || [],
            });
          }
        }
      }
    } catch (err: unknown) {
      console.warn('SportyBet wapUpcomingEvents fallback warning:', err);
    }
  }

  if (events.length > 0) {
    cachedEvents = events;
    cacheTimestamp = now;
  }

  return events;
}

/**
 * Resolves a BetLeg into SportyBet's specific eventId, marketId, outcomeId, and specifier.
 */
function matchLegToSportybetSelection(
  leg: BetLeg,
  events: SportybetEvent[]
): SportybetSelection | null {
  // 1. Find matching event by fuzzy-matching both home and away teams
  let bestMatch: SportybetEvent | null = null;
  let highestScore = 0;

  for (const ev of events) {
    const homeScore = calculateTeamMatchScore(leg.homeTeam, ev.homeTeamName);
    const awayScore = calculateTeamMatchScore(leg.awayTeam, ev.awayTeamName);

    // Both teams must show positive correspondence
    if (
      (homeScore >= 0.5 && awayScore >= 0.5) ||
      (homeScore >= 0.8 && awayScore >= 0.4) ||
      (homeScore >= 0.4 && awayScore >= 0.8)
    ) {
      const combinedScore = (homeScore + awayScore) / 2;
      if (combinedScore > highestScore) {
        highestScore = combinedScore;
        bestMatch = ev;
      }
    }
  }

  if (!bestMatch || highestScore < 0.5) {
    return null;
  }

  const { marketType, selection, isConvertedToDoubleChance } = leg;
  const selLower = selection.toLowerCase();

  // 2. Resolve Market & Outcome ID according to SportyBet taxonomy

  // A. Double Chance (Market ID: "10")
  if (
    marketType === 'DOUBLE_CHANCE' ||
    isConvertedToDoubleChance ||
    selLower.includes('or draw') ||
    selLower.includes('draw or') ||
    selLower.includes('1x') ||
    selLower.includes('x2') ||
    selLower.includes('12')
  ) {
    const is1X =
      selLower.includes('1x') ||
      (selLower.includes(leg.homeTeam.toLowerCase()) && selLower.includes('draw'));
    const isX2 =
      selLower.includes('x2') ||
      selLower.includes('2x') ||
      (selLower.includes(leg.awayTeam.toLowerCase()) && selLower.includes('draw'));

    const outcomeId = is1X ? '9' : isX2 ? '11' : '10'; // 9: Home or Draw, 11: Draw or Away, 10: Home or Away
    return {
      eventId: bestMatch.eventId,
      marketId: '10',
      outcomeId,
    };
  }

  // B. 1X2 Match Winner (Market ID: "1")
  if (marketType === '1X2' || selLower.includes('win') || selLower.includes('winner')) {
    const isHome =
      selLower.includes('home') ||
      selLower.includes('1') ||
      selLower.includes(leg.homeTeam.toLowerCase());
    const isAway =
      selLower.includes('away') ||
      selLower.includes('2') ||
      selLower.includes(leg.awayTeam.toLowerCase());

    const outcomeId = isHome ? '1' : isAway ? '3' : '2'; // 1: Home, 2: Draw, 3: Away
    return {
      eventId: bestMatch.eventId,
      marketId: '1',
      outcomeId,
    };
  }

  // C. Over / Under (Market ID: "18")
  if (marketType === 'OVER_UNDER' || selLower.includes('over') || selLower.includes('under')) {
    const isOver = selLower.includes('over');
    const thresholdMatch = leg.selection.match(/\d+\.?\d*/);
    const threshold = thresholdMatch ? thresholdMatch[0] : '2.5';
    const specifier = `total=${threshold}`;

    const outcomeId = isOver ? '12' : '13'; // 12: Over, 13: Under
    return {
      eventId: bestMatch.eventId,
      marketId: '18',
      specifier,
      outcomeId,
    };
  }

  // D. Both Teams to Score / GG-NG (Market ID: "29")
  if (
    marketType === 'BTTS' ||
    selLower.includes('btts') ||
    selLower.includes('gg') ||
    selLower.includes('both teams')
  ) {
    const isYes = selLower.includes('yes') || selLower.includes('gg');
    const outcomeId = isYes ? '74' : '76'; // 74: Yes, 76: No
    return {
      eventId: bestMatch.eventId,
      marketId: '29',
      outcomeId,
    };
  }

  // Default fallback: 1X2 Home
  return {
    eventId: bestMatch.eventId,
    marketId: '1',
    outcomeId: '1',
  };
}

/**
 * Registers an official live SportyBet booking code via POST https://www.sportybet.com/api/ng/orders/share.
 * If matches cannot be resolved or SportyBet rate limits/blocks the request, falls back to a simulated code.
 */
export async function registerSportybetBookingCode(
  legs: BetLeg[]
): Promise<SportybetRegistrationResult> {
  const simulatedCode = generateTargetBookingCode('SportyBet');

  if (!legs || legs.length === 0) {
    return {
      bookingCode: simulatedCode,
      isOfficialCode: false,
      unmatchedLegs: [],
      message: 'No selections provided to register.',
      matchedCount: 0,
      totalLegs: 0,
    };
  }

  // 1. Fetch live upcoming events from SportyBet
  let events: SportybetEvent[] = [];
  try {
    events = await getSportybetUpcomingEvents();
  } catch (err) {
    console.warn('Could not fetch SportyBet upcoming board:', err);
  }

  const matchedSelections: SportybetSelection[] = [];
  const unmatchedLegs: string[] = [];

  // 2. Fuzzy-match each leg to SportyBet's live market taxonomy
  for (const leg of legs) {
    const match = matchLegToSportybetSelection(leg, events);
    if (match) {
      matchedSelections.push(match);
    } else {
      unmatchedLegs.push(`${leg.homeTeam} vs ${leg.awayTeam}`);
    }
  }

  // 3. If at least 1 leg was matched, attempt official registration via SportyBet share API
  if (matchedSelections.length > 0) {
    try {
      const shareUrl = 'https://www.sportybet.com/api/ng/orders/share';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(shareUrl, {
        method: 'POST',
        headers: {
          ...SPORTY_HEADERS,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selections: matchedSelections,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json && json.bizCode === 10000 && json.data?.shareCode) {
          const shareCode: string = json.data.shareCode;
          const shareUrlStr: string =
            json.data.shareURL || `https://www.sportybet.com/ng/?shareCode=${shareCode}`;

          return {
            bookingCode: shareCode,
            isOfficialCode: true,
            unmatchedLegs,
            shareUrl: shareUrlStr,
            message: `Official SportyBet code registered! Verified code ${shareCode} created live on SportyBet servers (${matchedSelections.length}/${legs.length} legs matched).`,
            matchedCount: matchedSelections.length,
            totalLegs: legs.length,
          };
        } else {
          console.warn('SportyBet share API rejected payload:', json?.message || json?.innerMsg);
        }
      }
    } catch (err: unknown) {
      console.warn('SportyBet orders/share request error:', err);
    }
  }

  // 4. Graceful Fallback if unmatched or API unavailable
  const fallbackMessage =
    unmatchedLegs.length > 0
      ? `Preview booking code generated. ${unmatchedLegs.length} fixture(s) not currently listed on SportyBet upcoming board (${unmatchedLegs.slice(0, 2).join(', ')}${unmatchedLegs.length > 2 ? '...' : ''}).`
      : 'Preview booking code generated. SportyBet registration endpoint currently unavailable.';

  return {
    bookingCode: simulatedCode,
    isOfficialCode: false,
    unmatchedLegs,
    message: fallbackMessage,
    matchedCount: matchedSelections.length,
    totalLegs: legs.length,
  };
}
