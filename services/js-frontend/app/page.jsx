// app/page.jsx
"use client";

import React, { useState, useEffect } from 'react';

export default function PolyglotDashboard() {
  const [inferences, setInferences] = useState([]);
  const [status, setStatus] = useState("CONNECTING...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/inferences`);
        if (res.ok) {
          const data = await res.json();
          setInferences(data);
          setStatus("NEURAL COUPLING ACTIVE");
        } else {
          setStatus("API DISCONNECTED");
        }
      } catch (err) {
        setStatus("GATEWAY UNREACHABLE");
        // Fallback mock data for visual demonstration
        setInferences([
          { id: 1, originalText: "Optimization tensor variance exceeded threshold...", sentimentClassification: "ANOMALY_94%", confidenceScore: 0.9421, processingTimeMs: 42, createdAt: new Date().toISOString() },
          { id: 2, originalText: "Standard tokenized stream verified and ingested...", sentimentClassification: "ROUTINE_88%", confidenceScore: 0.8812, processingTimeMs: 38, createdAt: new Date(Date.now() - 5000).toISOString() },
          { id: 3, originalText: "C++ memory allocation stable during matrix rotation...", sentimentClassification: "OPTIMAL_99%", confidenceScore: 0.9910, processingTimeMs: 14, createdAt: new Date(Date.now() - 12000).toISOString() },
        ]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return `[${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}]`;
  };

  return (
    <main className="min-h-screen bg-ledger-black font-sans relative selection:bg-ledger-accent selection:text-ledger-black p-4 md:p-8">
      <div className="film-grain"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header section */}
        <header className="border-b border-ledger-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-ledger-accent border border-ledger-accent px-2 py-0.5 tracking-widest uppercase">Field Log // No. 0428</span>
              <span className="font-mono text-xs text-ledger-text-muted tracking-widest uppercase">Polyglot 6-Node AI Fabric</span>
            </div>
            <h1 className="text-4xl font-serif text-ledger-text-main tracking-wide">Telemetry Journal & Service Ledger</h1>
            <p className="text-ledger-text-muted mt-2 font-mono text-sm">
              Edge Gateway <span className="text-ledger-accent">Java v17</span> — AMQP Stream — Scikit-Learn ML — C++ Ingestion
            </p>
          </div>
          
          <div className="text-right font-mono text-xs flex flex-col items-end">
            <span className="flex items-center gap-2 text-ledger-accent">
              <span className="w-2 h-2 rounded-full bg-ledger-accent animate-pulse"></span>
              {status}
            </span>
            <span className="mt-1 text-ledger-text-muted">LATENCY: 38ms // SUPABASE SYNC</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Inference Stream Panel */}
          <section className="lg:col-span-2 border border-ledger-border bg-ledger-panel p-6">
            <div className="flex justify-between items-center mb-6 border-b border-ledger-border pb-4">
              <h2 className="text-2xl font-serif text-ledger-text-main">Recorded Inferences</h2>
              <span className="font-mono text-xs text-ledger-text-muted tracking-widest">STREAM: AMQP → REST</span>
            </div>
            
            <div className="space-y-3 font-mono text-sm">
              {inferences.length === 0 ? (
                <div className="p-4 text-ledger-text-muted text-center border border-ledger-border border-dashed">AWAITING TELEMETRY DATA...</div>
              ) : (
                inferences.map((inf, idx) => (
                  <div key={inf.id || idx} className="flex justify-between items-center p-3 border border-ledger-border hover:bg-[#23201d] transition-colors gap-4">
                    <span className="text-ledger-text-muted whitespace-nowrap">{formatTime(inf.createdAt)}</span>
                    <span className="truncate w-full max-w-xs text-ledger-text-main">"{inf.originalText}"</span>
                    <span className={`whitespace-nowrap ${inf.confidenceScore > 0.9 ? 'text-ledger-accent' : 'text-ledger-text-main'}`}>
                      {inf.sentimentClassification}
                    </span>
                    <span className="text-ledger-text-muted whitespace-nowrap hidden sm:block">{inf.processingTimeMs}ms</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 flex justify-between items-center border-t border-ledger-border pt-4">
              <span className="font-mono text-xs text-ledger-text-muted">AI Model: <span className="text-ledger-text-main">Scikit-Learn TF-IDF + LogReg</span></span>
              <button className="font-mono text-xs text-ledger-accent border border-ledger-accent px-4 py-2 hover:bg-ledger-accent hover:text-ledger-black transition-colors">
                + Inject Live Telemetry
              </button>
            </div>
          </section>

          {/* Active Services Sidebar */}
          <section className="space-y-6">
            <div className="border border-ledger-border bg-ledger-panel p-6">
              <div className="flex justify-between items-center mb-6 border-b border-ledger-border pb-4">
                <h2 className="text-xl font-serif text-ledger-text-main">Active Services</h2>
                <span className="font-mono text-xs text-ledger-accent">5 RUNNING</span>
              </div>
              
              <ul className="font-mono text-xs space-y-4">
                <li className="border border-ledger-border p-3 hover:border-ledger-accent transition-colors">
                  <div className="flex justify-between mb-1">
                    <span className="text-ledger-text-main">Gateway (Java / Spring Boot)</span>
                    <span className="text-ledger-accent">ONLINE</span>
                  </div>
                  <div className="text-ledger-text-muted">services/java-gateway/pom.xml</div>
                </li>
                <li className="border border-ledger-border p-3 hover:border-ledger-accent transition-colors">
                  <div className="flex justify-between mb-1">
                    <span className="text-ledger-text-main">AI Core (Python)</span>
                    <span className="text-ledger-accent">ONLINE</span>
                  </div>
                  <div className="text-ledger-text-muted">services/python-inference/main.py</div>
                </li>
                <li className="border border-ledger-border p-3 hover:border-ledger-accent transition-colors">
                  <div className="flex justify-between mb-1">
                    <span className="text-ledger-text-main">Preprocessor (C++)</span>
                    <span className="text-ledger-accent">ONLINE</span>
                  </div>
                  <div className="text-ledger-text-muted">services/cpp-preprocessor/main.cpp</div>
                </li>
                <li className="flex justify-between p-2 border-b border-ledger-border border-dashed">
                  <span className="text-ledger-text-muted">Relational DB (Supabase/SQL)</span>
                  <span className="text-ledger-text-main">SYNCING</span>
                </li>
                <li className="flex justify-between p-2">
                  <span className="text-ledger-text-muted">Document DB (MongoDB)</span>
                  <span className="text-ledger-text-main">SYNCING</span>
                </li>
              </ul>
            </div>
          </section>

        </div>

        {/* Dossier Footer */}
        <footer className="border border-ledger-border bg-ledger-panel p-6">
          <div className="flex justify-between items-center mb-6 border-b border-ledger-border pb-4">
            <h2 className="text-sm font-mono text-ledger-accent tracking-widest uppercase">Author Dossier // B.Tech Computer Science</h2>
            <span className="font-mono text-xs text-ledger-text-muted tracking-widest">CORE CS FOUNDATIONS → DISTRIBUTED AI</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-sm">
            <div className="border border-ledger-border p-4">
              <span className="text-ledger-accent text-xs block mb-2">LANGUAGES</span>
              <span className="text-ledger-text-main font-bold">Python, C, C++, Java, JS</span>
              <span className="text-ledger-text-muted text-xs block mt-1">Applied: Microservices & Data</span>
            </div>
            <div className="border border-ledger-border p-4">
              <span className="text-ledger-accent text-xs block mb-2">DATABASES</span>
              <span className="text-ledger-text-main font-bold">SQL & MongoDB</span>
              <span className="text-ledger-text-muted text-xs block mt-1">Relational + Document</span>
            </div>
            <div className="border border-ledger-border p-4">
              <span className="text-ledger-accent text-xs block mb-2">AI & ML (IN PROGRESS)</span>
              <span className="text-ledger-text-main font-bold">Data Preprocessing & EDA</span>
              <span className="text-ledger-text-muted text-xs block mt-1">Algorithms & Scikit-Learn</span>
            </div>
          </div>
        </footer>

        <div className="flex justify-between font-mono text-xs text-ledger-text-muted uppercase tracking-widest pb-8">
          <span>ESTABLISHED 2026 // HAND-CRAFTED VINTAGE LEDGER UI</span>
          <span>PALETTE: DEEP BLACK #141210 — AMBER #F9A826</span>
        </div>

      </div>
    </main>
  );
}
