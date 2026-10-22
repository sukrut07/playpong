import React from 'react';
import { MatchStats } from '../../../../shared/types';
import { calculateSessionAggregates } from '../../services/storage';
import { X, Trophy, Target, Zap, Flame, Award, Calendar } from 'lucide-react';

interface AnalyticsDashboardProps {
  history: MatchStats[];
  onClose: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ history, onClose }) => {
  const aggregates = calculateSessionAggregates(history);

  // Compute table zone totals
  const zoneTotals = history.reduce(
    (acc, m) => {
      acc.left += m.tableZoneDistribution?.left || 0;
      acc.center += m.tableZoneDistribution?.center || 0;
      acc.right += m.tableZoneDistribution?.right || 0;
      acc.deep += m.tableZoneDistribution?.deep || 0;
      acc.short += m.tableZoneDistribution?.short || 0;
      return acc;
    },
    { left: 0, center: 0, right: 0, deep: 0, short: 0 }
  );

  const totalHits = Math.max(1, zoneTotals.left + zoneTotals.center + zoneTotals.right);
  const leftPct = Math.round((zoneTotals.left / totalHits) * 100);
  const centerPct = Math.round((zoneTotals.center / totalHits) * 100);
  const rightPct = Math.round((zoneTotals.right / totalHits) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl glass-panel-accent p-8 rounded-3xl border border-cyan-500/40 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Performance Analytics Studio</span>
            </div>
            <h2 className="text-2xl font-black font-display text-white mt-1">
              Match Intelligence & Skill Progression
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body with custom scroll */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Win Rate</span>
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {aggregates.winPercentage.toFixed(0)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {aggregates.matchesWon} won / {aggregates.totalMatches} matches
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Return Accuracy</span>
                <Target className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300 mt-2">
                {aggregates.overallReturnSuccessRate.toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Career average</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Longest Rally</span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-black text-orange-400 mt-2">
                {aggregates.allTimeLongestRally}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Consecutive returns</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-700/60">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Avg Reaction Time</span>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-black text-yellow-300 mt-2">
                {aggregates.overallAverageReactionTime > 0
                  ? `${Math.round(aggregates.overallAverageReactionTime)}ms`
                  : 'N/A'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Measured contact</div>
            </div>
          </div>

          {/* Table Zone Heatmap Distribution */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Table Zone Placement Heatmap
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown of ball bounce locations on opponent court from your returns.
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-mono">LEFT CORNER</div>
                <div className="text-2xl font-black text-cyan-400 mt-1">{leftPct}%</div>
                <div className="text-[11px] text-slate-500">{zoneTotals.left} hits</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                <div className="text-xs text-slate-400 font-mono">CENTER COURT</div>
                <div className="text-2xl font-black text-white mt-1">{centerPct}%</div>
                <div className="text-[11px] text-slate-500">{zoneTotals.center} hits</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-mono">RIGHT CORNER</div>
                <div className="text-2xl font-black text-orange-400 mt-1">{rightPct}%</div>
                <div className="text-[11px] text-slate-500">{zoneTotals.right} hits</div>
              </div>
            </div>
          </div>

          {/* Match Log Table */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Recent Match History</span>
            </h3>

            {history.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center italic">
                No matches recorded yet. Complete a match to see detailed match history.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700/60 text-slate-400 uppercase font-mono text-[10px]">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Score</th>
                      <th className="py-2 px-3">Result</th>
                      <th className="py-2 px-3">Returns</th>
                      <th className="py-2 px-3">Accuracy</th>
                      <th className="py-2 px-3">Peak Rally</th>
                      <th className="py-2 px-3">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {history.map((m) => {
                      const win = m.playerScore > m.opponentScore;
                      return (
                        <tr key={m.matchId} className="hover:bg-slate-800/40 font-mono">
                          <td className="py-2.5 px-3 text-slate-400">
                            {new Date(m.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">
                            {m.playerScore} - {m.opponentScore}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                win
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {win ? 'WIN' : 'LOSS'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{m.totalReturns}</td>
                          <td className="py-2.5 px-3 text-cyan-300">
                            {m.returnSuccessRate !== null ? `${m.returnSuccessRate.toFixed(0)}%` : 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-orange-300">{m.longestRally}</td>
                          <td className="py-2.5 px-3 text-slate-400 uppercase">{m.difficulty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
