'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, Copy, Check, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('npx -y tsot-mcp-server');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // Dark hero canvas — Linear/Vercel style
    <div className="relative bg-[#0a0a0c] overflow-hidden">
      {/* Subtle blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Single faint radial glow — behind headline only, not cheesy */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0,60,51,0.35) 0%, transparent 70%)',
        }}
      />

      <div
        className={`relative max-w-[780px] mx-auto px-6 pt-24 pb-20 text-center space-y-8 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11.5px] font-mono tracking-wider text-neutral-300 bg-white/5 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>FREE MCP SERVER · ZERO SETUP · RUNS OFFLINE</span>
        </div>

        {/* Headline */}
        <h1 className="font-['Plus_Jakarta_Sans'] text-[44px] sm:text-[60px] lg:text-[72px] font-normal leading-[1.03] tracking-[-2px] text-white">
          Your AI agent might<br />
          already{' '}
          <span
            className="font-semibold"
            style={{ color: '#4ade80' }}
          >
            violate EU law.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-400 text-[17px] sm:text-[19px] leading-[1.65] font-sans mx-auto max-w-[540px]">
          TSOT flags EU AI Act violations as you build — inside Cursor, Claude, and Windsurf.{' '}
          <span className="text-neutral-200">No API key. No account. Free forever.</span>
        </p>

        {/* Command — primary CTA */}
        <div className="flex items-center justify-center pt-2">
          <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-[14px] bg-[#0f1a14] border border-emerald-500/25 font-mono text-[14px] text-emerald-400 shadow-lg shadow-emerald-900/20">
            <Terminal className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>npx -y tsot-mcp-server</span>
            <button
              onClick={handleCopy}
              className="py-1 px-3 rounded-[8px] bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-[12px] font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 border border-white/10 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Secondary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/mcp"
            className="bg-white hover:bg-neutral-100 text-[#0a0a0c] font-semibold text-[14px] px-6 py-3 rounded-full transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-[#003c33]" />
            <span>Use Free MCP</span>
          </Link>
          <Link
            href="/waitlist"
            className="bg-transparent hover:bg-white/5 text-neutral-300 hover:text-white border border-white/15 font-medium text-[14px] px-5 py-3 rounded-full transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Join Waitlist</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Micro trust line */}
        <div className="flex items-center justify-center gap-5 text-[12px] font-mono text-neutral-600 pt-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> 9,200+ research papers
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> 124 EU AI Act articles
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> &lt;2ms local engine
          </span>
        </div>
      </div>
    </div>
  );
}
