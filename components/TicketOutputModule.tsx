'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  TrendingUp,
  Coins,
  Sparkles,
  ExternalLink,
  Flame,
  Award,
  Share2,
  Bookmark,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { BookmakerId, BetLeg } from '@/lib/types';
import { BOOKMAKERS } from '@/lib/mockData';
import { getSurvivalTier } from '@/lib/survivalScore';

interface TicketOutputModuleProps {
  sourceBookmaker: BookmakerId;
  targetBookmaker: BookmakerId;
  targetBookingCode: string;
  sourceBookingCode: string;
  totalOdds: number;
  stake: number;
  legs: BetLeg[];
  originalLegs: BetLeg[];
  survivalScore: number;
  originalSurvivalScore: number;
  onStakeChange: (stake: number) => void;
  onRevertToOriginal: () => void;
  onSaveSlip: () => void;
  onOpenShareModal: () => void;
  isSaved?: boolean;
  isOfficialCode?: boolean;
  unmatchedLegs?: string[];
  isRegisteringLiveCode?: boolean;
}

export const TicketOutputModule: React.FC<TicketOutputModuleProps> = ({
  sourceBookmaker,
  targetBookmaker,
  targetBookingCode,
  sourceBookingCode,
  totalOdds,
  stake,
  legs,
  originalLegs,
  survivalScore,
  originalSurvivalScore,
  onStakeChange,
  onRevertToOriginal,
  onSaveSlip,
  onOpenShareModal,
  isSaved = false,
  isOfficialCode = false,
  unmatchedLegs = [],
  isRegisteringLiveCode = false,
}) => {
  const [copied, setCopied] = useState(false);

  const targetBmObj = BOOKMAKERS.find((b) => b.id === targetBookmaker) || BOOKMAKERS[1];
  const legCount = legs.length;
  const originalLegCount = originalLegs.length;

  const handleCopy = () => {
    if (!targetBookingCode) return;
    navigator.clipboard.writeText(targetBookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Calculate Accumulator Bonus (e.g. 5% per leg starting from 4 legs, up to 35%)
  const bonusPercentage = legCount >= 4 ? Math.min(35, (legCount - 2) * 5) : 0;
  const basePayout = legCount > 0 ? totalOdds * stake : 0;
  const bonusAmount = (basePayout * bonusPercentage) / 100;
  const totalPayout = basePayout + bonusAmount;

  // Survival Tier
  const tier = getSurvivalTier(survivalScore);

  // Check if slip has undergone optimization modifications
  const hasOptimizationDelta =
    originalLegCount > 0 &&
    (legCount !== originalLegCount ||
      Math.abs(survivalScore - originalSurvivalScore) >= 2 ||
      legs.some((l) => l.isConvertedToDoubleChance));

  const scoreDiff = survivalScore - originalSurvivalScore;
  const legsDiff = legCount - originalLegCount;

  const quickStakes = [500, 1000, 2500, 5000, 10000];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/95 to-slate-950 p-5 shadow-2xl shadow-slate-950/80 backdrop-blur-md">
      {/* Background Accent glow */}
      <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Converted Ticket Output
              <span className="rounded-full bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                Live
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Ready for placement on {targetBmObj.name}
            </p>
          </div>
        </div>

        {/* Bookmaker Tag */}
        <div
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${targetBmObj.badgeColor}`}
        >
          <span className="h-2 w-2 rounded-full bg-current"></span>
          <span>{targetBmObj.name}</span>
        </div>
      </div>

      {/* BEFORE VS AFTER AI OPTIMIZATION DELTA PILL */}
      {hasOptimizationDelta && (
        <div className="mt-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Optimization Delta:</span>
            </div>

            {/* Revert Button */}
            <button
              type="button"
              onClick={onRevertToOriginal}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white underline decoration-slate-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Revert to Baseline</span>
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
            {/* Survival Score Delta */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="text-slate-400">Survival Score:</span>
              <span className="font-mono text-slate-300">{originalSurvivalScore}%</span>
              <ArrowRight className="h-3 w-3 text-emerald-400" />
              <span className="font-mono font-bold text-emerald-400">{survivalScore}%</span>
              <span className={`font-mono font-bold ${scoreDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({scoreDiff >= 0 ? `+${scoreDiff}%` : `${scoreDiff}%`})
              </span>
            </div>

            {/* Leg Count Delta */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="text-slate-400">Legs:</span>
              <span className="font-mono text-slate-300">{originalLegCount}</span>
              <ArrowRight className="h-3 w-3 text-slate-500" />
              <span className="font-mono font-bold text-white">{legCount}</span>
              {legsDiff !== 0 && (
                <span className="font-mono text-slate-400">
                  ({legsDiff > 0 ? `+${legsDiff}` : legsDiff})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated Code Display Box */}
      <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 shadow-inner relative group">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="uppercase tracking-wider font-semibold text-[11px] text-emerald-400/90 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Generated {targetBmObj.name} Code
          </span>
          <span className="text-[11px] font-mono text-slate-400">Format: {targetBmObj.codePrefix}*****</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5 items-start">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-emerald-300 select-all">
                {targetBookingCode || '------'}
              </div>

              {/* SportyBet Official vs Preview Badge */}
              {targetBookmaker === 'SportyBet' && (
                isOfficialCode ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 shadow-sm">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 stroke-[2.5]" />
                    Official SportyBet Code (Verified)
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300"
                    title={
                      unmatchedLegs?.length
                        ? `Unmatched on SportyBet board: ${unmatchedLegs.join(', ')}`
                        : 'SportyBet live API registration unavailable'
                    }
                  >
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    Preview Code (Bookmaker API Unavailable)
                  </span>
                )
              )}
            </div>

            {/* Unmatched fixtures note if fallback was engaged */}
            {targetBookmaker === 'SportyBet' && !isOfficialCode && unmatchedLegs && unmatchedLegs.length > 0 && (
              <p className="text-[10px] text-amber-400/80">
                Note: {unmatchedLegs.length} leg(s) not currently listed on SportyBet ({unmatchedLegs.slice(0, 2).join(', ')}{unmatchedLegs.length > 2 ? '...' : ''}).
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              disabled={!targetBookingCode}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-md cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                  : 'bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            {/* Share Slip Button */}
            <button
              onClick={onOpenShareModal}
              disabled={!targetBookingCode || legCount === 0}
              className="flex items-center justify-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 text-xs font-semibold transition-all cursor-pointer"
              title="Open shareable ticket card for WhatsApp / Telegram or PNG"
            >
              <Share2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Share</span>
            </button>

            {/* Save to Vault Button */}
            <button
              onClick={onSaveSlip}
              disabled={!targetBookingCode || legCount === 0}
              className={`flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isSaved
                  ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
              title="Save slip to local storage vault"
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'text-cyan-400 fill-cyan-400' : 'text-slate-400'}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid: Total Odds, Stake, AI Survival Score */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Odds Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px]">Total Odds</span>
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-cyan-400">
              {legCount > 0 ? totalOdds.toFixed(2) : '0.00'}
            </span>
            <span className="text-[10px] text-slate-500">
              ({legCount} {legCount === 1 ? 'leg' : 'legs'})
            </span>
          </div>
        </div>

        {/* Stake Configuration Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px]">Stake (₦)</span>
            <Coins className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="relative">
            <span className="absolute left-2 top-1 text-xs font-semibold text-slate-400">₦</span>
            <input
              type="number"
              min="50"
              step="50"
              value={stake || ''}
              onChange={(e) => onStakeChange(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-0.5 pl-5 font-mono text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* AI Survival Score Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px]">Survival Score</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black font-mono text-emerald-400">
              {survivalScore}%
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tier.badgeClass}`}>
              {tier.label.split(' ')[0]}
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="mt-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${survivalScore}%` }}
              className={`h-full ${tier.meterColor} transition-all duration-500`}
            />
          </div>
        </div>
      </div>

      {/* Stake Quick Buttons */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-slate-500 whitespace-nowrap">Quick:</span>
        {quickStakes.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onStakeChange(val)}
            className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-all cursor-pointer ${
              stake === val
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            ₦{val.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Payout Breakdown Card */}
      <div className="mt-4 rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Standard Return</span>
          <span className="font-mono text-slate-200">
            ₦{basePayout.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {bonusPercentage > 0 && (
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 fill-emerald-500/20" />
              Acca Multi-Bonus (+{bonusPercentage}%)
            </span>
            <span className="font-mono font-medium">
              +₦{bonusAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="border-t border-slate-800/90 pt-2 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              Estimated Total Payout
            </span>
            <p className="text-[10px] text-slate-500">Gross estimated winnings on {targetBmObj.name}</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              ₦{totalPayout.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
