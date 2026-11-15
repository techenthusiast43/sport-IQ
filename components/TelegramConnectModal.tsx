'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Copy,
  Check,
  Bot,
  Terminal,
  ShieldCheck,
  Zap,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Radio,
  Loader2,
} from 'lucide-react';

interface TelegramConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [webhookStatus, setWebhookStatus] = useState<{
    status: string;
    botConfigured: boolean;
    secretConfigured: boolean;
  } | null>(null);

  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testPrompt, setTestPrompt] = useState('convert SB-8924A to Bet9ja');
  const [simulatedReply, setSimulatedReply] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/telegram/webhook')
        .then((res) => res.json())
        .then((data) => setWebhookStatus(data))
        .catch((e) => console.warn('Failed to load webhook status:', e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const curlCommand = `curl -F "url=https://your-domain.vercel.app/api/telegram/webhook" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2200);
  };

  const handleSimulate = async (promptToSend?: string) => {
    const textToSend = (promptToSend || testPrompt).trim();
    if (!textToSend || isSimulating) return;

    setIsSimulating(true);
    setSimulatedReply(null);

    try {
      const res = await fetch('/api/telegram/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            text: textToSend,
            chat: { id: 123456789 },
            from: { first_name: 'Bettor' },
          },
        }),
      });

      const data = await res.json();
      setSimulatedReply(data.replyMarkdown || 'No reply received from engine.');
    } catch (e: unknown) {
      setSimulatedReply('Error communicating with Telegram webhook endpoint.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 text-[#229ED9]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Telegram Bot Webhook Engine
                </h3>
                {webhookStatus?.botConfigured ? (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    <Radio className="h-2 w-2 text-emerald-400 animate-pulse" />
                    Live Token
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    Awaiting Token
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Audit risk and convert codes inside Telegram via SportyClaw-style automation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Webhook Registration Quick Guide */}
        <div className="mt-4 rounded-xl border border-slate-800/90 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              Webhook Registration Command (Once Deployed)
            </span>
            <button
              type="button"
              onClick={handleCopyCurl}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {copiedCurl ? (
                <>
                  <Check className="h-3 w-3 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy cURL</span>
                </>
              )}
            </button>
          </div>

          <div className="font-mono text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre">
            {curlCommand}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Set <code className="text-cyan-300 bg-slate-950 px-1 rounded">TELEGRAM_BOT_TOKEN</code> in <code className="text-cyan-300 bg-slate-950 px-1 rounded">.env.local</code> to activate live dispatching to Telegram users.
          </p>
        </div>

        {/* Interactive Simulator Section */}
        <div className="mt-5 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-[#229ED9]" />
              Interactive Telegram Message Simulator
            </label>
            <span className="text-[10px] font-mono text-slate-500">Live Webhook Testing</span>
          </div>

          {/* Quick prompt preset buttons */}
          <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
            {[
              'convert SB-8924A to Bet9ja',
              'Build a safe 4-odds weekend slip',
              '/start',
              'convert B9-7719K to 1xBet',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setTestPrompt(preset);
                  handleSimulate(preset);
                }}
                disabled={isSimulating}
                className="rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 hover:border-[#229ED9]/50 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Prompt input and submit */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="e.g. 'convert SB-8924A to Bet9ja' or 'Build a safe weekend slip'..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-[#229ED9] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSimulate()}
              disabled={!testPrompt.trim() || isSimulating}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#229ED9] to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Test Bot</span>
                </>
              )}
            </button>
          </div>

          {/* Simulated Telegram Chat Bubble */}
          {simulatedReply && (
            <div className="mt-4 rounded-xl border border-[#229ED9]/30 bg-[#0c1824] p-4 shadow-lg text-xs leading-relaxed max-h-72 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/80 text-[11px] text-[#229ED9] font-semibold">
                <Bot className="h-3.5 w-3.5" />
                <span>SportIQ Bot (Telegram Simulated Response)</span>
              </div>
              <div className="whitespace-pre-wrap font-sans text-slate-200">
                {simulatedReply}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

