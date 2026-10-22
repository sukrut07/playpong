import React from 'react';
import { Pause, Play, RotateCcw, ArrowLeft, Hand, Keyboard } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ScoreboardProps {
  playerScore: number;
  opponentScore: number;
  rallyCount: number;
  longestRally: number;
  currentServer: 'player' | 'opponent';
  isPaused: boolean;
  controllerMode: 'gesture' | 'keyboard';
  trackingActive: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  onExit: () => void;
  onSwitchController: (mode: 'gesture' | 'keyboard') => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  playerScore,
  opponentScore,
  rallyCount,
  longestRally,
  currentServer,
  isPaused,
  controllerMode,
  trackingActive,
  onTogglePause,
  onRestart,
  onExit,
  onSwitchController,
}) => {
  const isDeuce = playerScore >= 10 && opponentScore >= 10;

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none">
      {/* Top Left: Navigation & Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <Button variant="white" size="sm" onClick={onExit} aria-label="Exit Game">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Exit
        </Button>
        <Button
          variant={isPaused ? 'lime' : 'white'}
          size="sm"
          onClick={onTogglePause}
          aria-label={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button variant="white" size="sm" onClick={onRestart} aria-label="Restart Match">
          <RotateCcw className="w-4 h-4 mr-1" />
          Restart
        </Button>
      </div>

      {/* Center: Neo-Brutalist Scoreboard Bento */}
      <div className="bg-[#FFFFFF] border-[3px] border-[#111111] rounded-2xl shadow-neo p-2.5 px-6 flex items-center gap-6 pointer-events-auto">
        {/* Player Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#62F5AD] border-[1px] border-[#111111]" />
            <span className="font-display font-black text-xs uppercase text-[#111111]">Player</span>
            {currentServer === 'player' && (
              <span className="text-[10px] bg-[#D9FF55] border-[1px] border-[#111111] px-1 rounded font-bold">
                SERVE
              </span>
            )}
          </div>
          <div className="font-display font-black text-3xl md:text-4xl text-[#111111] mt-0.5">
            {playerScore}
          </div>
        </div>

        {/* Rally & Match Status */}
        <div className="flex flex-col items-center justify-center border-x-[2px] border-[#111111]/20 px-4">
          {isDeuce && (
            <span className="mb-1 px-2 py-0.5 bg-[#FF5555] text-white border-[1px] border-[#111111] rounded font-display font-black text-[10px] uppercase animate-pulse">
              DEUCE (+2 NEEDED)
            </span>
          )}
          <div className="text-[10px] font-mono font-bold text-[#525252] uppercase">Rally</div>
          <div className="font-mono font-black text-xl text-[#111111]">
            {rallyCount}
          </div>
          <div className="text-[9px] font-mono text-[#737373]">Peak: {longestRally}</div>
        </div>

        {/* Opponent Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BDA5FF] border-[1px] border-[#111111]" />
            <span className="font-display font-black text-xs uppercase text-[#111111]">Gemma AI</span>
            {currentServer === 'opponent' && (
              <span className="text-[10px] bg-[#D9FF55] border-[1px] border-[#111111] px-1 rounded font-bold">
                SERVE
              </span>
            )}
          </div>
          <div className="font-display font-black text-3xl md:text-4xl text-[#111111] mt-0.5">
            {opponentScore}
          </div>
        </div>
      </div>

      {/* Top Right: Controller Switcher */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl shadow-neo-sm p-1 flex items-center gap-1">
          <button
            onClick={() => onSwitchController('gesture')}
            className={`px-3 py-1.5 font-display font-black text-xs uppercase rounded-lg flex items-center gap-1.5 transition-all ${
              controllerMode === 'gesture'
                ? 'bg-[#62F5AD] text-[#111111] border-[1.5px] border-[#111111]'
                : 'text-[#737373] hover:text-[#111111]'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            Hand
            {controllerMode === 'gesture' && (
              <span className={`w-2 h-2 rounded-full ${trackingActive ? 'bg-[#111111]' : 'bg-[#FF5555]'}`} />
            )}
          </button>
          <button
            onClick={() => onSwitchController('keyboard')}
            className={`px-3 py-1.5 font-display font-black text-xs uppercase rounded-lg flex items-center gap-1.5 transition-all ${
              controllerMode === 'keyboard'
                ? 'bg-[#111111] text-[#FFFFFF]'
                : 'text-[#737373] hover:text-[#111111]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Keys
          </button>
        </div>
      </div>
    </div>
  );
};
