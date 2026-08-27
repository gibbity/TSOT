'use client';

import React from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Lock,
  ExternalLink,
  Flame
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount?: number;
  limit?: number;
  tier?: string;
  onUpgradeSuccess?: () => void;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentCount = 5,
  limit = 5,
  tier = 'free',
  onUpgradeSuccess
}: UpgradeModalProps) {
  const [upgrading, setUpgrading] = React.useState(false);
  const [upgraded, setUpgraded] = React.useState(false);

  if (!isOpen) return null;

  const handleSimulateUpgrade = () => {
    setUpgrading(true);
    setTimeout(() => {
      setUpgrading(false);
      setUpgraded(true);
      if (onUpgradeSuccess) onUpgradeSuccess();
      setTimeout(() => {
        onClose();
        setUpgraded(false);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-[620px] bg-[#111113] border border-neutral-800 rounded-[28px] p-8 text-white shadow-2xl overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#003c33]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Daily Quota Exceeded
          </span>
          <span className="text-neutral-500 text-[12px]">Current Tier: <strong className="text-white uppercase">{tier}</strong></span>
        </div>

        {/* Title */}
        <h2 className="font-['Plus_Jakarta_Sans'] text-[26px] font-bold text-white tracking-tight leading-snug">
          You've reached your daily quota of <span className="text-amber-400">{limit} requests</span>.
        </h2>
        <p className="font-sans text-[14px] text-neutral-400 mt-2 leading-relaxed">
          The TSOT Free tier is limited to {limit} cloud requests/day. Upgrade to <strong className="text-white">TSOT Pro</strong> for 500 requests/day, live 768-dim vector embeddings, and unrestricted statutory dossiers.
        </p>

        {/* Quota Meter */}
        <div className="my-6 p-4 rounded-[16px] bg-neutral-900/80 border border-neutral-800">
          <div className="flex justify-between items-center text-[12px] font-mono mb-2">
            <span className="text-neutral-400">Daily Cloud Vector Usage</span>
            <span className="text-amber-400 font-bold">{currentCount} / {limit} (100% Used)</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full w-full" />
          </div>
          <div className="flex justify-between items-center text-[11px] text-neutral-500 mt-2 font-sans">
            <span>Free quota resets at 00:00 UTC</span>
            <span className="text-emerald-400">Local MCP queries remain unlimited</span>
          </div>
        </div>

        {/* Pro Tier Features Grid */}
        <div className="space-y-3 mb-8">
          <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-400">
            Included in TSOT Pro ($49 / month)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[13px] font-sans">
            <div className="flex items-center gap-2 text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>500</strong> Cloud Vector Req/day</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>9,200+</strong> Live Daily Ingested Papers</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Statistical Depth ($p$-values, $N$)</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Article 11 Dossier Exporter Tool</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleSimulateUpgrade}
            disabled={upgrading || upgraded}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-[14px] bg-emerald-500 hover:bg-emerald-600 text-[#0a0a0c] font-bold text-[13px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer disabled:opacity-70"
          >
            {upgrading ? (
              <span>Activating Pro Key...</span>
            ) : upgraded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Upgraded to Pro!</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Upgrade to Pro ($49/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3.5 px-5 rounded-[14px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[13px] font-medium transition-colors border border-neutral-800 cursor-pointer"
          >
            Continue with Free Local Mode
          </button>
        </div>

      </div>
    </div>
  );
}
