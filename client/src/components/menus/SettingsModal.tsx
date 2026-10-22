import React, { useState, useEffect } from 'react';
import { GameSettings } from '../../types';
import {
  X,
  Sliders,
  Volume2,
  Bot,
  Gauge,
  Zap,
  Sparkles,
  Shield,
  Trash2,
  Camera,
  Activity,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { sound } from '../../services/audio';
import { coachApi } from '../../services/api';
import { clearMatchHistory } from '../../services/storage';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
  onOpenCalibration: () => void;
  onOpenGestureLab?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onOpenCalibration,
  onOpenGestureLab,
}) => {
  const [providerStatus, setProviderStatus] = useState<{
    available: boolean;
    provider: 'gemini' | 'ollama';
    model: string;
    hasKey?: boolean;
    error?: string;
  }>({
    available: false,
    provider: settings.aiProvider || 'gemini',
    model: 'checking...',
  });

  const [switchingProvider, setSwitchingProvider] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [dataClearedNotice, setDataClearedNotice] = useState(false);

  useEffect(() => {
    coachApi.checkHealth().then((res) => {
      setProviderStatus(res);
    });
  }, []);

  const update = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);
    if ('soundEnabled' in partial || 'soundVolume' in partial) {
      sound.setEnabled(updated.soundEnabled);
      sound.setVolume(updated.soundVolume);
    }
  };

  const handleProviderSwitch = async (newProvider: 'gemini' | 'ollama') => {
    setSwitchingProvider(true);
    try {
      await coachApi.switchProvider(newProvider);
      update({ aiProvider: newProvider });
      const refreshed = await coachApi.checkHealth();
      setProviderStatus(refreshed);
    } catch (err) {
      console.error('Failed to switch provider:', err);
    } finally {
      setSwitchingProvider(false);
    }
  };

  const handleClearData = () => {
    clearMatchHistory();
    try {
      localStorage.removeItem('tabletennis_gesture_dataset_v1');
    } catch {}
    setShowClearConfirm(false);
    setDataClearedNotice(true);
    setTimeout(() => setDataClearedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF6EB] border-[3.5px] border-[#121212] shadow-[10px_10px_0px_#121212] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b-[3px] border-[#121212] bg-[#CCFF00] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#121212]" />
            <h3 className="text-xl font-black font-display text-[#121212] uppercase tracking-tight">
              PONG AI System Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-[2px] border-[#121212] bg-white hover:bg-red-400 hover:text-white transition-all shadow-[2px_2px_0px_#121212]"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. AI Intelligence Layer Settings */}
          <div className="neo-box p-5 bg-white space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-[#121212] pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <h4 className="font-display font-bold text-sm uppercase text-[#121212]">
                  Gemma 4 Intelligence Provider
                </h4>
              </div>
              <span
                className={`neo-badge text-[10px] ${
                  providerStatus.available ? 'bg-[#CCFF00] text-[#121212]' : 'bg-[#FF6B4A] text-white'
                }`}
              >
                {providerStatus.available ? 'Connected' : 'Offline / Fallback'}
              </span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              Gemma 4 is the core reasoning layer: it evaluates match telemetry, identifies performance bottlenecks, and formulates drills using ITTF 2026 rule citations.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleProviderSwitch('gemini')}
                disabled={switchingProvider}
                className={`p-3 border-[2px] border-[#121212] text-left transition-all ${
                  settings.aiProvider === 'gemini'
                    ? 'bg-[#E4DCFF] shadow-[3px_3px_0px_#121212]'
                    : 'bg-[#FAF6EB] hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-xs">Hosted Gemini API</span>
                  <span className="neo-badge bg-white text-[9px] py-0 px-1">Cloud</span>
                </div>
                <div className="text-[10px] font-mono text-gray-600">
                  Model: gemma-4-26b-a4b-it / 31b-it
                </div>
                <div className="text-[9px] text-gray-500 mt-1">
                  Fast hosted inference via official Google AI integration.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSwitch('ollama')}
                disabled={switchingProvider}
                className={`p-3 border-[2px] border-[#121212] text-left transition-all ${
                  settings.aiProvider === 'ollama'
                    ? 'bg-[#E4DCFF] shadow-[3px_3px_0px_#121212]'
                    : 'bg-[#FAF6EB] hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-xs">Local Ollama Runtime</span>
                  <span className="neo-badge bg-[#CCFF00] text-[9px] py-0 px-1">Local</span>
                </div>
                <div className="text-[10px] font-mono text-gray-600">
                  Model: gemma4:e2b (port 11434)
                </div>
                <div className="text-[9px] text-gray-500 mt-1">
                  Private, 100% on-device open-weight inference.
                </div>
              </button>
            </div>

            <div className="p-3 bg-[#FAF6EB] border-[1.5px] border-[#121212] text-[11px] font-mono flex items-center justify-between">
              <div>
                Active Model:{' '}
                <strong className="text-purple-800">{providerStatus.model}</strong>
                {providerStatus.error && (
                  <span className="text-red-600 block text-[10px]">
                    Note: {providerStatus.error}
                  </span>
                )}
              </div>
              <label className="flex items-center space-x-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={settings.aiCoachingEnabled}
                  onChange={(e) => update({ aiCoachingEnabled: e.target.checked })}
                  className="accent-[#121212] w-4 h-4 rounded cursor-pointer"
                />
                <span>Enable AI Coaching</span>
              </label>
            </div>
          </div>

          {/* 2. Simulation & Rules */}
          <div className="neo-box p-5 bg-white space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-[#121212] pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-700" />
                <h4 className="font-display font-bold text-sm uppercase text-[#121212]">
                  Rule Profile & Opponent AI
                </h4>
              </div>
              <span className="neo-badge bg-[#FAF6EB] text-[10px]">Simulation</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs font-bold text-gray-700 block mb-1.5 uppercase">
                  Active Rule Profile
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => update({ ruleProfile: 'TABLE_TENNIS_TRAINING' })}
                    className={`w-full p-2.5 border-[2px] border-[#121212] text-left transition-all ${
                      settings.ruleProfile === 'TABLE_TENNIS_TRAINING'
                        ? 'bg-[#CCFF00] shadow-[2px_2px_0px_#121212]'
                        : 'bg-[#FAF6EB] hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-bold text-xs">ITTF Statutes 2026</div>
                    <div className="text-[9px] font-mono text-gray-600">
                      11 pts, 2-pt deuce lead, alternating serves
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => update({ ruleProfile: 'ARCADE_PONG' })}
                    className={`w-full p-2.5 border-[2px] border-[#121212] text-left transition-all ${
                      settings.ruleProfile === 'ARCADE_PONG'
                        ? 'bg-[#CCFF00] shadow-[2px_2px_0px_#121212]'
                        : 'bg-[#FAF6EB] hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-bold text-xs">Arcade Pong Rules</div>
                    <div className="text-[9px] font-mono text-gray-600">
                      Fast cadence, wall rebounds, first to 7
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-gray-700 block mb-1.5 uppercase">
                  Opponent AI Difficulty
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => update({ difficulty: diff })}
                      className={`py-3 border-[2px] border-[#121212] font-display font-bold uppercase text-xs transition-all ${
                        settings.difficulty === diff
                          ? 'bg-[#FF7A59] text-white shadow-[2px_2px_0px_#121212]'
                          : 'bg-[#FAF6EB] hover:bg-gray-100'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-2 font-mono">
                  Controls opponent paddle speed, reaction delay, and intercept noise.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Controls, Audio & Accessibility */}
          <div className="neo-box p-5 bg-white space-y-4">
            <h4 className="font-display font-bold text-sm uppercase text-[#121212] border-b-[2px] border-[#121212] pb-2">
              Perception, Audio & Accessibility
            </h4>

            <div className="grid grid-cols-2 gap-6">
              {/* Sensitivity */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span>Hand Tracking Sensitivity</span>
                  <span className="neo-badge bg-[#FAF6EB] text-[10px] py-0 px-1.5">
                    {settings.sensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="2.0"
                  step="0.1"
                  value={settings.sensitivity}
                  onChange={(e) => update({ sensitivity: parseFloat(e.target.value) })}
                  className="w-full accent-[#121212] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-0.5">
                  <span>0.6x (Fine)</span>
                  <span>2.0x (Fast)</span>
                </div>
              </div>

              {/* Audio Volume */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span className="flex items-center space-x-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Sound & Effects</span>
                  </span>
                  <span className="neo-badge bg-[#FAF6EB] text-[10px] py-0 px-1.5">
                    {settings.soundEnabled ? `${Math.round(settings.soundVolume * 100)}%` : 'Muted'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => update({ soundEnabled: e.target.checked })}
                    className="accent-[#121212] w-4 h-4 rounded cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    disabled={!settings.soundEnabled}
                    value={settings.soundVolume}
                    onChange={(e) => update({ soundVolume: parseFloat(e.target.value) })}
                    className="flex-1 accent-[#FF7A59] cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes row */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <label className="flex items-center space-x-2 cursor-pointer p-2 border-[1.5px] border-[#121212] bg-[#FAF6EB]">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => update({ reducedMotion: e.target.checked })}
                  className="accent-[#121212] w-4 h-4 rounded cursor-pointer"
                />
                <span>Reduced Motion Mode</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer p-2 border-[1.5px] border-[#121212] bg-[#FAF6EB]">
                <input
                  type="checkbox"
                  checked={settings.keyboardFallback}
                  onChange={(e) => update({ keyboardFallback: e.target.checked })}
                  className="accent-[#121212] w-4 h-4 rounded cursor-pointer"
                />
                <span>Keyboard [WASD] Fallback</span>
              </label>
            </div>
          </div>

          {/* 4. Privacy & Data Reset */}
          <div className="neo-box p-5 bg-white space-y-3">
            <div className="flex items-center justify-between border-b-[2px] border-[#121212] pb-2">
              <div className="flex items-center space-x-2">
                <Trash2 className="w-4 h-4 text-red-600" />
                <h4 className="font-display font-bold text-sm uppercase text-[#121212]">
                  Privacy & Local Storage
                </h4>
              </div>
              <span className="neo-badge bg-[#FAF6EB] text-[10px]">Client-Side Only</span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              Camera feeds never leave your browser. Match records and gesture calibration are stored strictly in local browser storage.
            </p>

            {dataClearedNotice && (
              <div className="p-2.5 bg-[#CCFF00] border-[1.5px] border-[#121212] text-xs font-mono flex items-center space-x-2 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-800" />
                <span>All local match records and temporary datasets have been cleared.</span>
              </div>
            )}

            {showClearConfirm ? (
              <div className="p-3 bg-red-100 border-[2px] border-red-700 space-y-2">
                <div className="text-xs font-bold text-red-900 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Confirm local data deletion? This cannot be undone.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearData}
                    className="neo-btn bg-red-600 text-white px-3 py-1 text-xs font-mono uppercase font-bold"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="neo-btn neo-btn-white px-3 py-1 text-xs font-mono uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="neo-btn bg-white hover:bg-red-50 text-red-700 border-red-800 px-3 py-1.5 text-xs font-mono uppercase font-bold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Saved Match Records</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenGestureLab) {
                      onOpenGestureLab();
                    } else {
                      onOpenCalibration();
                    }
                  }}
                  className="neo-btn neo-btn-lavender px-3 py-1.5 text-xs font-mono uppercase font-bold flex items-center space-x-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Open Gesture Lab Calibration</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t-[2.5px] border-[#121212] bg-white flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="neo-btn neo-btn-lime px-6 py-2 text-xs font-mono uppercase font-black"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
