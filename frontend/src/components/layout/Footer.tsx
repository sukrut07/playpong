import React from 'react';

export const Footer: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t-[3px] border-[#111111] bg-[#FFFFFF] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏓</span>
              <span className="font-display font-black text-xl text-[#111111] uppercase">
                PONG AI
              </span>
            </div>
            <p className="text-xs text-[#525252] font-medium leading-relaxed">
              3D arcade table tennis controlled with on-device webcam hand gestures, powered by Gemma 4 AI coaching and audited ITTF 2026 rules.
            </p>
          </div>

          {/* Game Modes */}
          <div className="space-y-2">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#111111]">
              Gameplay
            </h4>
            <ul className="space-y-1.5 text-xs font-semibold text-[#525252]">
              <li>
                <button onClick={() => onNavigate('/play')} className="hover:text-[#111111]">
                  Player vs AI
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/gesture-lab')} className="hover:text-[#111111]">
                  Gesture Lab Calibration
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/dashboard')} className="hover:text-[#111111]">
                  Match Telemetry
                </button>
              </li>
            </ul>
          </div>

          {/* AI & Knowledge */}
          <div className="space-y-2">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#111111]">
              Architecture
            </h4>
            <ul className="space-y-1.5 text-xs font-semibold text-[#525252]">
              <li>
                <button onClick={() => onNavigate('/architecture')} className="hover:text-[#111111]">
                  Graphify Code Graph
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/coach')} className="hover:text-[#111111]">
                  Gemma 4 Orchestrator
                </button>
              </li>
              <li>
                <a
                  href="https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#111111]"
                >
                  ITTF Statutes 2026 ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Trust */}
          <div className="space-y-2">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#111111]">
              Privacy First
            </h4>
            <div className="p-3 bg-[#FFFDF6] border-[2px] border-[#111111] rounded-xl text-[11px] text-[#525252] leading-snug">
              <strong className="text-[#111111] block mb-1">Zero Cloud Video</strong>
              All hand tracking runs strictly inside your browser via WebAssembly & WebGL. No camera frames ever leave your machine.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t-[2px] border-[#111111]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#737373] gap-4">
          <p>© 2026 PONG AI Project. Built with React 19, Three.js, MediaPipe & Gemma 4.</p>
          <div className="flex gap-4 font-mono text-[11px]">
            <span>AST Nodes: 990</span>
            <span>ITTF §2.1–§2.15</span>
            <span>1€ Smoother</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
