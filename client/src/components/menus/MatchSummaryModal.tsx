import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchStats, CoachSummaryResponse } from '../../../../shared/types';
import { Trophy, Bot, Sparkles, RefreshCw, BarChart2, Home, CheckCircle, AlertTriangle } from 'lucide-react';

interface MatchSummaryModalProps {
  stats: MatchStats;
  coachSummary: CoachSummaryResponse | null;
  loadingCoach: boolean;
  onPlayAgain: () => void;
  onViewAnalytics: () => void;
  onHome: () => void;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({
  stats,
  coachSummary,
  loadingCoach,
  onPlayAgain,
  onViewAnalytics,
  onHome,
}) => {
  const playerWon = stats.playerScore > stats.opponentScore;

  useEffect(() => {
    if (playerWon) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#ff5e36', '#fadb14'],
      });
    }
  }, [playerWon]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl glass-panel-accent p-8 rounded-3xl border border-cyan-500/40 my-auto text-left relative">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Trophy className={`w-4 h-4 ${playerWon ? 'text-yellow-400' : 'text-slate-400'}`} />
            <span>Match Completed</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black font-display text-white">
            {playerWon ? (
              <span className="text-emerald-400 glow-text-cyan">VICTORY!</span>
            ) : (
              <span className="text-orange-400 glow-text-orange">MATCH CONCLUDED</span>
            )}
          </h2>

          {/* Scores Display */}
          <div className="mt-4 flex items-center justify-center space-x-8 text-2xl font-black font-display">
            <div className="text-cyan-400">
              Player <span className="text-4xl text-white ml-2">{stats.playerScore}</span>
            </div>
            <span className="text-slate-500">-</span>
            <div className="text-orange-400">
              <span className="text-4xl text-white mr-2">{stats.opponentScore}</span> Opponent
            </div>
          </div>
        </div>

        {/* Match Metric Cards Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Return Accuracy</div>
            <div className="text-lg font-bold text-cyan-300 mt-0.5">
              {stats.returnSuccessRate.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {stats.successfulReturns} / {stats.totalReturns} shots
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Peak Rally</div>
            <div className="text-lg font-bold text-orange-400 mt-0.5">
              {stats.longestRally}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Consecutive returns</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Avg Reaction</div>
            <div className="text-lg font-bold text-yellow-400 mt-0.5">
              {stats.averageReactionTimeMs > 0 ? `${Math.round(stats.averageReactionTimeMs)}ms` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Contact reaction</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Difficulty</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5 uppercase">
              {stats.difficulty}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Opponent AI</div>
          </div>
        </div>

        {/* Gemma 4 Coach Section */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Gemma 4 Post-Match Tactical Debrief</span>
          </div>

          {loadingCoach ? (
            <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Gemma 4 is analyzing your match data...</span>
            </div>
          ) : coachSummary ? (
            <div className="space-y-3 text-xs">
              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1 mb-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Measured Strengths</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {coachSummary.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1 mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Improvement Areas</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {coachSummary.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tactical Advice & Encouragement */}
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="font-semibold text-white">Tactical Instruction:</div>
                <div className="text-slate-300 mt-0.5 leading-relaxed">
                  {coachSummary.tactical_advice}
                </div>
                <div className="text-cyan-300 mt-2 font-medium italic">
                  "{coachSummary.encouragement}"
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              AI coaching debrief is unavailable.
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-display text-sm flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all"
          >
            <RefreshCw className="w-4 h-4 text-slate-950" />
            <span>Play Next Match</span>
          </button>

          <button
            onClick={onViewAnalytics}
            className="py-3 px-5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 font-semibold text-sm flex items-center space-x-2 transition-all"
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Deep Analytics</span>
          </button>

          <button
            onClick={onHome}
            className="py-3 px-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-slate-200 text-sm flex items-center justify-center"
            title="Main Menu"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
