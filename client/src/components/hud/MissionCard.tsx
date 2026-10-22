import React from 'react';
import { Mission } from '../../../../shared/types';
import { Sparkles, CheckCircle2, Target } from 'lucide-react';

interface MissionCardProps {
  mission: Mission | null;
  loading?: boolean;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, loading = false }) => {
  if (loading) {
    return (
      <div className="fixed top-4 right-4 z-40 w-72 glass-panel p-3.5 rounded-xl border border-cyan-500/30 animate-pulse">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Gemma 4 Orchestrating Mission...</span>
        </div>
        <div className="mt-2 h-3 bg-slate-700/50 rounded-full" />
      </div>
    );
  }

  if (!mission) return null;

  const progressPct = Math.min(
    100,
    Math.round((mission.current_value / Math.max(1, mission.target_value)) * 100)
  );

  return (
    <div
      className={`fixed top-4 right-4 z-40 w-80 glass-panel p-4 rounded-2xl transition-all duration-300 ${
        mission.completed
          ? 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
          : 'border-cyan-500/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {mission.completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
          ) : (
            <Target className="w-4 h-4 text-cyan-400" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {mission.completed ? 'Mission Completed!' : 'Gemma 4 Mission'}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
          {mission.mission_type.replace('_', ' ')}
        </span>
      </div>

      {/* Title & Description */}
      <div className="mt-2">
        <h4 className="text-sm font-bold text-white leading-snug">{mission.mission_title}</h4>
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
          {mission.mission_description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
          <span>Progress</span>
          <span className="font-semibold text-cyan-300">
            {mission.current_value} / {mission.target_value}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              mission.completed
                ? 'bg-gradient-to-r from-emerald-500 to-teal-300'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Coach Tip */}
      <div className="mt-3 pt-2.5 border-t border-slate-700/40 text-[11px] text-slate-300 flex items-start space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-yellow-400">Coach Tip: </span>
          <span>{mission.coach_tip}</span>
        </div>
      </div>
    </div>
  );
};
