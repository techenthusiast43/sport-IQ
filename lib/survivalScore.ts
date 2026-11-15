import { BetLeg } from './types';

/**
 * Calculates a realistic AI Survival Score (0-100%) for a sports bet accumulator.
 * Derived from combined market implied probabilities, individual leg odds,
 * and AI heuristic risk weights (variance penalties for High Risk legs).
 */
export function calculateSurvivalScore(legs: BetLeg[]): number {
  if (!legs || legs.length === 0) return 0;

  // Compute weighted survival probability
  const rawProduct = legs.reduce((acc, leg) => {
    const rawImplied = 1 / Math.max(1.05, leg.odds);

    // Apply risk weights
    let weight = 0.98;
    if (leg.riskLevel === 'LOW') {
      weight = 1.06;
    } else if (leg.riskLevel === 'MEDIUM') {
      weight = 0.92;
    } else if (leg.riskLevel === 'HIGH') {
      weight = 0.76;
    }

    if (leg.isConvertedToDoubleChance) {
      weight += 0.05;
    }

    const legSurvivalProb = Math.min(0.94, rawImplied * weight);
    return acc * legSurvivalProb;
  }, 1);

  // Normalize to integer percentage with safety bounds
  const score = Math.round(rawProduct * 100);
  return Math.min(96, Math.max(3, score));
}

/**
 * Returns a descriptive status label and color styling for a survival score
 */
export function getSurvivalTier(score: number): {
  label: string;
  badgeClass: string;
  meterColor: string;
} {
  if (score >= 60) {
    return {
      label: 'Ultra High Survival',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      meterColor: 'bg-emerald-400',
    };
  }
  if (score >= 40) {
    return {
      label: 'Moderate / Balanced',
      badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      meterColor: 'bg-cyan-400',
    };
  }
  if (score >= 20) {
    return {
      label: 'Elevated Volatility',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      meterColor: 'bg-amber-400',
    };
  }
  return {
    label: 'High Risk Volatility',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    meterColor: 'bg-rose-500',
  };
}

