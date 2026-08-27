import { SourceType } from '@/types';

export default function SourceBadge({ type }: { type: SourceType }) {
  return (
    <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] px-2.5 py-0.5 select-none bg-white/5 text-neutral-400 border border-white/10 rounded-md">
      {type}
    </span>
  );
}
