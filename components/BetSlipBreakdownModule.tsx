'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  ArrowRightLeft,
} from 'lucide-react';
import { BetLeg, RiskLevel, BookmakerId } from '@/lib/types';

interface BetSlipBreakdownModuleProps {
  legs: BetLeg[];
  sourceBookmaker?: BookmakerId;
  targetBookmaker?: BookmakerId;
  onRemoveLeg: (legId: string) => void;
  onConvertLegToDoubleChance: (legId: string) => void;
  onResetSlip: () => void;
}

export const BetSlipBreakdownModule: React.FC<BetSlipBreakdownModuleProps> = ({
  legs,
  sourceBookmaker,
  targetBookmaker,
  onRemoveLeg,
  onConvertLegToDoubleChance,
  onResetSlip,
}) => {
  const isCrossBookmaker = sourceBookmaker && targetBookmaker && sourceBookmaker !== targetBookmaker;

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'LOW':
        return (
          <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            Low Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
            <AlertCircle className="h-3 w-3" />
            Medium Risk
          </span>
        );
      case 'HIGH':
        return (
          <span className="flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
            <ShieldAlert className="h-3 w-3" />
            High Risk
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl shadow-slate-950/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Interactive Bet Slip Breakdown
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                {legs.length} {legs.length === 1 ? 'Leg' : 'Legs'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Granular inspection, market alterations, and heuristic risk annotations
            </p>
          </div>
        </div>

        {legs.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Avg Leg Odds:</span>
            <span className="font-mono font-bold text-cyan-300">
              {(legs.reduce((acc, l) => acc + l.odds, 0) / (legs.length || 1)).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Slip Items List */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {legs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-3">
              <Layers className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No active selections</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              All legs have been pruned or removed. Click below to reload the initial verified parlay ticket.
            </p>
            <button
              onClick={onResetSlip}
              className="mt-4 flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore Original Slip
            </button>
          </div>
        ) : (
          legs.map((leg) => {
            const canConvertToDC = leg.marketType === '1X2' && !leg.isConvertedToDoubleChance;
            const isConverted = leg.isConvertedToDoubleChance;

            return (
              <div
                key={leg.id}
                className="group relative rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 transition-all hover:border-slate-700 hover:bg-slate-950/90 shadow-sm"
              >
                {/* Top Row: League & Kickoff & Risk Badge & Delete */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-300">{leg.league}</span>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{leg.kickoff}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Risk Badge */}
                    {getRiskBadge(leg.riskLevel)}

                    {/* Delete Leg Button */}
                    <button
                      type="button"
                      onClick={() => onRemoveLeg(leg.id)}
                      title="Remove this leg from ticket"
                      aria-label={`Remove ${leg.homeTeam} vs ${leg.awayTeam}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-slate-500 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 active:scale-90 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle Row: Match Teams & Selection / Odds */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Matchup */}
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{leg.homeTeam}</span>
                      <span className="text-xs font-normal text-slate-500">vs</span>
                      <span>{leg.awayTeam}</span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded bg-slate-800/90 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                        {leg.marketName}
                      </span>
                      <span className="font-medium text-cyan-300">
                        Pick: <span className="underline decoration-cyan-500/40">{leg.selection}</span>
                      </span>
                      {isConverted && (
                        <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 font-mono">
                          Safety Downgraded
                        </span>
                      )}
                    </div>

                    {/* Subtle Cross-Bookmaker Market Mapping Tag */}
                    {isCrossBookmaker && leg.targetMarketName && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <ArrowRightLeft className="h-3 w-3 text-cyan-400" />
                        <span className="rounded border border-cyan-500/30 bg-cyan-950/40 px-1.5 py-0.5 font-mono text-cyan-300">
                          Mapped for {targetBookmaker}: {leg.targetMarketName}
                          {leg.targetSelection ? ` (${leg.targetSelection})` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Odds Box & Individual Action */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] text-slate-400">Odds:</span>
                      <span className="font-mono text-lg font-extrabold text-emerald-400">
                        {leg.odds.toFixed(2)}
                      </span>
                      {leg.originalOdds !== leg.odds && (
                        <span className="text-[10px] text-slate-500 line-through font-mono">
                          {leg.originalOdds.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Individual Leg Double Chance Switch */}
                    {canConvertToDC && (
                      <button
                        type="button"
                        onClick={() => onConvertLegToDoubleChance(leg.id)}
                        className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                        title="Convert outright win to safer Double Chance"
                      >
                        <Sparkles className="h-3 w-3 text-cyan-400" />
                        <span>Downgrade to DC</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Row: AI Risk Reasoning */}
                <div className="mt-3 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-slate-200">AI Assessment: </span>
                    <span className="text-slate-400">{leg.riskReason}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
