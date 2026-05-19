import { RiskLevel } from '@/types';

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const styles = {
    stable: { bg: 'bg-[#E1F5EE]', text: 'text-[#1A7A4A]' },
    warning: { bg: 'bg-[#FAEEDA]', text: 'text-[#E8A020]' },
    critical: { bg: 'bg-[#FAECE7]', text: 'text-[#FF3E00]' },
  };

  return (
    <span
      className={`font-sans text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 select-none ${styles[level].bg} ${styles[level].text}`}
    >
      {level}
    </span>
  );
}
