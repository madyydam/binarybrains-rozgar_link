import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'RozgarLink - Skills-to-Opportunity Matching Engine',
  description: 'Find what you can take. Learn what you need. Real-time deterministic opportunity matching for candidates and apprentices across Maharashtra.',
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2F5BFF'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F6F8FC] text-[#1B2438] min-h-screen selection:bg-[#EAF0FF] selection:text-[#2F5BFF]">
        {children}
      </body>
    </html>
  );
}
