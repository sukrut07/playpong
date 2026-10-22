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
      <div className="fixed top-4 right-4 z-40 w-72 neo-box p-3.5 bg-white animate-pulse">
        <div className="flex items-center space-x-2 text-[#121212] text-xs font-bold font-mono">
          <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
          <span>Gemma 4 Assigning Drill...</span>
        </div>
        <div className="mt-2 h-2.5 bg-[#FAF6EB] border border-[#121212]" />
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
      className={`fixed top-4 right-4 z-40 w-80 neo-box p-4 transition-all duration-200 select-none ${
        mission.completed
          ? 'bg-[#CCFF00] shadow-[5px_5px_0px_#121212]'
          : 'bg-white shadow-[4px_4px_0px_#121212]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          {mission.completed ? (
            <CheckCircle2 className="w-4 h-4 text-green-800 animate-bounce" />
          ) : (
            <Target className="w-4 h-4 text-purple-700" />
          )}
          <span className="text-xs font-black uppercase tracking-wider font-mono text-[#121212]">
            {mission.completed ? 'Drill Complete!' : 'Gemma 4 Objective'}
          </span>
        </div>
        <span className="neo-badge bg-[#E4DCFF] text-[9px] py-0 px-1">
          {mission.mission_type.replace('_', ' ')}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-sm font-black font-display text-[#121212] leading-tight">
          {mission.mission_title}
        </h4>
        <p className="text-xs text-gray-700 mt-1 leading-snug">
          {mission.mission_description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-700 mb-1">
          <span>PROGRESS</span>
          <span>
            {mission.current_value} / {mission.target_value}
          </span>
        </div>
        <div className="w-full h-3 bg-[#FAF6EB] border-[1.5px] border-[#121212] overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              mission.completed ? 'bg-green-600' : 'bg-[#CCFF00]'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Coach Tip */}
      <div className="mt-3 pt-2 border-t-[1.5px] border-[#121212] text-[11px] text-gray-800 flex items-start space-x-1.5 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#121212]">Coach Tip: </span>
          <span>{mission.coach_tip}</span>
        </div>
      </div>
    </div>
  );
};
