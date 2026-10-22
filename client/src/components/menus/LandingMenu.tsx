import React from 'react';
import { Camera, Keyboard, BarChart3, Settings, Play, Bot, Sparkles } from 'lucide-react';

interface LandingMenuProps {
  onStartWebcam: () => void;
  onStartKeyboard: () => void;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
  ollamaStatus: { available: boolean; model: string };
  isWebcamActive: boolean;
}

export const LandingMenu: React.FC<LandingMenuProps> = ({
  onStartWebcam,
  onStartKeyboard,
  onOpenAnalytics,
  onOpenSettings,
  ollamaStatus,
  isWebcamActive,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-lg glass-panel-accent p-8 rounded-3xl border border-cyan-500/40 text-center relative overflow-hidden">
        {/* Glow Background Elements */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="relative">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen Table Tennis</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white">
            GESTURE PONG <span className="text-cyan-400 glow-text-cyan">AI</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            3D Webcam-controlled arcade table tennis powered by real-time MediaPipe hand tracking and local Gemma 4 coaching.
          </p>
        </div>

        {/* AI Readiness Banner */}
        <div className="mt-6 flex items-center justify-center space-x-4 text-xs font-mono py-2 px-4 rounded-xl bg-slate-900/80 border border-slate-700/60">
          <div className="flex items-center space-x-1.5">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Gemma 4 Coach:</span>
            {ollamaStatus.available ? (
              <span className="text-emerald-400 font-bold">{ollamaStatus.model} (Ready)</span>
            ) : (
              <span className="text-amber-400 font-bold">Fallback Rules Mode</span>
            )}
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center space-x-1.5">
            <Camera className="w-4 h-4 text-orange-400" />
            <span className="text-slate-400">Webcam:</span>
            <span className={isWebcamActive ? 'text-emerald-400 font-bold' : 'text-slate-400 font-bold'}>
              {isWebcamActive ? 'Active' : 'Standby'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={onStartWebcam}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-display text-lg tracking-wide flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(0,242,254,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Camera className="w-5 h-5 text-slate-950" />
            <span>PLAY WITH WEBCAM HANDS</span>
            <Play className="w-4 h-4 fill-current ml-1" />
          </button>

          <button
            onClick={onStartKeyboard}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/60 text-slate-200 font-semibold text-sm flex items-center justify-center space-x-2 transition-all"
          >
            <Keyboard className="w-4 h-4 text-slate-400" />
            <span>Play with Keyboard / Mouse Fallback</span>
          </button>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onOpenAnalytics}
              className="py-3 px-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 text-slate-300 font-medium text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Match Analytics</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="py-3 px-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 text-slate-300 font-medium text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <Settings className="w-4 h-4 text-orange-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Quick controls hint */}
        <div className="mt-6 text-[11px] text-slate-400">
          Move your hand in front of your camera to steer the paddle. Quick forward gestures initiate swings.
        </div>
      </div>
    </div>
  );
};
