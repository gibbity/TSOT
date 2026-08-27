'use client';

import { useState } from 'react';
import { RegistryRecord } from '@/types';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const riskLabels: Record<string, string> = {
  critical: 'CRITICAL',
  warning: 'IMPORTANT',
  stable: 'NECESSARY',
};

const fillColors: Record<string, string> = {
  stable: 'bg-[#0f1e19]',
  warning: 'bg-[#000c4b]',
  critical: 'bg-[#3e1535]',
};

const pillarLabels: Record<string, string> = {
  'COGNITIVE OFFLOADING': 'REASONING',
  'FRICTION & VERIFICATION': 'USER EXPERIENCE',
  'TEMPORAL PERCEPTION': 'ATTENTION',
  'EPISTEMIC AGENCY': 'ETHICS',
  'PROHIBITED PRACTICE': 'PROHIBITED',
  'HIGH RISK': 'HIGH RISK',
  'LIMITED RISK': 'LIMITED',
  'MINIMAL RISK': 'MINIMAL',
};

const riskBadges: Record<string, string> = {
  critical: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  warning: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  stable: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

function toSentenceCase(str: string): string {
  if (!str) return '';
  const words = str.split(/\s+/);
  let titleCaseCount = 0;
  let lowercaseCount = 0;

  words.forEach(w => {
    const clean = w.replace(/[^a-zA-Z]/g, '');
    if (clean.length > 0) {
      if (clean[0] === clean[0].toUpperCase()) {
        titleCaseCount++;
      } else {
        lowercaseCount++;
      }
    }
  });

  const isLikelyTitleCase = titleCaseCount > lowercaseCount && words.length > 2;

  if (!isLikelyTitleCase) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const processPart = (part: string, isFirst: boolean) => {
    if (!part) return '';
    if (isFirst) {
      if (part === part.toUpperCase()) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }
    if (part === part.toUpperCase() && part.length > 1 && !/^\d+$/.test(part)) {
      return part;
    }
    const clean = part.replace(/[^a-zA-Z]/g, '');
    const hasInternalUpper = clean.slice(1).split('').some(c => c === c.toUpperCase());
    if (hasInternalUpper && clean.length > 1) {
      return part;
    }
    return part.toLowerCase();
  };

  const processWord = (word: string, isFirstWord: boolean) => {
    const parts = word.split('-');
    return parts.map((part, idx) => processPart(part, isFirstWord && idx === 0)).join('-');
  };

  return words.map((word, idx) => processWord(word, idx === 0)).join(' ');
}

export default function RecordCard({ record }: { record: RegistryRecord }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const riskLabel = riskLabels[record.risk_level] || 'IMPORTANT';
  const fillColor = fillColors[record.risk_level] || 'bg-[#000c4b]';
  const pillarLabel = pillarLabels[record.pillar] || 'SYSTEM';
  const badgeClass = riskBadges[record.risk_level] || 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <Link href={`/registry/${record.code}`} className="block w-full h-full">
      <article
        onMouseEnter={handleMouseEnter}
        className="group relative overflow-hidden bg-[#111115] hover:bg-[#16161c] p-6 sm:p-7 flex flex-col justify-between h-[275px] w-full transition-all duration-300 rounded-[22px] border border-white/10 hover:border-white/20 select-none cursor-pointer shadow-lg hover:shadow-2xl"
      >
        {/* Dynamic expanding color fill circle */}
        <div
          className={`absolute w-12 h-12 rounded-full pointer-events-none transition-transform duration-700 ease-out origin-center scale-0 group-hover:scale-[25] opacity-0 group-hover:opacity-100 ${fillColor}`}
          style={{
            left: `${mousePos.x - 24}px`,
            top: `${mousePos.y - 24}px`,
          }}
        />

        {/* Content container - placed above the background circle */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full pointer-events-none">
          
          {/* Top Metadata Header - Fades in and slides down */}
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[11px] font-bold tracking-normal text-white/80">
              #{record.code}
            </span>
            <span className={`font-mono text-[9.5px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border transition-all ${badgeClass} group-hover:bg-white/15 group-hover:text-white group-hover:border-white/30`}>
              {riskLabel}
            </span>
          </div>

          {/* Center: Title Statement - Transitions smoothly */}
          <div className="flex-1 flex items-center pr-2 my-3 text-neutral-100 group-hover:text-white transition-colors duration-300">
            <h2 className="font-['Plus_Jakarta_Sans'] text-[16.5px] sm:text-[18px] leading-[1.35] font-normal break-words line-clamp-4">
              {toSentenceCase(record.title)}
            </h2>
          </div>

          {/* Bottom Footer Action - Fades in and slides up */}
          <div className="flex items-center justify-between w-full pt-2 border-t border-white/10 group-hover:border-white/20 transition-colors">
            <span className="font-mono text-[10.5px] font-bold tracking-wider text-neutral-400 group-hover:text-white/80 uppercase transition-colors">
              {pillarLabel}
            </span>
            
            <span className="font-sans text-[11.5px] font-semibold text-white/90 group-hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>View Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

        </div>
      </article>
    </Link>
  );
}
