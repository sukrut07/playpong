import React from 'react';
import { GameDifficulty, RallyState } from '../../../../shared/types';
import { Flame, Trophy } from 'lucide-react';

interface ScoreboardProps {
  playerScore: number;
  opponentScore: number;
  rallyCount: number;
  longestRally: number;
  difficulty: GameDifficulty;
  rallyState: RallyState;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  playerScore,
  opponentScore,
  rallyCount,
  longestRally,
  difficulty,
  rallyState,
}) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center select-none">
      {/* Main Score Glass Bar */}
      <div className="glass-panel-accent px-6 py-2.5 rounded-2xl flex items-center space-x-8">
        {/* Player Side */}
        <div className="flex items-center space-x-3 text-right">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Player (You)
            </div>
            <div className="text-xs text-slate-400 font-mono">Webcam Hand</div>
          </div>
          <div className="text-3xl font-black font-display text-white w-8 text-center glow-text-cyan">
            {playerScore}
          </div>
        </div>

        {/* Center Divider / Match Info */}
        <div className="flex flex-col items-center px-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            First to 7
          </div>
          <div className="h-6 w-px bg-slate-700/60 my-0.5" />
          <span
            className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
              difficulty === 'hard'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : difficulty === 'medium'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {difficulty}
          </span>
        </div>

        {/* Opponent Side */}
        <div className="flex items-center space-x-3 text-left">
          <div className="text-3xl font-black font-display text-white w-8 text-center glow-text-orange">
            {opponentScore}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Opponent AI
            </div>
            <div className="text-xs text-slate-400 font-mono">Precision Bot</div>
          </div>
        </div>
      </div>

      {/* Rally Streak Pill */}
      <div className="mt-2 flex items-center space-x-3">
        {rallyCount > 0 && (
          <div className="glass-panel px-3 py-1 rounded-full flex items-center space-x-1.5 animate-bounce">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-xs font-bold text-orange-400 font-mono">
              Rally Streak: {rallyCount}
            </span>
          </div>
        )}

        {longestRally > 0 && (
          <div className="glass-panel px-3 py-1 rounded-full flex items-center space-x-1.5 text-slate-300 text-xs font-mono">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Best Rally: {longestRally}</span>
          </div>
        )}

        {rallyState === 'SERVE' && (
          <div className="glass-panel px-3 py-1 rounded-full text-xs font-semibold text-cyan-300 animate-pulse border border-cyan-500/40">
            Swing hand or press Space to serve!
          </div>
        )}
      </div>
    </div>
  );
};
