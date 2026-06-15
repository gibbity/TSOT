'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Newsletter', href: '/#newsletter' },
  { label: 'Registry', href: '/registry' },
  { label: 'Auditor', href: '/auditor' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/about' },
];

export default function Masthead() {
  const path = usePathname();

  return (
    <header className="bg-white w-full">
      {/* Top block: Logo and Action buttons */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-4 relative">
        {/* Left spacer on desktop to balance the right-aligned buttons */}
        <div className="hidden md:block w-[200px]" />

        {/* Centered Logo */}
        <h1 className="font-gambarino text-[32px] sm:text-[38px] md:text-[44px] leading-none text-carbon select-none font-normal text-center">
          <Link href="/" className="hover:text-mid-concrete transition-colors">
            The Sign of Times
          </Link>
        </h1>

        {/* Right-aligned Sign In & Subscribe */}
        <div className="flex items-center gap-6 md:w-[200px] justify-end">
          <Link
            href="/#signin"
            className="font-sans text-[13px] font-bold uppercase tracking-wider text-carbon hover:text-premium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/#subscribe"
            className="bg-[#3a66f5] hover:bg-[#254edb] text-white font-sans text-[12px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-[10px] transition-colors whitespace-nowrap shadow-sm"
          >
            Subscribe
          </Link>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="max-w-[1200px] mx-auto px-6 pb-5">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-2">
          {NAV.map(item => {
            const isActive = path === item.href || (item.href !== '/' && !item.href.startsWith('/#') && path.startsWith(item.href));
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`font-gambarino text-[15px] md:text-[17px] tracking-wide transition-colors relative py-1 ${
                    isActive
                      ? 'text-[#3a66f5] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#3a66f5]'
                      : 'text-carbon hover:text-[#3a66f5]'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Double Border Divider below Header */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="border-t-2 border-carbon"></div>
        <div className="border-t border-carbon mt-[3px] mb-8"></div>
      </div>
    </header>
  );
}
