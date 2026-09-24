import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Distributed Real-Time Sentiment Analyzer | Telemetry Logbook',
  description: 'Polyglot 13-node distributed sentiment pipeline dashboard with vintage diary aesthetic.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#141210] text-[#d4cdbd] antialiased min-h-screen">
        <div className="film-grain-overlay" />
        {children}
      </body>
    </html>
  );
}
