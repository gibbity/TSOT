import type { Metadata } from 'next';
import { DM_Sans, Lora } from 'next/font/google';
import './globals.css';
import Masthead from '@/components/layout/Masthead';
import Footer from '@/components/layout/Footer';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-gambarino',
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'The Sign of Times — Human-AI Interaction Research Registry',
  description: 'An industrial ledger recording empirical findings on how artificial intelligence shapes cognitive architectures and human behaviors.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`} suppressHydrationWarning>
      <body className="bg-white min-h-screen flex flex-col font-sans text-carbon antialiased" suppressHydrationWarning>
        <Masthead />
        <div className="flex-grow w-full">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
