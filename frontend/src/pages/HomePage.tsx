import React from 'react';
import { Play, Hand, BarChart3, Bot, Sparkles, ShieldCheck, ArrowRight, Activity, Terminal, Cpu } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* 01. Mint-Green Hero Panel (Inspired by Reference 2 - SohanCK) */}
      <section className="relative overflow-hidden bg-[#62F5AD] border-[3px] border-[#111111] rounded-3xl p-8 sm:p-12 md:p-16 shadow-neo-xl">
        {/* Playful Neo-Brutalist Geometric Badges */}
        <div className="absolute top-6 right-6 flex flex-wrap gap-2 pointer-events-none">
          <span className="px-3 py-1 bg-[#D9FF55] border-[2px] border-[#111111] rounded-full font-display font-black text-xs uppercase shadow-neo-sm">
            ★ 3D ARCADE
          </span>
          <span className="px-3 py-1 bg-[#BDA5FF] border-[2px] border-[#111111] rounded-full font-display font-black text-xs uppercase shadow-neo-sm">
            ITTF 2026
          </span>
        </div>

        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-full shadow-neo-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#111111] animate-ping" />
            <span className="font-display font-black text-xs uppercase tracking-wider text-[#111111]">
              Next-Gen Racket Arcade
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black text-[#111111] tracking-tight uppercase leading-[0.92]">
            PONG <span className="underline decoration-wavy decoration-[#111111] decoration-3">AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#111111] font-semibold max-w-xl leading-relaxed">
            A 3D arcade table tennis experience controlled with real-time hand gestures and enhanced by Gemma 4 AI coaching.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button
              variant="ink"
              size="lg"
              onClick={() => onNavigate('/play')}
              className="text-base"
            >
              <Play className="w-5 h-5 fill-current" />
              PLAY NOW ↗
            </Button>
            <Button
              variant="white"
              size="lg"
              onClick={() => onNavigate('/play')}
              className="text-base"
            >
              <Hand className="w-5 h-5" />
              TRY GESTURE CONTROL
            </Button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-4 py-3 font-display font-black text-sm uppercase tracking-wider text-[#111111] hover:underline"
            >
              VIEW STATS →
            </button>
          </div>
        </div>

        {/* Hero Interactive Mini-Preview Table Graphic */}
        <div className="mt-8 pt-8 border-t-[2px] border-[#111111]/30 flex flex-wrap items-center justify-between text-xs font-mono font-bold text-[#111111] gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#111111]" />
            <span>Zero Cloud Latency · In-Browser MediaPipe WebAssembly</span>
          </div>
          <div className="flex gap-4">
            <span>Table: 2.74m × 1.525m</span>
            <span>Net: 15.25cm</span>
            <span>Ball: 40mm</span>
          </div>
        </div>
      </section>

      {/* 02. Structured Bento Feature Cards (Inspired by Reference 1 - Athena Museum) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-[#111111]">
            Core Subsystems
          </h2>
          <span className="font-mono text-xs font-bold text-[#737373]">
            [01 // 03 MODULES]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Gesture Control */}
          <Card
            variant="white"
            interactive
            onClick={() => onNavigate('/play')}
            className="flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#62F5AD] border-[2px] border-[#111111] rounded-xl flex items-center justify-center shadow-neo-sm">
                <Hand className="w-6 h-6 text-[#111111]" />
              </div>
              <Badge variant="mint">Vision Pipeline</Badge>
              <h3 className="text-2xl font-display font-black uppercase text-[#111111]">
                Gesture Control
              </h3>
              <p className="text-sm text-[#525252] font-medium leading-relaxed">
                21-point hand tracking powered by MediaPipe. Wrist-origin anchoring and 1€ adaptive smoothing eliminate tremor with zero lag.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t-[2px] border-[#111111]/10 flex items-center justify-between font-display font-black text-xs uppercase text-[#111111]">
              <span>Play With Hand Gestures</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>

          {/* Card 2: Adaptive Opponent */}
          <Card
            variant="cream"
            interactive
            onClick={() => onNavigate('/play')}
            className="flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#D9FF55] border-[2px] border-[#111111] rounded-xl flex items-center justify-center shadow-neo-sm">
                <Activity className="w-6 h-6 text-[#111111]" />
              </div>
              <Badge variant="lime">Deterministic Physics</Badge>
              <h3 className="text-2xl font-display font-black uppercase text-[#111111]">
                Adaptive Opponent
              </h3>
              <p className="text-sm text-[#525252] font-medium leading-relaxed">
                ITTF 2026 table dimensions (§2.1) and 120Hz sub-stepped continuous collision detection. Dynamic reaction curves adapt to your skill.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t-[2px] border-[#111111]/10 flex items-center justify-between font-display font-black text-xs uppercase text-[#111111]">
              <span>Start Match</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>

          {/* Card 3: AI Coaching */}
          <Card
            variant="white"
            interactive
            onClick={() => onNavigate('/coach')}
            className="flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#BDA5FF] border-[2px] border-[#111111] rounded-xl flex items-center justify-center shadow-neo-sm">
                <Bot className="w-6 h-6 text-[#111111]" />
              </div>
              <Badge variant="lavender">LangGraph + Gemma 4</Badge>
              <h3 className="text-2xl font-display font-black uppercase text-[#111111]">
                AI Coaching
              </h3>
              <p className="text-sm text-[#525252] font-medium leading-relaxed">
                Evidence-grounded observations, tactical drills, and statutory ITTF citations. Seamless fallback to deterministic rules engine.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t-[2px] border-[#111111]/10 flex items-center justify-between font-display font-black text-xs uppercase text-[#111111]">
              <span>Review Coaching</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>
        </div>
      </section>

      {/* 03. Real Technology Strip */}
      <section className="bg-[#FFFFFF] border-[3px] border-[#111111] rounded-2xl p-6 shadow-neo">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-[2px] border-[#111111]/20">
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#111111]">
              Active Tech Stack
            </h4>
            <p className="text-xs text-[#737373]">
              Pure engineering modules verified via Graphify AST extraction
            </p>
          </div>
          <Button variant="white" size="sm" onClick={() => onNavigate('/architecture')}>
            Explore Architecture ↗
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-4 text-center">
          <div className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl font-display font-black text-xs">
            <span className="block text-[10px] text-[#737373] uppercase mb-0.5">UI Stack</span>
            React 19 + Vite
          </div>
          <div className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl font-display font-black text-xs">
            <span className="block text-[10px] text-[#737373] uppercase mb-0.5">3D Arena</span>
            Three.js / R3F
          </div>
          <div className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl font-display font-black text-xs">
            <span className="block text-[10px] text-[#737373] uppercase mb-0.5">Tracking</span>
            MediaPipe Wasm
          </div>
          <div className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl font-display font-black text-xs">
            <span className="block text-[10px] text-[#737373] uppercase mb-0.5">Orchestrator</span>
            FastAPI / Python
          </div>
          <div className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl font-display font-black text-xs">
            <span className="block text-[10px] text-[#737373] uppercase mb-0.5">Local LLM</span>
            Ollama Gemma 4
          </div>
          <div className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl font-display font-black text-xs">
            <span className="block text-[10px] text-[#737373] uppercase mb-0.5">Realtime</span>
            Node Socket.IO
          </div>
          <div className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl font-display font-black text-xs">
            <span className="block text-[10px] text-[#737373] uppercase mb-0.5">Code Graph</span>
            Graphify AST
          </div>
        </div>
      </section>
    </div>
  );
};
