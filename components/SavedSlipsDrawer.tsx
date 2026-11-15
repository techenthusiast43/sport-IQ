'use client';

import React from 'react';
import {
  X,
  Bookmark,
  Trash2,
  Download,
  Calendar,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { SavedSlip } from '@/lib/types';
import { BOOKMAKERS } from '@/lib/mockData';
import { getSurvivalTier } from '@/lib/survivalScore';

interface SavedSlipsDrawerProps {
  isOpen: boolean;
  savedSlips: SavedSlip[];
  onClose: () => void;
  onLoadSlip: (slip: SavedSlip) => void;
  onDeleteSlip: (id: string) => void;
  onClearAll: () => void;
}

export const SavedSlipsDrawer: React.FC<SavedSlipsDrawerProps> = ({
  isOpen,
  savedSlips,
  onClose,
  onLoadSlip,
  onDeleteSlip,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Content */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/90 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Saved Slips Vault
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-mono text-cyan-300">
                  {savedSlips.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Persistent local storage ticket repository
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Slips List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {savedSlips.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 text-center p-6 rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-3">
                <Bookmark className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">No saved slips yet</h3>
              <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
                Click the &quot;Save to Vault&quot; button on any converted ticket to archive your optimized slips here.
              </p>
            </div>
          ) : (
            savedSlips.map((slip) => {
              const tier = getSurvivalTier(slip.survivalScore);
              const targetBm =
                BOOKMAKERS.find((b) => b.id === slip.targetBookmaker) || BOOKMAKERS[0];

              return (
                <div
                  key={slip.id}
                  className="rounded-xl border border-slate-800/90 bg-slate-900/80 p-4 transition-all hover:border-slate-700 shadow-md"
                >
                  {/* Top Bar: Title & Timestamp */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{slip.title}</span>
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span>{slip.timestamp}</span>
                        <span>•</span>
                        <span>{slip.legs.length} {slip.legs.length === 1 ? 'leg' : 'legs'}</span>
                      </div>
                    </div>

                    {/* Survival Tier Badge */}
                    <div
                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tier.badgeClass}`}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      <span>{slip.survivalScore}% Survival</span>
                    </div>
                  </div>

                  {/* Route & Booking Codes */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-slate-300">
                      <span>{slip.sourceBookmaker}</span>
                      <ArrowRight className="h-3 w-3 text-slate-500" />
                      <span className="text-emerald-400">{slip.targetBookmaker}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-xs">
                      {slip.isOfficialCode && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Official SportyBet Code (Verified)" />
                      )}
                      <span>{slip.targetBookingCode}</span>
                    </div>
                  </div>

                  {/* Match summary snippet */}
                  <div className="mt-2 text-[11px] text-slate-400 line-clamp-1">
                    {slip.legs.map((l) => `${l.homeTeam} vs ${l.awayTeam}`).join(' • ')}
                  </div>

                  {/* Odds & Stake Info */}
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-950/70 p-2.5 text-xs border border-slate-800/60">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Total Odds</span>
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        {slip.totalOdds.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Est. Payout</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        ₦{(slip.totalOdds * slip.stake).toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => onDeleteSlip(slip.id)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors p-1"
                      title="Delete saved slip"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onLoadSlip(slip)}
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Load into Editor</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {savedSlips.length > 0 && (
          <div className="border-t border-slate-800/90 p-4 bg-slate-950/90 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              {savedSlips.length} tickets archived
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-400/80 hover:text-rose-400 underline decoration-rose-500/30 transition-colors cursor-pointer"
            >
              Clear All Slips
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

