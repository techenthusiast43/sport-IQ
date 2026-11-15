'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Zap,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Loader2,
  Info,
  Radio,
  Database,
  Target,
} from 'lucide-react';
import { BetLeg, ChatMessage, RiskLevel } from '@/lib/types';

interface AIChatConsoleModuleProps {
  legs: BetLeg[];
  messages: ChatMessage[];
  isProcessing: boolean;
  isDemoMode: boolean;
  fixtureSource?: 'live-api' | 'cached-fixtures';
  onPruneHighRisk: () => void;
  onConvertToDoubleChance: () => void;
  onResetSlip: () => void;
  onAddSafeLeg: () => void;
  onBuildSafeWeekendSlip: () => void;
  onSubmitCommand: (command: string) => void;
}

export const AIChatConsoleModule: React.FC<AIChatConsoleModuleProps> = ({
  legs,
  messages,
  isProcessing,
  isDemoMode,
  fixtureSource = 'cached-fixtures',
  onPruneHighRisk,
  onConvertToDoubleChance,
  onResetSlip,
  onAddSafeLeg,
  onBuildSafeWeekendSlip,
  onSubmitCommand,
}) => {
  const [inputCommand, setInputCommand] = useState('');

  // Calculate telemetry
  const totalLegs = legs.length;
  const highRiskCount = legs.filter((l) => l.riskLevel === 'HIGH').length;
  const medRiskCount = legs.filter((l) => l.riskLevel === 'MEDIUM').length;
  const lowRiskCount = legs.filter((l) => l.riskLevel === 'LOW').length;
  const has1X2 = legs.some((l) => l.marketType === '1X2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim() || isProcessing) return;
    onSubmitCommand(inputCommand.trim());
    setInputCommand('');
  };

  const handleChipClick = (actionName: string) => {
    if (isProcessing) return;
    if (actionName === 'prune') onPruneHighRisk();
    else if (actionName === 'dc') onConvertToDoubleChance();
    else if (actionName === 'reset') onResetSlip();
    else if (actionName === 'safe') onAddSafeLeg();
    else if (actionName === 'build_safe') onBuildSafeWeekendSlip();
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl shadow-slate-950/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-100">
                SportIQ AI Copilot
              </h2>
              {isDemoMode ? (
                <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  Demo Mode
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini 2.5 Flash
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Grounded with real European football fixtures & verified sportsbook odds
            </p>
          </div>
        </div>

        {/* Live Odds Feed vs Simulated Fixtures Badge */}
        <div className="flex items-center gap-2">
          {fixtureSource === 'live-api' ? (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-300">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              Live Odds Feed
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-mono text-slate-300">
              <Database className="h-3 w-3 text-cyan-400" />
              Simulated Fixtures
            </span>
          )}
        </div>
      </div>

      {/* Diagnostic Status Banner */}
      <div className="border-b border-slate-800/70 bg-slate-950/60 p-4 relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center gap-2 z-10 text-xs font-semibold text-cyan-300">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span>AI is querying real fixtures & restructuring slip...</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {highRiskCount > 0 ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                <ShieldAlert className="h-3.5 w-3.5" />
                {highRiskCount} High-Risk {highRiskCount === 1 ? 'Leg' : 'Legs'} Flagged
              </span>
            ) : totalLegs === 0 ? (
              <span className="text-xs text-slate-400">Ticket is currently empty</span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5" />
                Optimal Safety Rating (All Low/Moderate)
              </span>
            )}
            <span className="text-xs text-slate-400">
              {totalLegs} {totalLegs === 1 ? 'Selection' : 'Selections'} Active
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              {lowRiskCount} Low
            </span>
            <span className="text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
              {medRiskCount} Med
            </span>
            <span className="text-rose-400 bg-rose-950/40 border border-rose-800/40 px-1.5 py-0.5 rounded">
              {highRiskCount} High
            </span>
          </div>
        </div>

        {/* Dynamic Risk Meter Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800 flex">
          {totalLegs > 0 && (
            <>
              <div
                style={{ width: `${(lowRiskCount / totalLegs) * 100}%` }}
                className="bg-emerald-400 transition-all duration-500"
                title={`${lowRiskCount} Low Risk Legs`}
              />
              <div
                style={{ width: `${(medRiskCount / totalLegs) * 100}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`${medRiskCount} Medium Risk Legs`}
              />
              <div
                style={{ width: `${(highRiskCount / totalLegs) * 100}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`${highRiskCount} High Risk Legs`}
              />
            </>
          )}
        </div>

        {/* Diagnostic Insight Message */}
        <p className="mt-2 text-xs text-slate-300 flex items-start gap-1.5">
          <Bot className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
          <span>
            {highRiskCount > 0
              ? `AI Diagnostic: ${highRiskCount} selection${highRiskCount > 1 ? 's carry' : ' carries'} high variance. Pruning or converting them to Double Chance significantly raises hit probability.`
              : totalLegs > 0
              ? 'AI Diagnostic: Slip profile is well-balanced. Historical expected value correlates with favorable implied probability.'
              : 'AI Diagnostic: Click "Build Safe 4-Odds Weekend Slip" to generate a verified accumulator from upcoming fixtures.'}
          </span>
        </p>
      </div>

      {/* Quick Action Chips Bar */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-900/60">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block flex items-center justify-between">
          <span>Grounded AI Actions</span>
          {isProcessing && <span className="text-cyan-400 font-mono text-[10px] animate-pulse">Running Gemini Engine...</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {/* Build Safe 4-Odds Weekend Slip */}
          <button
            type="button"
            onClick={() => handleChipClick('build_safe')}
            disabled={isProcessing}
            className="group flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <Target className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            )}
            <span>Build Safe 4-Odds Weekend Slip</span>
          </button>

          {/* Prune High Risk */}
          <button
            type="button"
            onClick={() => handleChipClick('prune')}
            disabled={highRiskCount === 0 || isProcessing}
            className="group flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-400" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            )}
            <span>Prune High-Risk</span>
            {highRiskCount > 0 && (
              <span className="ml-1 rounded-full bg-rose-500/30 px-1.5 py-0.2 text-[10px] text-rose-200">
                {highRiskCount}
              </span>
            )}
          </button>

          {/* Convert 1X2 to Double Chance */}
          <button
            type="button"
            onClick={() => handleChipClick('dc')}
            disabled={!has1X2 || isProcessing}
            className="group flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            ) : (
              <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            )}
            <span>Convert 1X2 to Double Chance</span>
          </button>

          {/* Add Safe Leg */}
          <button
            type="button"
            onClick={() => handleChipClick('safe')}
            disabled={isProcessing}
            className="group flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <Zap className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            )}
            <span>+ Add Safe Leg</span>
          </button>

          {/* Reset Slip */}
          <button
            type="button"
            onClick={() => handleChipClick('reset')}
            disabled={isProcessing}
            className="group flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isProcessing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
            <span>Reset Slip</span>
          </button>
        </div>
      </div>

      {/* Interactive Conversation / Activity Feed */}
      <div className="flex-1 max-h-56 min-h-[140px] overflow-y-auto p-4 space-y-2.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[88%] rounded-xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium'
                  : 'bg-slate-800/90 border border-slate-700/60 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-75">
                {msg.sender === 'ai' ? (
                  <>
                    <Bot className="h-3 w-3 text-cyan-400" />
                    <span className="font-semibold text-cyan-300">SportIQ Copilot</span>
                    {msg.isDemoMode && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
                        Demo Mode
                      </span>
                    )}
                  </>
                ) : (
                  <span>You</span>
                )}
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Natural Language Command Input Box */}
      <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-800/80 bg-slate-950/80">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            disabled={isProcessing}
            placeholder={
              isProcessing
                ? 'Grounding with upcoming fixtures...'
                : "Type: 'Build a safe 4-leg weekend slip around 4.5 odds', 'prune high risk'..."
            }
            className="w-full rounded-xl border border-slate-700/90 bg-slate-900 px-4 py-2.5 pr-20 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputCommand.trim() || isProcessing}
            className="absolute right-1.5 flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>AI...</span>
              </>
            ) : (
              <>
                <span>Run</span>
                <Send className="h-3 w-3" />
              </>
            )}
          </button>
        </div>

        {/* Suggestion hints */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
          <span>Quick prompts:</span>
          {[
            '"Build a safe 4-leg weekend slip around 4.5 odds"',
            '"Add a safe banker leg"',
            '"Convert 1x2 to double chance"',
            '"Prune high risk"',
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isProcessing}
              onClick={() => {
                setInputCommand(suggestion.replace(/"/g, ''));
              }}
              className="text-slate-400 hover:text-cyan-400 underline decoration-slate-700 underline-offset-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
