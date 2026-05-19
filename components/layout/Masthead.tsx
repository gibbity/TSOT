'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Registry', href: '/registry' },
  { label: 'Auditor', href: '/auditor' },
  { label: 'About', href: '/about' },
];

export default function Masthead() {
  const path = usePathname();

  return (
    <header className="border-b border-border bg-white w-full">
      {/* Top bar */}
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
        <div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-mid-concrete">
            Human–AI Interaction Registry
          </span>
        </div>
        <div className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-mid-concrete">
          Est. 2026
        </div>
      </div>

      {/* Masthead Title */}
      <div className="max-w-[1200px] mx-auto px-6 py-5 border-t border-b border-border">
        <h1 className="font-gambarino text-[32px] sm:text-[48px] md:text-[60px] leading-[1.1] tracking-[-0.03em] text-carbon text-center select-none font-bold break-words">
          <Link href="/" className="hover:text-mid-concrete transition-colors">
            The Sign of Times
          </Link>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="max-w-[1200px] mx-auto px-6">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-8 py-3">
          {NAV.map(item => {
            const isActive = path === item.href || (item.href !== '/' && path.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`font-sans text-[12px] font-bold uppercase tracking-[0.08em] transition-colors relative py-1 ${
                    isActive
                      ? 'text-carbon after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-signal'
                      : 'text-mid-concrete hover:text-carbon'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="ml-auto sm:ml-auto">
            <Link
              href="/auditor"
              className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] border border-premium text-premium px-3 sm:px-4 py-1.5 hover:bg-premium hover:text-white transition-colors whitespace-nowrap"
            >
              Premium Auditor
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
