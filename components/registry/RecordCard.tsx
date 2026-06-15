'use client';

import { useState } from 'react';
import { RegistryRecord } from '@/types';
import Link from 'next/link';

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
};

export default function RecordCard({ record }: { record: RegistryRecord }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const riskLabel = riskLabels[record.risk_level] || 'IMPORTANT';
  const fillColor = fillColors[record.risk_level] || 'bg-[#000c4b]';
  const pillarLabel = pillarLabels[record.pillar] || 'SYSTEM';

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
        className="group relative overflow-hidden bg-[#f8f8f8] px-7 py-7 flex flex-col justify-between h-[270px] w-full transition-all duration-300 rounded-[22px] shadow-[5px_7px_4px_0px_rgba(0,0,0,0.25)] border-none select-none cursor-pointer"
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
          <div className="flex items-center justify-between w-full opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
            <span className="font-sans text-[11px] font-bold tracking-wider text-white/70">
              #{record.code}
            </span>
            <span className="font-sans text-[11px] font-bold tracking-wider uppercase text-white">
              {riskLabel}
            </span>
          </div>

          {/* Center: Title Statement - Transitions from black to white */}
          <div className="flex-1 flex items-center pr-2 my-4 transition-colors duration-500 text-carbon group-hover:text-white">
            <h2 className="font-gambarino text-[18px] sm:text-[20px] leading-[1.3] font-normal break-words line-clamp-4">
              {record.title}
            </h2>
          </div>

          {/* Bottom Footer Action - Fades in and slides up */}
          <div className="flex items-center justify-between w-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
            <span className="font-sans text-[11px] font-bold tracking-wider text-white/70 uppercase">
              {pillarLabel}
            </span>
            
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all">
              View brief
            </span>
          </div>

        </div>
      </article>
    </Link>
  );
}
