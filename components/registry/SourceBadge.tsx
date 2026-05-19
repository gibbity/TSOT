import { SourceType } from '@/types';

export default function SourceBadge({ type }: { type: SourceType }) {
  return (
    <span className="font-sans text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 select-none bg-concrete text-mid-concrete border border-border">
      {type}
    </span>
  );
}
