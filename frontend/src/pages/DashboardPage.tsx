import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Zap, Activity, Clock, Trash2, Database, ArrowRight } from 'lucide-react';
import { MatchStats } from '@game-engine/types';
import {
  loadMatchHistory,
  clearMatchHistory,
  calculateSessionAggregates,
  getDemoTelemetry,
  SessionAggregates,
} from '../services/storage';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { RallyChart } from '../components/charts/RallyChart';
import { ZoneDistributionChart } from '../components/charts/ZoneDistributionChart';

export interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [history, setHistory] = useState<MatchStats[]>([]);
  const [aggregates, setAggregates] = useState<SessionAggregates>({
    totalMatches: 0,
    matchesWon: 0,
    matchesLost: 0,
    winPercentage: 0,
    overallReturnSuccessRate: 0,
    allTimeLongestRally: 0,
    overallAverageReactionTime: 0,
    totalReturns: 0,
  });
  const [isDemoData, setIsDemoData] = useState(false);

  const loadData = () => {
    const records = loadMatchHistory();
    setHistory(records);
    setAggregates(calculateSessionAggregates(records));
    setIsDemoData(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoadDemoData = () => {
    const demo = getDemoTelemetry();
    setHistory(demo);
    setAggregates(calculateSessionAggregates(demo));
    setIsDemoData(true);
  };

  const handleClear = () => {
    clearMatchHistory();
    loadData();
  };

  // Extract rally length array from recent match for chart
  const recentMatch = history[0];
  const chartData = (recentMatch?.rallyLengths || []).map((len, idx) => ({
    index: idx + 1,
    length: len,
  }));

  const zoneData = recentMatch?.tableZoneHits || { left: 0, center: 0, right: 0, deep: 0, short: 0 };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-[3px] border-[#111111]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="lime">Telemetry Studio</Badge>
            {isDemoData && (
              <span className="px-2.5 py-0.5 bg-[#D9FF55] border-[1.5px] border-[#111111] rounded-full font-mono text-[10px] font-bold uppercase">
                DEMO DATA ACTIVE
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-[#111111]">
            Match Dashboard
          </h1>
          <p className="text-sm sm:text-base text-[#525252] font-medium max-w-2xl">
            Real session telemetry tracking return success rates, reaction latency, court heatmaps, and rally stamina.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length === 0 && (
            <Button variant="lime" size="sm" onClick={handleLoadDemoData}>
              <Database className="w-4 h-4 mr-1" />
              Load Demo Data
            </Button>
          )}
          {history.length > 0 && (
            <Button variant="white" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1 text-[#FF5555]" />
              Clear History
            </Button>
          )}
          <Button variant="mint" size="sm" onClick={() => onNavigate('/play')}>
            Play Match ↗
          </Button>
        </div>
      </div>

      {/* Primary KPI Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="white" className="p-4 space-y-1">
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">
            Total Matches
          </span>
          <div className="font-display font-black text-3xl text-[#111111]">
            {aggregates.totalMatches}
          </div>
          <div className="text-[11px] font-mono font-bold text-[#525252]">
            {aggregates.matchesWon}W - {aggregates.matchesLost}L ({aggregates.winPercentage}% Win)
          </div>
        </Card>

        <Card variant="mint" className="p-4 space-y-1">
          <span className="text-[10px] font-mono text-[#111111]/70 uppercase tracking-wider">
            Return Success
          </span>
          <div className="font-display font-black text-3xl text-[#111111]">
            {aggregates.overallReturnSuccessRate}%
          </div>
          <div className="text-[11px] font-mono font-bold text-[#111111]">
            {aggregates.totalReturns} Total Returns
          </div>
        </Card>

        <Card variant="white" className="p-4 space-y-1">
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">
            All-Time Longest Rally
          </span>
          <div className="font-display font-black text-3xl text-[#111111]">
            {aggregates.allTimeLongestRally}
          </div>
          <div className="text-[11px] font-mono font-bold text-[#525252]">
            Peak continuous exchange
          </div>
        </Card>

        <Card variant="lavender" className="p-4 space-y-1">
          <span className="text-[10px] font-mono text-[#111111]/70 uppercase tracking-wider">
            Avg Reaction Time
          </span>
          <div className="font-display font-black text-3xl text-[#111111]">
            {aggregates.overallAverageReactionTime ? `${aggregates.overallAverageReactionTime}ms` : 'N/A'}
          </div>
          <div className="text-[11px] font-mono font-bold text-[#111111]">
            Opponent hit to interception
          </div>
        </Card>
      </div>

      {/* Empty State Banner */}
      {history.length === 0 && (
        <Card variant="cream" className="py-12 text-center space-y-4">
          <div className="w-12 h-12 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-2xl flex items-center justify-center mx-auto shadow-neo-sm">
            <BarChart3 className="w-6 h-6 text-[#111111]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-black text-xl uppercase text-[#111111]">
              No Match Telemetry Recorded Yet
            </h3>
            <p className="text-xs text-[#525252] max-w-md mx-auto">
              Play a match in the game arena or click below to load pre-seeded demo telemetry for evaluation.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="lime" size="md" onClick={handleLoadDemoData}>
              Load Demo Telemetry
            </Button>
            <Button variant="ink" size="md" onClick={() => onNavigate('/play')}>
              Play Match Now ↗
            </Button>
          </div>
        </Card>
      )}

      {/* Charts & Detail Grid */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rally Progression Chart */}
          <Card variant="white" className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]/20">
              <span className="font-display font-black text-sm uppercase text-[#111111]">
                Rally Length Progression (Recent Match)
              </span>
              <span className="font-mono text-xs text-[#737373]">
                {chartData.length} completed rallies
              </span>
            </div>
            <RallyChart data={chartData} />
          </Card>

          {/* Court Placement Heatmap */}
          <Card variant="white" className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]/20">
              <span className="font-display font-black text-sm uppercase text-[#111111]">
                Table Zone Distribution Heatmap
              </span>
              <span className="font-mono text-xs text-[#737373]">
                Ball bounce contacts
              </span>
            </div>
            <ZoneDistributionChart distribution={zoneData} />
          </Card>
        </div>
      )}

      {/* Match History Table */}
      {history.length > 0 && (
        <Card variant="white" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]/20">
            <span className="font-display font-black text-sm uppercase text-[#111111]">
              Session Match History ({history.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b-[2px] border-[#111111] text-[#737373] uppercase">
                  <th className="py-2">Match ID</th>
                  <th className="py-2">Result</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Success Rate</th>
                  <th className="py-2">Longest Rally</th>
                  <th className="py-2">Avg Reaction</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/10">
                {history.map((m) => {
                  const isWin = m.playerScore > m.opponentScore;
                  return (
                    <tr key={m.matchId} className="hover:bg-[#FFFDF6]">
                      <td className="py-3 font-bold text-[#111111]">{m.matchId}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 border-[1px] border-[#111111] rounded font-bold uppercase text-[10px] ${
                            isWin ? 'bg-[#62F5AD]' : 'bg-[#FF5555] text-white'
                          }`}
                        >
                          {isWin ? 'WIN' : 'LOSS'}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[#111111]">
                        {m.playerScore} - {m.opponentScore}
                      </td>
                      <td className="py-3 font-bold text-[#111111]">
                        {m.returnSuccessRate?.toFixed(1) ?? 'N/A'}%
                      </td>
                      <td className="py-3">{m.longestRally} returns</td>
                      <td className="py-3">
                        {m.averageReactionTimeMs ? `${Math.round(m.averageReactionTimeMs)}ms` : 'N/A'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onNavigate('/coach')}
                          className="inline-flex items-center gap-1 font-display font-black text-[11px] uppercase text-[#111111] hover:underline"
                        >
                          AI Coach Report <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
