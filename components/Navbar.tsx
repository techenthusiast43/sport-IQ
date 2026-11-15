'use client';

import React from 'react';
import { Activity, ShieldCheck, Zap, Sparkles, Radio, Database, Bookmark, Bot } from 'lucide-react';

interface NavbarProps {
  isDemoMode?: boolean;
  fixtureSource?: 'live-api' | 'cached-fixtures';
  savedSlipsCount?: number;
  onOpenSavedSlips?: () => void;
  onOpenTelegramModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDemoMode = true,
  fixtureSource = 'cached-fixtures',
  savedSlipsCount = 0,
  onOpenSavedSlips,
  onOpenTelegramModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Zap className="h-5 w-5 text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Sport<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">IQ</span>
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                FREE • LIVE AI v2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Universal Code Bridge & Sports Betting Intelligence
            </p>
          </div>
        </div>

        {/* Status Indicators, Telegram Bot, Saved Slips Vault & Live Telemetry */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Telegram Bot Setup Button */}
          <button
            type="button"
            onClick={onOpenTelegramModal}
            className="flex items-center gap-1.5 rounded-xl border border-[#229ED9]/40 bg-[#229ED9]/10 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#229ED9] hover:bg-[#229ED9]/20 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Open Telegram Bot Webhook & Simulator"
          >
            <Bot className="h-3.5 w-3.5 text-[#229ED9]" />
            <span className="hidden xs:inline">Telegram Bot</span>
          </button>

          {/* Saved Slips Vault Button */}
          <button
            type="button"
            onClick={onOpenSavedSlips}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-500/50 hover:bg-slate-850 hover:text-cyan-300 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Open Saved Slips Vault"
          >
            <Bookmark className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Saved Slips</span>
            {savedSlipsCount > 0 && (
              <span className="ml-0.5 rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300">
                {savedSlipsCount}
              </span>
            )}
          </button>

          {/* AI Mode Indicator */}
          {isDemoMode ? (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Demo Mode</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Gemini Active</span>
            </div>
          )}

          {/* Odds Feed Indicator */}
          {fixtureSource === 'live-api' ? (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>Live Odds</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-400">
              <Database className="h-3 w-3 text-cyan-400" />
              <span>Grounded</span>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Synced</span>
          </div>
        </div>
      </div>
    </header>
  );
};
