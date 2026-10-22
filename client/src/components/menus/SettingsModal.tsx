import React from 'react';
import { GameSettings } from '../../types';
import { X, Sliders, Volume2, Bot, Gauge, Zap } from 'lucide-react';
import { sound } from '../../services/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
  onOpenCalibration: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onOpenCalibration,
}) => {
  const update = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);
    sound.setEnabled(updated.soundEnabled);
    sound.setVolume(updated.soundVolume);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md glass-panel-accent p-6 rounded-3xl border border-cyan-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sliders className="w-4 h-4" />
          <span>Game Preferences</span>
        </div>

        <h3 className="text-xl font-bold font-display text-white">Settings</h3>

        <div className="mt-6 space-y-5 text-xs">
          {/* Opponent Difficulty */}
          <div>
            <label className="text-slate-300 font-semibold mb-2 block flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Opponent AI Difficulty</span>
              </span>
              <span className="text-cyan-400 font-mono uppercase">{settings.difficulty}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => update({ difficulty: diff })}
                  className={`py-2 px-3 rounded-xl font-bold uppercase transition-all ${
                    settings.difficulty === diff
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Hand Tracking Sensitivity */}
          <div>
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Hand Sensitivity</span>
              </span>
              <span className="font-mono text-cyan-400">{settings.sensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="2.0"
              step="0.1"
              value={settings.sensitivity}
              onChange={(e) => update({ sensitivity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>Precise</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Sound Audio Settings */}
          <div>
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
              <span className="flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Audio Volume</span>
              </span>
              <span className="font-mono text-orange-400">
                {settings.soundEnabled ? `${Math.round(settings.soundVolume * 100)}%` : 'Muted'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => update({ soundEnabled: e.target.checked })}
                className="accent-cyan-400 cursor-pointer w-4 h-4 rounded"
              />
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                disabled={!settings.soundEnabled}
                value={settings.soundVolume}
                onChange={(e) => update({ soundVolume: parseFloat(e.target.value) })}
                className="flex-1 accent-orange-400 cursor-pointer disabled:opacity-30"
              />
            </div>
          </div>

          {/* Gemma 4 Coaching Toggle */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-semibold text-white">Gemma 4 Real-time Coach</div>
                <div className="text-[10px] text-slate-400">
                  Dynamic missions and post-match analysis
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.aiCoachingEnabled}
              onChange={(e) => update({ aiCoachingEnabled: e.target.checked })}
              className="accent-cyan-400 cursor-pointer w-4 h-4 rounded"
            />
          </div>

          {/* Recalibrate Button */}
          <button
            onClick={() => {
              onClose();
              onOpenCalibration();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-600/50 flex items-center justify-center space-x-2"
          >
            <span>Open Webcam Calibration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
