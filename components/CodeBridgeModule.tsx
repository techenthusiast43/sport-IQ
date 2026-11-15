'use client';

import React from 'react';
import {
  ArrowLeftRight,
  Download,
  Sparkles,
  CheckCircle2,
  Ticket,
  Radio,
  Wifi,
  Database,
  AlertCircle,
} from 'lucide-react';
import { BookmakerId } from '@/lib/types';
import { BOOKMAKERS, PRESET_SLIPS } from '@/lib/mockData';

interface CodeBridgeModuleProps {
  sourceBookmaker: BookmakerId;
  targetBookmaker: BookmakerId;
  bookingCode: string;
  isLoading: boolean;
  isLiveFetch?: boolean;
  bookmakerNotice?: string;
  onSourceChange: (source: BookmakerId) => void;
  onTargetChange: (target: BookmakerId) => void;
  onCodeChange: (code: string) => void;
  onSwapBookmakers: () => void;
  onLoadSlip: (codeToLoad?: string) => void;
}

export const CodeBridgeModule: React.FC<CodeBridgeModuleProps> = ({
  sourceBookmaker,
  targetBookmaker,
  bookingCode,
  isLoading,
  isLiveFetch = false,
  bookmakerNotice,
  onSourceChange,
  onTargetChange,
  onCodeChange,
  onSwapBookmakers,
  onLoadSlip,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Force uppercase alphanumeric and hyphens
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    onCodeChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onLoadSlip();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Module Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Ticket className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-100">
                Universal Code Bridge
              </h2>
              {/* Sync Status Badge */}
              {isLiveFetch ? (
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <Wifi className="h-2.5 w-2.5 text-emerald-400 animate-pulse" />
                  Live Bookmaker Sync
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full border border-cyan-800/60 bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
                  <Database className="h-2.5 w-2.5 text-cyan-400" />
                  Simulated / Cached Slip
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Cross-bookmaker code translation engine with live API polling & market normalization
            </p>
          </div>
        </div>

        {/* Quick sample chips */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Try samples:</span>
          {PRESET_SLIPS.map((preset) => (
            <button
              key={preset.code}
              onClick={() => {
                onSourceChange(preset.source);
                onLoadSlip(preset.code);
              }}
              className="rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-[11px] font-mono text-slate-300 hover:border-cyan-500/40 hover:bg-slate-800 hover:text-cyan-300 transition-all cursor-pointer"
              title={`Load ${preset.label}`}
            >
              {preset.code}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmaker Selector Row */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Source Bookmaker Dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Source Bookmaker</span>
            <span className="text-[10px] text-slate-500">Origin</span>
          </label>
          <div className="relative">
            <select
              value={sourceBookmaker}
              onChange={(e) => onSourceChange(e.target.value as BookmakerId)}
              className="w-full appearance-none rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm font-medium text-slate-100 shadow-inner focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all cursor-pointer"
            >
              {BOOKMAKERS.map((bm) => (
                <option key={`src-${bm.id}`} value={bm.id} className="bg-slate-900 text-slate-200">
                  {bm.name} {bm.id === 'SportyBet' ? '⚡ Live API' : ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex sm:flex-col items-center justify-center pt-2 sm:pt-4">
          <button
            type="button"
            onClick={onSwapBookmakers}
            aria-label="Swap bookmakers"
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/80 text-slate-400 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-400 active:scale-95 transition-all shadow-md cursor-pointer"
            title="Swap source and target bookmakers"
          >
            <ArrowLeftRight className="h-4 w-4 transition-transform group-hover:rotate-180 duration-300" />
          </button>
        </div>

        {/* Target Bookmaker Dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Target Bookmaker</span>
            <span className="text-[10px] text-emerald-400">Destination</span>
          </label>
          <div className="relative">
            <select
              value={targetBookmaker}
              onChange={(e) => onTargetChange(e.target.value as BookmakerId)}
              className="w-full appearance-none rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm font-medium text-slate-100 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer"
            >
              {BOOKMAKERS.map((bm) => (
                <option key={`tgt-${bm.id}`} value={bm.id} className="bg-slate-900 text-slate-200">
                  {bm.name} {bm.id === 'SportyBet' ? '⚡ (1-Click Verified Code)' : '(Manual Placement)'}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Code Input & Load Action */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={bookingCode}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`e.g. ${sourceBookmaker === 'SportyBet' ? 'RTB0ET' : sourceBookmaker === 'Bet9ja' ? '5ZJQVQV' : 'A3QW8'}`}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/90 px-4 py-2.5 font-mono text-sm uppercase tracking-wider text-white placeholder-slate-500 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          {bookingCode && (
            <span className="absolute right-3 top-2.5 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              {bookingCode.length} chars
            </span>
          )}
        </div>

        <button
          onClick={() => onLoadSlip()}
          disabled={isLoading || !bookingCode.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              <span>Parsing Code...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Load Slip</span>
            </>
          )}
        </button>
      </div>

      {/* Bookmaker live feedback banner */}
      {bookmakerNotice && (
        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span className="font-mono text-[11px] text-slate-400">{bookmakerNotice}</span>
        </div>
      )}

      {/* Footnote indicator */}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span>
          Real-time cross-bookmaker translation engine with canonical market equivalence layer.
        </span>
      </div>
    </div>
  );
};
