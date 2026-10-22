import React from 'react';
import { GameDifficulty, RallyState, RuleProfile } from '../../../../shared/types';
import { Flame, Trophy } from 'lucide-react';

interface ScoreboardProps {
  playerScore: number;
  opponentScore: number;
  rallyCount: number;
  longestRally: number;
  difficulty: GameDifficulty;
  rallyState: RallyState;
  ruleProfile?: RuleProfile;
  currentServer?: 'player' | 'opponent';
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  playerScore,
  opponentScore,
  rallyCount,
  longestRally,
  difficulty,
  rallyState,
  ruleProfile = 'TABLE_TENNIS_TRAINING',
  currentServer = 'player',
}) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center select-none font-sans">
      {/* Main Neo-Brutalist Scoreboard Box */}
      <div className="neo-box px-6 py-2.5 bg-white flex items-center space-x-6">
        {/* Player Side */}
        <div className="flex items-center space-x-3 text-right">
          <div>
            <div className="flex items-center justify-end space-x-1.5">
              {currentServer === 'player' && (
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] border border-black animate-ping" />
              )}
              <span className="text-xs font-black uppercase tracking-wider text-[#121212]">
                Player
              </span>
            </div>
            <div className="text-[10px] text-gray-500 font-mono">
              {currentServer === 'player' ? 'SERVING' : 'RECEIVING'}
            </div>
          </div>
          <div className="text-4xl font-black font-display text-[#121212] bg-[#CCFF00] px-3 py-1 border-[2px] border-[#121212] min-w-[48px] text-center">
            {playerScore}
          </div>
        </div>

        {/* Center Divider / Rule Badge */}
        <div className="flex flex-col items-center px-1">
          <span className="font-mono text-[10px] uppercase font-bold text-gray-600">
            {ruleProfile === 'TABLE_TENNIS_TRAINING' ? 'ITTF 11' : 'Arcade 7'}
          </span>
          <div className="h-5 w-[2px] bg-[#121212] my-0.5" />
          <span className="neo-badge bg-[#FAF6EB] text-[9px] py-0 px-1 font-bold">
            {difficulty.toUpperCase()}
          </span>
        </div>

        {/* Opponent Side */}
        <div className="flex items-center space-x-3 text-left">
          <div className="text-4xl font-black font-display text-white bg-[#FF6B4A] px-3 py-1 border-[2px] border-[#121212] min-w-[48px] text-center">
            {opponentScore}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#121212]">
                AI Bot
              </span>
              {currentServer === 'opponent' && (
                <span className="w-2 h-2 rounded-full bg-[#FF6B4A] border border-black animate-ping" />
              )}
            </div>
            <div className="text-[10px] text-gray-500 font-mono">
              {currentServer === 'opponent' ? 'SERVING' : 'RECEIVING'}
            </div>
          </div>
        </div>
      </div>

      {/* In-Play Rally Banner & Prompts */}
      <div className="mt-2 flex items-center space-x-3">
        {rallyCount > 0 && (
          <div className="neo-box-sm px-3 py-1 bg-[#FFD027] flex items-center space-x-1.5 animate-bounce">
            <Flame className="w-3.5 h-3.5 text-[#121212]" />
            <span className="text-xs font-black text-[#121212] font-mono">
              Rally Streak: {rallyCount}
            </span>
          </div>
        )}

        {longestRally > 0 && (
          <div className="neo-box-sm px-3 py-1 bg-white flex items-center space-x-1.5 text-xs font-mono text-gray-700">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Best: {longestRally}</span>
          </div>
        )}

        {rallyState === 'SERVE' && currentServer === 'player' && (
          <div className="neo-box-sm px-3.5 py-1 bg-[#CCFF00] text-xs font-bold text-[#121212] font-mono animate-pulse">
            Swing hand or press [Space] to serve!
          </div>
        )}
      </div>
    </div>
  );
};
