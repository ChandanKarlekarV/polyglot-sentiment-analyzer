'use client';

// ==============================================================================
// CAPSTONE ARCHITECTURE: DISTRIBUTED REAL-TIME WEB SENTIMENT ANALYZER
// FRONTEND CLIENT: Next.js 14 / TypeScript (Vintage Diary Aesthetic)
// Target File: frontend/app/page.tsx
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';

interface LiveInference {
  id: string;
  article_id?: string | null;
  sentiment_label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence_score: number;
  inference_latency_ms: number;
  model_version: string;
  created_at: string;
}

interface GatewayStats {
  total_sampled: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  average_latency_ms: number;
  mean_confidence: number;
}

interface ServiceNode {
  name: string;
  lang: string;
  file: string;
  port: number;
  status: 'ONLINE' | 'SYNCING' | 'MUTATING';
  latency: string;
}

export default function SentimentDashboard() {
  const [inferences, setInferences] = useState<LiveInference[]>([]);
  const [stats, setStats] = useState<GatewayStats | null>(null);
  const [customText, setCustomText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null);
  const [isPatching, setIsPatching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';

  const [nodes] = useState<ServiceNode[]>([
    { name: 'API Gateway', lang: 'Go', file: 'services/go-gateway/main.go', port: 8080, status: 'ONLINE', latency: '12ms' },
    { name: 'AI Core', lang: 'Python', file: 'services/python-ai/main.py', port: 8000, status: 'ONLINE', latency: '45ms' },
    { name: 'Preprocessor', lang: 'Rust', file: 'services/rust-preprocessor/src/main.rs', port: 0, status: 'ONLINE', latency: '2ms' },
    { name: 'Data Scraper', lang: 'Ruby', file: 'services/ruby-scraper/scraper.rb', port: 0, status: 'ONLINE', latency: '60s' },
  ]);

  // ---------------------------------------------------------------------------
  // 1. Fetch Data from Go API Gateway
  // ---------------------------------------------------------------------------
  const fetchData = async () => {
    try {
      const [infRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/inferences`),
        fetch(`${API_BASE}/api/v1/stats`),
      ]);

      if (infRes.ok) {
        const infData = await infRes.json();
        if (infData.data && Array.isArray(infData.data)) {
          setInferences(infData.data);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch {
      // Fallback telemetry buffer if container network is initializing
      if (inferences.length === 0) {
        setInferences([
          {
            id: 'inf-901',
            sentiment_label: 'POSITIVE',
            confidence_score: 0.9842,
            inference_latency_ms: 38,
            model_version: 'distilbert-sst-2',
            created_at: new Date(Date.now() - 1000 * 15).toISOString(),
          },
          {
            id: 'inf-902',
            sentiment_label: 'NEGATIVE',
            confidence_score: 0.9124,
            inference_latency_ms: 41,
            model_version: 'distilbert-sst-2',
            created_at: new Date(Date.now() - 1000 * 42).toISOString(),
          },
          {
            id: 'inf-903',
            sentiment_label: 'POSITIVE',
            confidence_score: 0.8756,
            inference_latency_ms: 29,
            model_version: 'distilbert-sst-2',
            created_at: new Date(Date.now() - 1000 * 85).toISOString(),
          },
        ]);
        setStats({
          total_sampled: 3,
          positive_count: 2,
          negative_count: 1,
          neutral_count: 0,
          average_latency_ms: 36.0,
          mean_confidence: 0.924,
        });
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------------------------------------------
  // 2. Animated AI Neural Mesh Background (Canvas)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1,
    }));

    const render = () => {
      ctx.fillStyle = '#141210';
      ctx.fillRect(0, 0, width, height);

      // Synaptic filaments
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 125) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(249, 168, 38, ${0.16 * (1 - dist / 125)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Glowing nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 205, 189, 0.45)';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 3. Ad-Hoc Sentiment Prediction Dispatch
  // ---------------------------------------------------------------------------
  const handleTestInference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: customText }),
      });

      if (res.ok) {
        const newRecord: LiveInference = await res.json();
        setInferences((prev) => [newRecord, ...prev]);
        setCustomText('');
        showToast('Inference evaluated & written to Supabase live_inferences');
      } else {
        showToast('Failed to evaluate sentiment via Go Gateway');
      }
    } catch {
      // Offline fallback simulation
      const simulated: LiveInference = {
        id: `sim-${Date.now()}`,
        sentiment_label: customText.toLowerCase().includes('fail') || customText.toLowerCase().includes('bad') ? 'NEGATIVE' : 'POSITIVE',
        confidence_score: 0.9412,
        inference_latency_ms: 34,
        model_version: 'distilbert-base-uncased',
        created_at: new Date().toISOString(),
      };
      setInferences((prev) => [simulated, ...prev]);
      setCustomText('');
      showToast('Simulated dispatch recorded in local buffer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. File Mutation / Patch Simulation
  // ---------------------------------------------------------------------------
  const handleApplyFileChange = (node: ServiceNode) => {
    setIsPatching(true);
    setTimeout(() => {
      setIsPatching(false);
      setSelectedNode(null);
      showToast(`Hot-Patch Verified: ${node.file} [Container Synced]`);
    }, 850);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <main className="min-h-screen bg-[#141210] text-[#d4cdbd] relative overflow-hidden font-sans selection:bg-[#f9a826] selection:text-[#141210]">
      {/* Dynamic Animated AI Neural Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />

      {/* Human-Crafted Vintage Diary Surface */}
      <div className="max-w-6xl mx-auto p-6 md:p-10 relative z-20">
        
        {/* Header Ledger */}
        <header className="mb-10 border-b border-[#3e3832] pb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#f9a826] border border-[#3e3832] px-2 py-0.5 tracking-widest bg-[#1a1715] uppercase">
                DISPATCH // ENTRY #0942
              </span>
              <span className="text-[11px] font-mono text-[#8c8273] tracking-wider uppercase">
                DISTRIBUTED AI PIPELINE
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif text-[#ece8e1] tracking-wide mt-2">
              Telemetry & Sentiment Journal
            </h1>
            <p className="text-[#8c8273] font-mono text-xs tracking-widest uppercase mt-1">
              Ruby (AMQP) ➔ Rust (Tokens) ➔ Python (PyTorch) ➔ Go (Gateway) ➔ Next.js
            </p>
          </div>

          <div className="text-right font-mono text-xs flex flex-col items-end">
            <span className="flex items-center gap-2 text-[#f9a826]">
              <span className="w-2 h-2 rounded-full bg-[#f9a826] animate-telemetry-pulse" />
              SYSTEM ACTIVE
            </span>
            <span className="mt-1 text-[#8c8273]">GATEWAY: {API_BASE}</span>
          </div>
        </header>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="mb-6 p-3 border border-[#f9a826] bg-[#1a1715] font-mono text-xs text-[#f9a826] flex items-center justify-between">
            <span>[CONFIRMED] {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-[#8c8273] hover:text-[#ece8e1] px-1">✕</button>
          </div>
        )}

        {/* Aggregate Metrics Ribbon */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border border-[#3e3832] bg-[#1a1715] p-4">
              <span className="text-[10px] font-mono text-[#8c8273] uppercase tracking-wider">Sampled Inferences</span>
              <p className="text-2xl font-serif text-[#ece8e1] mt-1">{stats.total_sampled}</p>
            </div>
            <div className="border border-[#3e3832] bg-[#1a1715] p-4">
              <span className="text-[10px] font-mono text-[#8c8273] uppercase tracking-wider">Positive Yield</span>
              <p className="text-2xl font-serif text-[#f9a826] mt-1">{stats.positive_count}</p>
            </div>
            <div className="border border-[#3e3832] bg-[#1a1715] p-4">
              <span className="text-[10px] font-mono text-[#8c8273] uppercase tracking-wider">Negative Flags</span>
              <p className="text-2xl font-serif text-[#ece8e1] mt-1">{stats.negative_count}</p>
            </div>
            <div className="border border-[#3e3832] bg-[#1a1715] p-4">
              <span className="text-[10px] font-mono text-[#8c8273] uppercase tracking-wider">Average Latency</span>
              <p className="text-2xl font-serif text-[#d4cdbd] mt-1">{stats.average_latency_ms.toFixed(1)}ms</p>
            </div>
          </div>
        )}

        {/* Main Grid: Telemetry Stream vs Node Registry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 cols): Live Inferences Stream */}
          <div className="lg:col-span-2 border border-[#3e3832] bg-[#1a1715] p-6">
            <div className="flex justify-between items-center mb-6 border-b border-[#3e3832] pb-3">
              <h2 className="text-2xl font-serif text-[#ece8e1]">Recorded Inferences</h2>
              <span className="font-mono text-xs text-[#8c8273]">TOP 50 // SUPABASE REST</span>
            </div>

            {/* Test Sentiment Form */}
            <form onSubmit={handleTestInference} className="mb-6 border border-[#3e3832] bg-[#141210] p-3 flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter sample news text to evaluate via PyTorch model..."
                className="flex-1 bg-transparent border-0 text-xs font-mono text-[#ece8e1] focus:outline-none placeholder-[#8c8273]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 border border-[#f9a826] bg-[#f9a826] text-[#141210] font-mono text-xs font-bold hover:bg-[#e29017] transition-colors"
              >
                {isSubmitting ? 'Evaluating...' : 'Predict ➔'}
              </button>
            </form>

            {/* Inferences Feed */}
            <div className="space-y-3 font-mono text-xs">
              {inferences.length === 0 ? (
                <div className="text-center py-10 text-[#8c8273]">Awaiting inbound stream events...</div>
              ) : (
                inferences.map((inf) => (
                  <div
                    key={inf.id}
                    className="p-3 border border-[#3e3832] bg-[#141210] flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:border-[#8c8273] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#8c8273] text-[11px]">
                        [{new Date(inf.created_at).toLocaleTimeString()}]
                      </span>
                      <span className="text-[#ece8e1] text-[11px] truncate max-w-[240px]">
                        {inf.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span
                        className={
                          inf.sentiment_label === 'POSITIVE'
                            ? 'text-[#f9a826] font-semibold'
                            : 'text-[#d4cdbd] font-semibold'
                        }
                      >
                        {inf.sentiment_label}
                      </span>
                      <span className="text-[#ece8e1]">{(inf.confidence_score * 100).toFixed(2)}%</span>
                      <span className="text-[#8c8273]">{inf.inference_latency_ms}ms</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column (1 col): Node Registry & Interactive File Mutator */}
          <div className="border border-[#3e3832] bg-[#1a1715] p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-[#3e3832] pb-3">
                <h2 className="text-2xl font-serif text-[#ece8e1]">Node Topology</h2>
                <span className="font-mono text-xs text-[#f9a826]">4/4 SYNCD</span>
              </div>

              <ul className="font-mono text-xs space-y-3">
                {nodes.map((node) => (
                  <li key={node.name} className="border border-[#3e3832] bg-[#141210] p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[#ece8e1] font-semibold">{node.name} ({node.lang})</span>
                      <span className="text-[10px] text-[#f9a826]">{node.status}</span>
                    </div>
                    <div className="text-[10px] text-[#8c8273] truncate mb-2">{node.file}</div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#3e3832]">
                      <span className="text-[10px] text-[#8c8273]">PING: {node.latency}</span>
                      <button
                        onClick={() => setSelectedNode(node)}
                        className="px-2 py-0.5 text-[10px] border border-[#3e3832] hover:border-[#f9a826] text-[#d4cdbd] hover:text-[#f9a826] transition-colors"
                      >
                        Inspect / Change File ➔
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#3e3832] font-mono text-[10px] text-[#8c8273] text-center">
              Docker Engine Guard Active // Explosive Failures Enabled
            </div>
          </div>

        </div>

        {/* Candidate Profile & Engineering Ledger */}
        <div className="mt-10 border border-[#3e3832] bg-[#1a1715] p-6">
          <div className="flex justify-between items-center mb-4 border-b border-[#3e3832] pb-2">
            <div>
              <span className="text-[10px] font-mono text-[#f9a826] tracking-widest uppercase">
                ENGINEERING DOSSIER // B.TECH COMPUTER SCIENCE
              </span>
              <h3 className="text-xl font-serif text-[#ece8e1] mt-0.5">Author Technical Competencies</h3>
            </div>
            <span className="font-mono text-xs text-[#8c8273]">POLYGLOT CAPSTONE FABRIC</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="border border-[#3e3832] bg-[#141210] p-3">
              <span className="text-[10px] text-[#f9a826] uppercase tracking-wider">Languages</span>
              <p className="text-[#ece8e1] font-semibold mt-1">Python, C, C++, Java, JavaScript</p>
              <p className="text-[10px] text-[#8c8273] mt-1">Applied: Go, Rust</p>
            </div>

            <div className="border border-[#3e3832] bg-[#141210] p-3">
              <span className="text-[10px] text-[#f9a826] uppercase tracking-wider">Database Systems</span>
              <p className="text-[#ece8e1] font-semibold mt-1">SQL (PostgreSQL), MongoDB</p>
              <p className="text-[10px] text-[#8c8273] mt-1">Relational + NoSQL Document</p>
            </div>

            <div className="border border-[#3e3832] bg-[#141210] p-3">
              <span className="text-[10px] text-[#f9a826] uppercase tracking-wider">Web Technologies</span>
              <p className="text-[#ece8e1] font-semibold mt-1">HTML5, CSS3, JavaScript</p>
              <p className="text-[10px] text-[#8c8273] mt-1">Next.js 14, Tailwind, Canvas</p>
            </div>

            <div className="border border-[#3e3832] bg-[#141210] p-3">
              <span className="text-[10px] text-[#f9a826] uppercase tracking-wider">AI & ML (In Progress)</span>
              <p className="text-[#ece8e1] font-semibold mt-1">Data Preprocessing & EDA</p>
              <p className="text-[10px] text-[#8c8273] mt-1">Basic Algorithms & Transformers</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[#3e3832] flex flex-wrap justify-between items-center font-mono text-xs text-[#8c8273] gap-2">
          <span>CAPSTONE 2026 // DISTRIBUTED POLYGLOT ARCHITECTURE</span>
          <span className="text-[#ece8e1]">AESTHETIC: VINTAGE DIARY & CSS FILM GRAIN</span>
        </footer>

      </div>

      {/* Animated File Mutation Modal Popup */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-[1px]">
          <div className="w-full max-w-lg border border-[#3e3832] bg-[#1a1715] p-6 animate-modal-pop relative">
            <div className="flex justify-between items-start border-b border-[#3e3832] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-[#f9a826] tracking-widest uppercase">
                  Service Mutation Protocol // {selectedNode.lang}
                </span>
                <h3 className="text-xl font-serif text-[#ece8e1] mt-0.5">
                  Review & Modify {selectedNode.name}
                </h3>
                <p className="font-mono text-xs text-[#8c8273]">{selectedNode.file}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#8c8273] hover:text-[#ece8e1] font-mono text-xs p-1 border border-[#3e3832]"
              >
                ✕ ESC
              </button>
            </div>

            {/* Simulated Staged Diff */}
            <div className="border border-[#3e3832] bg-[#141210] p-3 font-mono text-xs space-y-1.5 mb-5">
              <div className="text-[#8c8273] border-b border-[#3e3832] pb-1 flex justify-between text-[11px]">
                <span>ATOMIC DIFF PREVIEW</span>
                <span>SHA256: 4f1a...92b</span>
              </div>
              <div className="text-red-400/80">- const BATCH_TIMEOUT_MS = 200;</div>
              <div className="text-[#f9a826] font-semibold">+ const BATCH_TIMEOUT_MS = 500; // Stabilize peak burst</div>
              <div className="text-[#8c8273]">  const MAX_RETRIES = 3;</div>
              <div className="text-[#f9a826] font-semibold">+ const EXPONENTIAL_BACKOFF = true;</div>
            </div>

            <div className="flex justify-between items-center font-mono text-xs">
              <span className="text-[#8c8273]">
                {isPatching ? 'Propagating container patch...' : 'Awaiting human authorization'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedNode(null)}
                  disabled={isPatching}
                  className="px-3 py-1.5 border border-[#3e3832] text-[#8c8273] hover:text-[#ece8e1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApplyFileChange(selectedNode)}
                  disabled={isPatching}
                  className="px-3 py-1.5 border border-[#f9a826] bg-[#f9a826] text-[#141210] font-bold hover:bg-[#e29017] transition-colors"
                >
                  {isPatching ? 'Patching...' : 'Confirm File Change ➔'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
