import { RiskLevel } from '@/types';

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const styles = {
    stable: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    critical: 'bg-red-500/10 text-red-400 border-red-500/25',
  };

  return (
    <span
      className={`font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-md border select-none ${styles[level] || styles.stable}`}
    >
      {level}
    </span>
  );
}
