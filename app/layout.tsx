import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import Masthead from '@/components/layout/Masthead';
import Footer from '@/components/layout/Footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-google-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
});

const gambarino = localFont({
  src: '../public/fonts/Gambarino-Regular.woff2',
  variable: '--font-gambarino',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TSOT — Model Context Protocol for EU AI Act & HCI Safety',
  description: 'Free standalone Model Context Protocol (MCP) server indexing 9,200+ peer-reviewed HCI research papers and 124 statutory Regulation (EU) 2024/1689 articles for Cursor, Claude Desktop, Windsurf, and agentic workflows.',
  keywords: [
    'Model Context Protocol',
    'MCP Server',
    'EU AI Act',
    'Regulation EU 2024/1689',
    'HCI Research',
    'Cognitive Safety',
    'AI Auditor',
    'OpenAlex'
  ],
  authors: [{ name: 'TSOT Engineering' }],
  openGraph: {
    title: 'TSOT — Model Context Protocol for EU AI Act & HCI Safety',
    description: 'Free standalone MCP server indexing 9,200+ peer-reviewed HCI research papers and 124 statutory EU AI Act articles.',
    url: 'https://tsot.ai',
    siteName: 'TSOT',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TSOT — Model Context Protocol for EU AI Act & HCI Safety',
    description: 'Free standalone MCP server indexing 9,200+ peer-reviewed HCI research papers and 124 statutory EU AI Act articles.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${dmSans.variable} ${gambarino.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
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
