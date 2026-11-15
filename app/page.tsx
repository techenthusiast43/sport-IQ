'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { CodeBridgeModule } from '@/components/CodeBridgeModule';
import { AIChatConsoleModule } from '@/components/AIChatConsoleModule';
import { TicketOutputModule } from '@/components/TicketOutputModule';
import { BetSlipBreakdownModule } from '@/components/BetSlipBreakdownModule';
import { SavedSlipsDrawer } from '@/components/SavedSlipsDrawer';
import { ShareSlipModal } from '@/components/ShareSlipModal';
import { TelegramConnectModal } from '@/components/TelegramConnectModal';
import { BookmakerId, BetLeg, ChatMessage, AiSlipResponse, BookingCodeResponse, SavedSlip } from '@/lib/types';
import { INITIAL_LEGS } from '@/lib/mockData';
import { mapSlipToTargetBookmaker, generateTargetBookingCode } from '@/lib/bookmakerMapper';
import { calculateSurvivalScore } from '@/lib/survivalScore';

const LOCAL_STORAGE_SAVED_SLIPS_KEY = 'sportiq_saved_slips';

export default function DashboardPage() {
  // State for Code Bridge
  const [sourceBookmaker, setSourceBookmaker] = useState<BookmakerId>('SportyBet');
  const [targetBookmaker, setTargetBookmaker] = useState<BookmakerId>('Bet9ja');
  const [bookingCode, setBookingCode] = useState('SB-8924A');
  const [isLoadingSlip, setIsLoadingSlip] = useState(false);
  const [isLiveFetch, setIsLiveFetch] = useState(false);
  const [bookmakerNotice, setBookmakerNotice] = useState('SportyBet live API integration active.');

  // State for Ticket & Breakdown
  const initialMapped = useMemo(() => mapSlipToTargetBookmaker(INITIAL_LEGS, 'Bet9ja'), []);
  const [activeLegs, setActiveLegs] = useState<BetLeg[]>(initialMapped);
  const [originalLegs, setOriginalLegs] = useState<BetLeg[]>(initialMapped);
  const [stake, setStake] = useState<number>(1000);
  const [targetCode, setTargetCode] = useState<string>('B9-88X9A');
  const [isOfficialCode, setIsOfficialCode] = useState<boolean>(false);
  const [unmatchedLegs, setUnmatchedLegs] = useState<string[]>([]);
  const [isRegisteringCode, setIsRegisteringCode] = useState<boolean>(false);

  // Modals & Drawers
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [savedSlips, setSavedSlips] = useState<SavedSlip[]>([]);

  // State for AI Chat Console & Mode
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [fixtureSource, setFixtureSource] = useState<'live-api' | 'cached-fixtures'>('cached-fixtures');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'ai',
      text: 'SportIQ AI Copilot initialized. 100% Free Universal Code Bridge connected to SportyBet, Bet9ja, 1xBet, MSport, and BetKing.',
      timestamp: '09:30 AM',
      isDemoMode: true,
      fixtureSource: 'cached-fixtures',
    },
    {
      id: 'msg-init-2',
      sender: 'ai',
      text: 'Grounded Fixture Feed active. Click "Build Safe 4-Odds Weekend Slip" to construct an accumulator from real European matches.',
      timestamp: '09:31 AM',
      isDemoMode: true,
      fixtureSource: 'cached-fixtures',
    },
  ]);

  // Load Saved Slips from LocalStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SAVED_SLIPS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedSlips(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to read saved slips from localStorage:', e);
    }
  }, []);

  // Compute live total odds
  const totalOdds = useMemo(() => {
    if (activeLegs.length === 0) return 0;
    const product = activeLegs.reduce((acc, leg) => acc * leg.odds, 1);
    return Math.round(product * 100) / 100;
  }, [activeLegs]);

  // Compute AI Survival Scores
  const survivalScore = useMemo(() => calculateSurvivalScore(activeLegs), [activeLegs]);
  const originalSurvivalScore = useMemo(() => calculateSurvivalScore(originalLegs), [originalLegs]);

  // Helper to append message
  const addMessage = useCallback(
    (sender: 'ai' | 'user', text: string, isDemo?: boolean, action?: string) => {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTaken: action,
        isDemoMode: isDemo,
      };
      setMessages((prev) => [...prev, newMsg]);
    },
    []
  );

  // Synchronizes destination booking code; queries and registers official code when target is SportyBet
  const syncTargetCode = async (legsToSync: BetLeg[], target: BookmakerId) => {
    if (target === 'SportyBet') {
      setIsRegisteringCode(true);
      try {
        const res = await fetch('/api/booking-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'export',
            targetBookmaker: 'SportyBet',
            sourceBookmaker,
            legs: legsToSync,
          }),
        });
        if (res.ok) {
          const data: BookingCodeResponse = await res.json();
          setTargetCode(data.targetCode);
          setIsOfficialCode(!!data.isOfficialCode);
          setUnmatchedLegs(data.unmatchedLegs || []);
          return;
        }
      } catch (err) {
        console.warn('SportyBet live code sync error:', err);
      } finally {
        setIsRegisteringCode(false);
      }
    }

    setTargetCode(generateTargetBookingCode(target));
    setIsOfficialCode(false);
    setUnmatchedLegs([]);
  };

  // Central function to call POST /api/ai-slip
  const callAiSlipApi = async (promptText: string, actionName?: string, isNewSlip = false) => {
    setIsAiProcessing(true);

    try {
      const response = await fetch('/api/ai-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          currentLegs: activeLegs,
          stake,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data: AiSlipResponse = await response.json();

      if (data.updatedLegs) {
        // Remap updated legs to target bookmaker terminology
        const remapped = mapSlipToTargetBookmaker(data.updatedLegs, targetBookmaker);
        setActiveLegs(remapped);

        // If user asked to build a new slip from scratch, set new baseline originalLegs
        if (isNewSlip) {
          setOriginalLegs(remapped);
        }

        syncTargetCode(remapped, targetBookmaker);
      }

      if (typeof data.updatedStake === 'number' && data.updatedStake > 0) {
        setStake(data.updatedStake);
      }

      if (typeof data.isDemoMode === 'boolean') {
        setIsDemoMode(data.isDemoMode);
      }

      if (data.fixtureSource) {
        setFixtureSource(data.fixtureSource);
      }

      addMessage('ai', data.aiSummary, data.isDemoMode, actionName);
    } catch (err: unknown) {
      console.error('Error invoking /api/ai-slip:', err);
      addMessage(
        'ai',
        'Could not complete request via API. Please try again or check connection.',
        true,
        'error'
      );
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Handler: Target Bookmaker Change (Re-runs canonical translation)
  const handleTargetChange = async (newTarget: BookmakerId) => {
    setTargetBookmaker(newTarget);
    const remapped = mapSlipToTargetBookmaker(activeLegs, newTarget);
    setActiveLegs(remapped);
    await syncTargetCode(remapped, newTarget);

    addMessage(
      'ai',
      `Target bookmaker changed to ${newTarget}. Mapped all active selections to ${newTarget}'s canonical market standards.`,
      isDemoMode,
      'change_target'
    );
  };

  // Handler: Swap Bookmakers
  const handleSwapBookmakers = async () => {
    const prevSource = sourceBookmaker;
    const prevTarget = targetBookmaker;
    setSourceBookmaker(prevTarget);
    setTargetBookmaker(prevSource);

    const remapped = mapSlipToTargetBookmaker(activeLegs, prevSource);
    setActiveLegs(remapped);
    await syncTargetCode(remapped, prevSource);

    addMessage(
      'ai',
      `Swapped route: Now bridging from ${prevTarget} ➔ ${prevSource}. Recalculating market lines for ${prevSource}.`,
      isDemoMode,
      'swap'
    );
  };

  // Handler: Load Slip via /api/booking-code
  const handleLoadSlip = async (codeToLoad?: string) => {
    const targetCodeString = (codeToLoad || bookingCode).trim().toUpperCase();
    if (!targetCodeString) return;

    setIsLoadingSlip(true);
    setBookingCode(targetCodeString);

    try {
      const res = await fetch('/api/booking-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'load',
          code: targetCodeString,
          sourceBookmaker,
          targetBookmaker,
        }),
      });

      if (!res.ok) {
        throw new Error(`Booking code endpoint returned status ${res.status}`);
      }

      const data: BookingCodeResponse = await res.json();
      const loaded = data.legs || [];

      setActiveLegs(loaded);
      setOriginalLegs(loaded); // Set baseline for Before vs After comparison
      setTargetCode(data.targetCode);
      setIsLiveFetch(data.isLiveFetch);
      setIsOfficialCode(!!data.isOfficialCode);
      setUnmatchedLegs(data.unmatchedLegs || []);
      if (data.bookmakerNotice) {
        setBookmakerNotice(data.bookmakerNotice);
      }

      addMessage('ai', data.message, isDemoMode, 'load_code');
    } catch (err: unknown) {
      console.error('Failed to load booking code:', err);
      addMessage(
        'ai',
        `Network error attempting to load code ${targetCodeString}. Please check connection.`,
        true,
        'load_error'
      );
    } finally {
      setIsLoadingSlip(false);
    }
  };

  // Handler: Revert to Baseline
  const handleRevertToOriginal = () => {
    setActiveLegs([...originalLegs]);
    syncTargetCode(originalLegs, targetBookmaker);
    addMessage(
      'ai',
      'Reverted slip to baseline state before AI refactoring. Original selections and odds restored.',
      isDemoMode,
      'revert'
    );
  };

  // Handler: Save Slip to Vault
  const handleSaveSlip = () => {
    if (activeLegs.length === 0) return;

    const firstMatch = activeLegs[0];
    const secondMatch = activeLegs[1];
    const title =
      activeLegs.length >= 2
        ? `${firstMatch.homeTeam} & ${secondMatch.homeTeam} Multi (${activeLegs.length} Legs)`
        : `${firstMatch.homeTeam} vs ${firstMatch.awayTeam}`;

    const newSavedSlip: SavedSlip = {
      id: `saved-${Date.now()}`,
      title,
      sourceBookmaker,
      targetBookmaker,
      bookingCode,
      targetBookingCode: targetCode,
      legs: [...activeLegs],
      totalOdds,
      stake,
      survivalScore,
      timestamp: new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOfficialCode,
    };

    const updated = [newSavedSlip, ...savedSlips.filter((s) => s.targetBookingCode !== targetCode)];
    setSavedSlips(updated);

    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_SLIPS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    addMessage('ai', `Saved ticket "${title}" (${targetCode}) to Vault. Access it anytime from the top navigation.`, isDemoMode, 'save_slip');
  };

  // Handler: Load Slip from Vault into Editor
  const handleLoadSavedSlip = (slip: SavedSlip) => {
    setActiveLegs(slip.legs);
    setOriginalLegs(slip.legs);
    setSourceBookmaker(slip.sourceBookmaker);
    setTargetBookmaker(slip.targetBookmaker);
    setBookingCode(slip.bookingCode);
    setTargetCode(slip.targetBookingCode);
    setIsOfficialCode(!!slip.isOfficialCode);
    setStake(slip.stake);
    setIsSavedDrawerOpen(false);

    addMessage(
      'ai',
      `Loaded saved ticket "${slip.title}" from Vault. Total Odds: ${slip.totalOdds.toFixed(2)}, Survival Score: ${slip.survivalScore}%.`,
      isDemoMode,
      'load_vault'
    );
  };

  // Handler: Delete Slip from Vault
  const handleDeleteSavedSlip = (id: string) => {
    const updated = savedSlips.filter((s) => s.id !== id);
    setSavedSlips(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_SLIPS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete from localStorage:', e);
    }
  };

  // Handler: Clear all slips
  const handleClearAllSavedSlips = () => {
    setSavedSlips([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_SAVED_SLIPS_KEY);
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  };

  // Action chips connected to AI API
  const handlePruneHighRisk = () => {
    callAiSlipApi('Prune all high-risk selections with volatile metrics', 'prune');
  };

  const handleConvertToDoubleChance = () => {
    callAiSlipApi(
      'Convert all outright 1X2 winner markets into safer Double Chance selections (1X or X2)',
      'double_chance'
    );
  };

  const handleResetSlip = () => {
    callAiSlipApi('Reset slip to original baseline parlay', 'reset');
  };

  const handleAddSafeLeg = () => {
    callAiSlipApi('Add a verified low-risk safe banker leg to stabilize the accumulator', 'add_safe');
  };

  const handleBuildSafeWeekendSlip = () => {
    callAiSlipApi(
      'Build a safe 4-leg weekend slip around 4.5 odds from real upcoming fixtures',
      'build_safe_slip',
      true
    );
  };

  // Natural language command submitted by user
  const handleSubmitCommand = (command: string) => {
    addMessage('user', command);
    const lower = command.toLowerCase();
    const isNew = lower.includes('build') || lower.includes('scratch') || lower.includes('new slip');
    callAiSlipApi(command, 'custom_prompt', isNew);
  };

  // Handler: Remove Individual Leg
  const handleRemoveLeg = (legId: string) => {
    const legToRemove = activeLegs.find((l) => l.id === legId);
    const updated = activeLegs.filter((l) => l.id !== legId);
    setActiveLegs(updated);
    syncTargetCode(updated, targetBookmaker);

    if (legToRemove) {
      addMessage(
        'ai',
        `Removed leg: ${legToRemove.homeTeam} vs ${legToRemove.awayTeam} (${legToRemove.marketName} @ ${legToRemove.odds}). Live odds updated.`,
        isDemoMode,
        'remove_leg'
      );
    }
  };

  // Handler: Convert Single Leg to Double Chance
  const handleConvertSingleLeg = (legId: string) => {
    const targetLeg = activeLegs.find((l) => l.id === legId);
    if (!targetLeg) return;

    callAiSlipApi(
      `Convert ${targetLeg.homeTeam} vs ${targetLeg.awayTeam} from outright win to safer Double Chance`,
      'single_dc'
    );
  };

  const isCurrentSlipSaved = savedSlips.some((s) => s.targetBookingCode === targetCode);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        isDemoMode={isDemoMode}
        fixtureSource={fixtureSource}
        savedSlipsCount={savedSlips.length}
        onOpenSavedSlips={() => setIsSavedDrawerOpen(true)}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Hero Banner / Quick Overview */}
        <div className="relative rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-5 sm:p-6 shadow-2xl overflow-hidden">
          <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Universal Booking Code Translation Engine
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-medium text-slate-400">
                  Cross-Bookmaker Normalization Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                SportIQ Sports Betting AI & Code Converter
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Translate slips seamlessly between SportyBet, Bet9ja, 1xBet, MSport, and BetKing.
                Compare Before vs. After optimization deltas, evaluate survival probabilities, and
                export verified parlay receipts for WhatsApp and Telegram.
              </p>
            </div>

            {/* Quick Live Stats Pill */}
            <div className="flex items-center gap-3 shrink-0 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="text-center px-2">
                <span className="block text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  Selections
                </span>
                <span className="font-mono text-lg font-bold text-slate-100">
                  {activeLegs.length}
                </span>
              </div>
              <div className="h-7 w-[1px] bg-slate-800" />
              <div className="text-center px-2">
                <span className="block text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  Combined Odds
                </span>
                <span className="font-mono text-lg font-extrabold text-cyan-400">
                  {totalOdds.toFixed(2)}
                </span>
              </div>
              <div className="h-7 w-[1px] bg-slate-800" />
              <div className="text-center px-2">
                <span className="block text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  Survival Score
                </span>
                <span className="font-mono text-base font-extrabold text-emerald-400">
                  {survivalScore}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Split Dashboard on Desktop / Single Column on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Universal Code Bridge & Interactive Bet Slip Breakdown (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Module 1: Universal Code Bridge */}
            <CodeBridgeModule
              sourceBookmaker={sourceBookmaker}
              targetBookmaker={targetBookmaker}
              bookingCode={bookingCode}
              isLoading={isLoadingSlip}
              isLiveFetch={isLiveFetch}
              bookmakerNotice={bookmakerNotice}
              onSourceChange={setSourceBookmaker}
              onTargetChange={handleTargetChange}
              onCodeChange={setBookingCode}
              onSwapBookmakers={handleSwapBookmakers}
              onLoadSlip={handleLoadSlip}
            />

            {/* Module 4: Interactive Bet Slip Breakdown */}
            <BetSlipBreakdownModule
              legs={activeLegs}
              sourceBookmaker={sourceBookmaker}
              targetBookmaker={targetBookmaker}
              onRemoveLeg={handleRemoveLeg}
              onConvertLegToDoubleChance={handleConvertSingleLeg}
              onResetSlip={handleResetSlip}
            />
          </div>

          {/* Right Column: Converted Ticket Output & AI Slip Editor (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* Module 3: Converted Ticket Output Card with Before/After Comparison & Actions */}
            <TicketOutputModule
              sourceBookmaker={sourceBookmaker}
              targetBookmaker={targetBookmaker}
              targetBookingCode={targetCode}
              sourceBookingCode={bookingCode}
              totalOdds={totalOdds}
              stake={stake}
              legs={activeLegs}
              originalLegs={originalLegs}
              survivalScore={survivalScore}
              originalSurvivalScore={originalSurvivalScore}
              onStakeChange={setStake}
              onRevertToOriginal={handleRevertToOriginal}
              onSaveSlip={handleSaveSlip}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              isSaved={isCurrentSlipSaved}
              isOfficialCode={isOfficialCode}
              unmatchedLegs={unmatchedLegs}
              isRegisteringLiveCode={isRegisteringCode}
            />

            {/* Module 2: AI Slip Editor & Chat Console */}
            <AIChatConsoleModule
              legs={activeLegs}
              messages={messages}
              isProcessing={isAiProcessing}
              isDemoMode={isDemoMode}
              fixtureSource={fixtureSource}
              onPruneHighRisk={handlePruneHighRisk}
              onConvertToDoubleChance={handleConvertToDoubleChance}
              onResetSlip={handleResetSlip}
              onAddSafeLeg={handleAddSafeLeg}
              onBuildSafeWeekendSlip={handleBuildSafeWeekendSlip}
              onSubmitCommand={handleSubmitCommand}
            />
          </div>
        </div>
      </main>

      {/* Saved Slips Vault Slide-Over Drawer */}
      <SavedSlipsDrawer
        isOpen={isSavedDrawerOpen}
        savedSlips={savedSlips}
        onClose={() => setIsSavedDrawerOpen(false)}
        onLoadSlip={handleLoadSavedSlip}
        onDeleteSlip={handleDeleteSavedSlip}
        onClearAll={handleClearAllSavedSlips}
      />

      {/* Shareable Verified Slip Card Modal */}
      <ShareSlipModal
        isOpen={isShareModalOpen}
        targetBookmaker={targetBookmaker}
        targetBookingCode={targetCode}
        legs={activeLegs}
        totalOdds={totalOdds}
        stake={stake}
        survivalScore={survivalScore}
        isOfficialCode={isOfficialCode}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Telegram Bot Connect & Simulator Modal */}
      <TelegramConnectModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SportIQ AI Analytics</span>
            <span>•</span>
            <span>Multi-Bookmaker Engine</span>
          </div>
          <div className="text-[11px] text-slate-500">
            18+ • SportIQ AI analytics are informational only; please bet responsibly.
          </div>
        </div>
      </footer>
    </div>
  );
}
