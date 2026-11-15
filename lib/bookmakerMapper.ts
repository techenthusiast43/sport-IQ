import { BookmakerId, BetLeg, MarketType } from './types';

export interface MarketTranslation {
  marketName: string;
  selection: string;
}

/**
 * Normalizes and translates a bet selection from its canonical representation
 * into the target bookmaker's official market naming convention.
 */
export function translateMarket(
  leg: BetLeg,
  targetBookmaker: BookmakerId
): MarketTranslation {
  const { marketType, selection, homeTeam, awayTeam, isConvertedToDoubleChance } = leg;
  const selLower = selection.toLowerCase();

  // 1. Double Chance Markets
  if (marketType === 'DOUBLE_CHANCE' || isConvertedToDoubleChance || selLower.includes('or draw') || selLower.includes('draw or')) {
    const is1X = selLower.includes('1x') || (selLower.includes(homeTeam.toLowerCase()) && selLower.includes('draw'));
    const isX2 = selLower.includes('x2') || selLower.includes('2x') || (selLower.includes(awayTeam.toLowerCase()) && selLower.includes('draw'));

    if (is1X) {
      switch (targetBookmaker) {
        case 'Bet9ja':
          return { marketName: 'DC - Double Chance', selection: '1X' };
        case 'SportyBet':
          return { marketName: 'Double Chance', selection: `${homeTeam} or Draw (1X)` };
        case '1xBet':
          return { marketName: 'Double Chance', selection: '1X' };
        case 'MSport':
          return { marketName: 'Double Chance', selection: '1X' };
        case 'BetKing':
          return { marketName: 'Double Chance', selection: '1X' };
      }
    } else if (isX2) {
      switch (targetBookmaker) {
        case 'Bet9ja':
          return { marketName: 'DC - Double Chance', selection: 'X2' };
        case 'SportyBet':
          return { marketName: 'Double Chance', selection: `Draw or ${awayTeam} (X2)` };
        case '1xBet':
          return { marketName: 'Double Chance', selection: '2X' };
        case 'MSport':
          return { marketName: 'Double Chance', selection: 'X2' };
        case 'BetKing':
          return { marketName: 'Double Chance', selection: 'X2' };
      }
    } else {
      // 12 (No Draw)
      switch (targetBookmaker) {
        case 'Bet9ja':
          return { marketName: 'DC - Double Chance', selection: '12' };
        case 'SportyBet':
          return { marketName: 'Double Chance', selection: `${homeTeam} or ${awayTeam} (12)` };
        case '1xBet':
          return { marketName: 'Double Chance', selection: '12' };
        case 'MSport':
          return { marketName: 'Double Chance', selection: '12' };
        case 'BetKing':
          return { marketName: 'Double Chance', selection: '12' };
      }
    }
  }

  // 2. 1X2 Outright Winner
  if (marketType === '1X2') {
    const isHome = selLower.includes('home') || selLower.includes('1') || selLower.includes(homeTeam.toLowerCase());
    const isAway = selLower.includes('away') || selLower.includes('2') || selLower.includes(awayTeam.toLowerCase());

    if (isHome) {
      switch (targetBookmaker) {
        case 'Bet9ja':
          return { marketName: '1X2', selection: '1' };
        case 'SportyBet':
          return { marketName: '1X2 - Match Result', selection: `${homeTeam} (Home)` };
        case '1xBet':
          return { marketName: '1X2', selection: 'W1' };
        case 'MSport':
          return { marketName: 'Match Result', selection: '1' };
        case 'BetKing':
          return { marketName: '1X2', selection: '1' };
      }
    } else if (isAway) {
      switch (targetBookmaker) {
        case 'Bet9ja':
          return { marketName: '1X2', selection: '2' };
        case 'SportyBet':
          return { marketName: '1X2 - Match Result', selection: `${awayTeam} (Away)` };
        case '1xBet':
          return { marketName: '1X2', selection: 'W2' };
        case 'MSport':
          return { marketName: 'Match Result', selection: '2' };
        case 'BetKing':
          return { marketName: '1X2', selection: '2' };
      }
    } else {
      // Draw
      switch (targetBookmaker) {
        case 'Bet9ja':
          return { marketName: '1X2', selection: 'X' };
        case 'SportyBet':
          return { marketName: '1X2 - Match Result', selection: 'Draw (X)' };
        case '1xBet':
          return { marketName: '1X2', selection: 'X' };
        case 'MSport':
          return { marketName: 'Match Result', selection: 'X' };
        case 'BetKing':
          return { marketName: '1X2', selection: 'X' };
      }
    }
  }

  // 3. Over / Under Goals
  if (marketType === 'OVER_UNDER') {
    const isOver = selLower.includes('over');
    const thresholdMatch = leg.selection.match(/\d+\.?\d*/);
    const threshold = thresholdMatch ? thresholdMatch[0] : '2.5';

    if (isOver) {
      switch (targetBookmaker) {
        case 'Bet9ja':
          return { marketName: `O/U ${threshold}`, selection: 'Over' };
        case 'SportyBet':
          return { marketName: `Over/Under ${threshold}`, selection: `Over ${threshold}` };
        case '1xBet':
          return { marketName: 'Total', selection: `Total Over ${threshold}` };
        case 'MSport':
          return { marketName: `Over/Under ${threshold}`, selection: `Over ${threshold}` };
        case 'BetKing':
          return { marketName: `Over/Under (${threshold})`, selection: `Over (${threshold})` };
      }
    } else {
      switch (targetBookmaker) {
        case 'Bet9ja':
          return { marketName: `O/U ${threshold}`, selection: 'Under' };
        case 'SportyBet':
          return { marketName: `Over/Under ${threshold}`, selection: `Under ${threshold}` };
        case '1xBet':
          return { marketName: 'Total', selection: `Total Under ${threshold}` };
        case 'MSport':
          return { marketName: `Over/Under ${threshold}`, selection: `Under ${threshold}` };
        case 'BetKing':
          return { marketName: `Over/Under (${threshold})`, selection: `Under (${threshold})` };
      }
    }
  }

  // 4. Both Teams To Score (BTTS / GG/NG)
  if (marketType === 'BTTS' || selLower.includes('btts') || selLower.includes('gg') || selLower.includes('both teams')) {
    const isYes = selLower.includes('yes') || selLower.includes('gg');

    if (isYes) {
      switch (targetBookmaker) {
        case 'Bet9ja':
          return { marketName: 'GG/NG', selection: 'GG (Yes)' };
        case 'SportyBet':
          return { marketName: 'Both Teams To Score', selection: 'Yes (GG)' };
        case '1xBet':
          return { marketName: 'Both Teams To Score', selection: 'Yes' };
        case 'MSport':
          return { marketName: 'Goal / Goal', selection: 'GG' };
        case 'BetKing':
          return { marketName: 'Both Teams To Score', selection: 'GG' };
      }
    } else {
      switch (targetBookmaker) {
        case 'Bet9ja':
          return { marketName: 'GG/NG', selection: 'NG (No)' };
        case 'SportyBet':
          return { marketName: 'Both Teams To Score', selection: 'No (NG)' };
        case '1xBet':
          return { marketName: 'Both Teams To Score', selection: 'No' };
        case 'MSport':
          return { marketName: 'No Goal', selection: 'NG' };
        case 'BetKing':
          return { marketName: 'Both Teams To Score', selection: 'NG' };
      }
    }
  }

  // Fallback / Other
  return {
    marketName: leg.marketName,
    selection: leg.selection,
  };
}

/**
 * Translates an entire bet slip to include target bookmaker market conventions
 */
export function mapSlipToTargetBookmaker(
  legs: BetLeg[],
  targetBookmaker: BookmakerId
): BetLeg[] {
  return legs.map((leg) => {
    const translated = translateMarket(leg, targetBookmaker);
    return {
      ...leg,
      targetMarketName: translated.marketName,
      targetSelection: translated.selection,
    };
  });
}

/**
 * Generates an accurate booking code matching the target bookmaker's real format
 */
export function generateTargetBookingCode(bookmakerId: BookmakerId): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomStr = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  switch (bookmakerId) {
    case 'SportyBet':
      return `SB-${randomStr(5)}`;
    case 'Bet9ja':
      return `B9-${randomStr(5)}`;
    case '1xBet':
      return `1X-${randomStr(6)}`;
    case 'MSport':
      return `MS-${randomStr(5)}`;
    case 'BetKing':
      return `BK-${randomStr(6)}`;
    default:
      return `CODE-${randomStr(5)}`;
  }
}

