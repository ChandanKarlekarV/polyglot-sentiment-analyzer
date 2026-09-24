import './globals.css';

export const metadata = {
  title: 'Polyglot AI Fabric // Real-Time Web Sentiment Analyzer',
  description: 'Flagship B.Tech Capstone Project - Distributed Multi-Language Architecture',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ledger-black text-ledger-text-main antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
