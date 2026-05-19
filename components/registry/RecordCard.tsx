import { RegistryRecord } from '@/types';
import Link from 'next/link';

const riskLabels: Record<string, string> = {
  critical: 'CRITICAL',
  warning: 'IMPORTANT',
  stable: 'NECESSARY',
};

const riskColors: Record<string, string> = {
  critical: 'text-critical',
  warning: 'text-warning',
  stable: 'text-stable',
};

const pillarLabels: Record<string, string> = {
  'COGNITIVE OFFLOADING': 'REASONING',
  'FRICTION & VERIFICATION': 'USER EXPERIENCE',
  'TEMPORAL PERCEPTION': 'ATTENTION',
  'EPISTEMIC AGENCY': 'ETHICS',
};

export default function RecordCard({ record }: { record: RegistryRecord }) {
  const riskLabel = riskLabels[record.risk_level] || 'IMPORTANT';
  const riskColor = riskColors[record.risk_level] || 'text-warning';
  const pillarLabel = pillarLabels[record.pillar] || 'SYSTEM';

  return (
    <Link href={`/registry/${record.code}`} className="block w-full h-full">
      <article className="bg-white px-6 py-6 relative flex flex-col justify-between h-[250px] group transition-colors hover:bg-concrete/30 cursor-pointer border-r border-b border-border">
        {/* Top-Left Framing Accent (Brutalist corner ticks) */}
        <span className="absolute top-0 left-0 w-3 h-[1px] bg-border group-hover:bg-carbon transition-colors"></span>
        <span className="absolute top-0 left-0 h-3 w-[1px] bg-border group-hover:bg-carbon transition-colors"></span>

        {/* Top Metadata Header */}
        <div className="flex items-center justify-between w-full">
          <span className="font-mono text-[10px] tracking-widest text-mid-concrete group-hover:text-carbon transition-colors uppercase">
            #{record.code}
          </span>
          <span className={`font-sans text-[10px] font-bold tracking-widest uppercase ${riskColor}`}>
            {riskLabel}
          </span>
        </div>

        {/* Center: Major Serified Finding statement */}
        <div className="flex-1 flex items-center pr-2 my-4">
          <h2 className="font-gambarino text-[18px] sm:text-[20px] md:text-[21px] leading-[1.3] text-carbon font-normal tracking-[-0.01em] line-clamp-3 group-hover:underline decoration-signal decoration-1 underline-offset-4">
            {record.title}
          </h2>
        </div>

        {/* Bottom Footer Action */}
        <div className="flex items-center justify-between w-full mt-auto">
          <span className="font-sans text-[10px] font-bold tracking-wider text-mid-concrete uppercase">
            {pillarLabel}
          </span>
          
          {/* Custom L-shape bracketed button with offset border ticks */}
          <div className="relative inline-block py-1 px-2 select-none">
            <span className="font-mono text-[9px] tracking-wider text-mid-concrete group-hover:text-carbon uppercase transition-colors">
              [VIEW BRIEF]
            </span>
            {/* L-shaped border offset lines */}
            <span className="absolute bottom-0 right-0 w-2 h-[1px] bg-border group-hover:bg-carbon group-hover:w-full transition-all duration-300"></span>
            <span className="absolute bottom-0 right-0 h-2 w-[1px] bg-border group-hover:bg-carbon group-hover:h-full transition-all duration-300"></span>
          </div>
        </div>
      </article>
    </Link>
  );
}
