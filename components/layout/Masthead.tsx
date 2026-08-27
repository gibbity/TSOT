'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Ledger', href: '/registry' },
  { label: 'EU AI Act', href: '/ai-act' },
  { label: 'MCP Server', href: '/mcp' },
  { label: 'About', href: '/about' },
];

export default function Masthead() {
  const path = usePathname();

  return (
    <header className="bg-[#0a0a0c] w-full border-b border-white/8 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-[1140px] mx-auto px-6 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg
              className="w-5 h-5 transform rotate-[15deg] text-white fill-current group-hover:scale-105 transition-transform"
              viewBox="0 0 49 37"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.5 0C8.28273 0 0 8.28273 0 18.5C0 28.7173 8.28273 37 18.5 37H30.5C40.7173 37 49 28.7173 49 18.5C49 8.28273 40.7173 0 30.5 0H18.5ZM18.5 7.5C12.4249 7.5 7.5 12.4249 7.5 18.5C7.5 24.5751 12.4249 29.5 18.5 29.5H30.5C36.5751 29.5 41.5 24.5751 41.5 18.5C41.5 12.4249 36.5751 7.5 30.5 7.5H18.5Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="font-['Plus_Jakarta_Sans'] font-medium text-[19px] tracking-tight text-white">
            Sourceoftruth
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-sans">
          {NAV.map(item => {
            const isActive = path === item.href || (item.href !== '/' && path.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`transition-colors py-1 ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-neutral-500 hover:text-neutral-200'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/mcp"
            className="border border-white/15 hover:border-white/40 text-neutral-400 hover:text-white font-sans text-[13px] px-3.5 py-1.5 rounded-[8px] transition-all"
          >
            Use MCP
          </Link>
          <Link
            href="/waitlist"
            className="bg-white hover:bg-neutral-100 text-[#0a0a0c] font-sans font-semibold text-[13px] px-3.5 py-1.5 rounded-[8px] transition-all"
          >
            Join Waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
