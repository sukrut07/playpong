import React, { useState } from 'react';
import {
  Camera,
  Play,
  RotateCcw,
  Sliders,
  BarChart2,
  BookOpen,
  Network,
  Cpu,
  Users,
  Shield,
  Sparkles,
  Keyboard,
  ExternalLink,
} from 'lucide-react';
import { RuleProfile, GameDifficulty } from '../../../../shared/types';

interface LandingMenuProps {
  onStartWebcam: (ruleProfile: RuleProfile, difficulty: GameDifficulty) => void;
  onStartKeyboard: (ruleProfile: RuleProfile, difficulty: GameDifficulty) => void;
  onOpenMultiplayer: () => void;
  onOpenGestureLab: () => void;
  onOpenAnalytics: () => void;
  onOpenRules: () => void;
  onOpenArchitecture: () => void;
  onOpenSettings: () => void;
  aiStatus: {
    available: boolean;
    provider: 'gemini' | 'ollama';
    model: string;
    hasKey?: boolean;
    error?: string;
  };
  isWebcamActive: boolean;
}

export const LandingMenu: React.FC<LandingMenuProps> = ({
  onStartWebcam,
  onStartKeyboard,
  onOpenMultiplayer,
  onOpenGestureLab,
  onOpenAnalytics,
  onOpenRules,
  onOpenArchitecture,
  onOpenSettings,
  aiStatus,
  isWebcamActive,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<RuleProfile>('TABLE_TENNIS_TRAINING');
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('medium');

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm overflow-y-auto font-sans select-none">
      <div className="relative w-full max-w-4xl bg-[#FAF6EB] border-[3.5px] border-[#121212] shadow-[10px_10px_0px_#121212] flex flex-col overflow-hidden max-h-[94vh]">
        {/* Top Arcade Marquee Header */}
        <div className="px-8 py-5 border-b-[3px] border-[#121212] bg-[#CCFF00] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🏓</span>
            <div>
              <h1 className="text-3xl font-black font-display tracking-tight text-[#121212] uppercase leading-none">
                PONG AI
              </h1>
              <p className="text-xs font-mono font-bold text-[#121212] mt-1 tracking-wider uppercase">
                3D Racket Arcade · MediaPipe Vision · Gemma 4 Intelligence · ITTF 2026 Rules
              </p>
            </div>
          </div>

          {/* AI Intelligence Provider Status Pill */}
          <div className="flex items-center space-x-2">
            <span
              className={`neo-badge ${
                aiStatus.available ? 'bg-white text-[#121212]' : 'bg-[#FF6B4A] text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-700 inline" />
              {aiStatus.provider === 'gemini' ? 'Gemini API' : 'Local Ollama'}: {aiStatus.model}
            </span>
          </div>
        </div>

        {/* Scrollable Main Body */}
        <div className="p-8 overflow-y-auto space-y-8">
          {/* Hero Match Setup Box */}
          <div className="neo-box p-6 bg-white space-y-6">
            <div className="flex items-center justify-between border-b-[2px] border-[#121212] pb-3">
              <h2 className="text-xl font-black font-display uppercase tracking-tight text-[#121212]">
                Configure Match Simulation
              </h2>
              <span className="neo-badge bg-[#E4DCFF]">Deterministic State Engine</span>
            </div>

            {/* Profile & Difficulty Selection Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Rule Profile Selector */}
              <div>
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
                  1. Rule Profile
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedProfile('TABLE_TENNIS_TRAINING')}
                    className={`p-3 border-[2px] border-[#121212] text-left transition-all ${
                      selectedProfile === 'TABLE_TENNIS_TRAINING'
                        ? 'bg-[#CCFF00] shadow-[3px_3px_0px_#121212]'
                        : 'bg-[#FAF6EB] hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-display font-bold text-sm">ITTF Statutes 2026</div>
                    <div className="text-[10px] font-mono text-gray-600 mt-0.5">
                      11 pts · 2-point deuce lead · Alternating serves
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedProfile('ARCADE_PONG')}
                    className={`p-3 border-[2px] border-[#121212] text-left transition-all ${
                      selectedProfile === 'ARCADE_PONG'
                        ? 'bg-[#CCFF00] shadow-[3px_3px_0px_#121212]'
                        : 'bg-[#FAF6EB] hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-display font-bold text-sm">Arcade Pong</div>
                    <div className="text-[10px] font-mono text-gray-600 mt-0.5">
                      Fast cadence · Wall deflections · First to 7
                    </div>
                  </button>
                </div>
              </div>

              {/* Opponent Difficulty Selector */}
              <div>
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
                  2. AI Opponent Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`p-3 border-[2px] border-[#121212] font-display font-bold uppercase text-center transition-all ${
                        selectedDifficulty === diff
                          ? 'bg-[#FF7A59] text-white shadow-[3px_3px_0px_#121212]'
                          : 'bg-[#FAF6EB] hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-sm">{diff}</div>
                      <div className="text-[9px] font-mono opacity-80">
                        {diff === 'easy' ? '2.8 m/s' : diff === 'medium' ? '4.2 m/s' : '6.2 m/s'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Action Buttons */}
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => onStartWebcam(selectedProfile, selectedDifficulty)}
                className="flex-1 neo-btn neo-btn-lime py-3.5 text-sm font-mono uppercase font-black"
              >
                <Camera className="w-5 h-5 mr-2" />
                Play With Webcam Hand Tracking
              </button>

              <button
                onClick={() => onStartKeyboard(selectedProfile, selectedDifficulty)}
                className="flex-1 neo-btn neo-btn-white py-3.5 text-sm font-mono uppercase font-bold"
              >
                <Keyboard className="w-5 h-5 mr-2" />
                Play With Keyboard [WASD]
              </button>

              <button
                onClick={onOpenMultiplayer}
                className="neo-btn neo-btn-lavender py-3.5 px-6 text-sm font-mono uppercase font-bold"
              >
                <Users className="w-5 h-5 mr-1.5" />
                Multiplayer Room
              </button>
            </div>
          </div>

          {/* Subsystem Studio Navigation Grid */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              Explore PONG AI Subsystems & Verification Labs
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {/* Gesture Lab */}
              <button
                onClick={onOpenGestureLab}
                className="neo-box p-4 bg-white text-left hover:bg-[#FAF6EB] transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <span className="neo-badge bg-[#E4DCFF] text-[9px] py-0 px-1">Perception</span>
                </div>
                <h4 className="font-display font-bold text-base text-[#121212]">Gesture Lab</h4>
                <p className="text-xs text-gray-600 mt-1">
                  MediaPipe 21-landmark skeleton, OneEuroFilter tuning, reaching calibration.
                </p>
              </button>

              {/* Analytics Studio */}
              <button
                onClick={onOpenAnalytics}
                className="neo-box p-4 bg-white text-left hover:bg-[#FAF6EB] transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <BarChart2 className="w-5 h-5 text-orange-600" />
                  <span className="neo-badge bg-[#CCFF00] text-[9px] py-0 px-1">Analytics</span>
                </div>
                <h4 className="font-display font-bold text-base text-[#121212]">Analytics Studio</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Recharts histograms, table zone distribution, and 50-trial benchmark runner.
                </p>
              </button>

              {/* Rules Explorer */}
              <button
                onClick={onOpenRules}
                className="neo-box p-4 bg-white text-left hover:bg-[#FAF6EB] transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span className="neo-badge bg-[#FFD027] text-[9px] py-0 px-1">ITTF 2026</span>
                </div>
                <h4 className="font-display font-bold text-base text-[#121212]">Rules Explorer</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Browse official ITTF Chapter 2 provisions and arcade rules with test links.
                </p>
              </button>

              {/* Architecture Explorer (Graphify) */}
              <button
                onClick={onOpenArchitecture}
                className="neo-box p-4 bg-white text-left hover:bg-[#FAF6EB] transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <Network className="w-5 h-5 text-emerald-600" />
                  <span className="neo-badge bg-black text-white text-[9px] py-0 px-1">Graphify</span>
                </div>
                <h4 className="font-display font-bold text-base text-[#121212]">Architecture</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Interactive codebase map with 300 nodes, god nodes, and AST dependencies.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-8 py-3.5 border-t-[2.5px] border-[#121212] bg-white flex items-center justify-between shrink-0 font-mono text-xs">
          <div className="flex items-center space-x-3 text-gray-600">
            <span>Controls: <strong>[WASD]</strong> Move · <strong>[Space]</strong> Serve</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="neo-btn neo-btn-white px-3 py-1 text-xs font-mono uppercase"
          >
            <Sliders className="w-3.5 h-3.5 mr-1" /> Settings & Providers
          </button>
        </div>
      </div>
    </div>
  );
};
