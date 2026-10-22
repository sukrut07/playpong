import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, BookOpen, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { CoachingReport, MatchStats, GameRule } from '@game-engine/types';
import { modelService, ModelHealthStatus } from '../services/model-service';
import { loadMatchHistory, getDemoTelemetry } from '../services/storage';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusIndicator } from '../components/ui/StatusIndicator';

export interface CoachPageProps {
  onNavigate: (path: string) => void;
  matchId?: string;
}

export const CoachPage: React.FC<CoachPageProps> = ({ onNavigate, matchId }) => {
  const [report, setReport] = useState<CoachingReport | null>(null);
  const [health, setHealth] = useState<ModelHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<GameRule[]>([]);
  const [activeTab, setActiveTab] = useState<'coaching' | 'rules'>('coaching');

  const fetchCoaching = async () => {
    setLoading(true);
    try {
      const h = await modelService.getHealth();
      setHealth(h);

      const rList = await modelService.getRules();
      setRules(rList);

      const history = loadMatchHistory();
      const targetMatch: MatchStats = history[0] || getDemoTelemetry()[0];

      const coachReport = await modelService.getCoachingReport(targetMatch);
      setReport(coachReport);
    } catch (err) {
      console.error('[CoachPage] Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaching();
  }, [matchId]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-[3px] border-[#111111]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="lavender">Intelligence Engine</Badge>
            <StatusIndicator
              status={health?.available ? 'online' : 'idle'}
              label={health?.model || 'Gemma 4'}
            />
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-[#111111]">
            AI Tactical Coach
          </h1>
          <p className="text-sm sm:text-base text-[#525252] font-medium max-w-2xl">
            Dual-model LangGraph orchestration with evidence-grounded performance observations, drills, and ITTF Statutes 2026 rule citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="white" size="sm" onClick={fetchCoaching}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button variant="mint" size="sm" onClick={() => onNavigate('/play')}>
            Play Next Match ↗
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-[2px] border-[#111111]">
        <button
          onClick={() => setActiveTab('coaching')}
          className={`px-4 py-2.5 font-display font-black text-xs uppercase tracking-wider border-b-[3px] -mb-[2.5px] transition-all ${
            activeTab === 'coaching'
              ? 'border-[#111111] text-[#111111] bg-[#FFFFFF] rounded-t-xl'
              : 'border-transparent text-[#737373] hover:text-[#111111]'
          }`}
        >
          Coaching Report
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 font-display font-black text-xs uppercase tracking-wider border-b-[3px] -mb-[2.5px] transition-all ${
            activeTab === 'rules'
              ? 'border-[#111111] text-[#111111] bg-[#FFFFFF] rounded-t-xl'
              : 'border-transparent text-[#737373] hover:text-[#111111]'
          }`}
        >
          ITTF Rules Registry ({rules.length})
        </button>
      </div>

      {loading ? (
        <Card variant="cream" className="py-16 text-center space-y-3 font-mono text-xs">
          <div className="w-8 h-8 border-4 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="font-bold text-[#111111]">Synthesizing telemetry and ITTF statutes...</div>
        </Card>
      ) : activeTab === 'coaching' && report ? (
        <div className="space-y-6">
          {/* Executive Summary Bento */}
          <Card variant="mint" className="p-6 space-y-2">
            <span className="font-display font-black text-xs uppercase tracking-wider text-[#111111]">
              Match Synthesis
            </span>
            <p className="text-base sm:text-lg font-bold text-[#111111] leading-relaxed">
              {report.summary}
            </p>
          </Card>

          {/* Observations Grid */}
          <div className="space-y-3">
            <h3 className="font-display font-black text-lg uppercase text-[#111111]">
              Evidence Observations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.observations.map((obs, idx) => (
                <Card key={idx} variant="white" className="p-4 space-y-2">
                  <span className="px-2 py-0.5 bg-[#D9FF55] border-[1px] border-[#111111] rounded text-[10px] font-mono font-bold">
                    {obs.metricName}: {obs.metricValue}
                  </span>
                  <h4 className="font-display font-black text-sm uppercase text-[#111111]">
                    {obs.title}
                  </h4>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    {obs.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommendations & Drills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommendations */}
            <Card variant="white" className="space-y-4">
              <h3 className="font-display font-black text-base uppercase text-[#111111] pb-2 border-b-[2px] border-[#111111]/20">
                Tactical Corrections
              </h3>
              <ul className="space-y-2 text-xs">
                {report.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 bg-[#FFFDF6] border-[1px] border-[#111111] rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-[#62F5AD] shrink-0 mt-0.5" />
                    <span className="font-medium text-[#111111]">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Training Plan Drills */}
            <Card variant="cream" className="space-y-4">
              <h3 className="font-display font-black text-base uppercase text-[#111111] pb-2 border-b-[2px] border-[#111111]/20">
                Recommended Practice Drills
              </h3>
              <div className="space-y-3">
                {report.training_plan.map((drill, idx) => (
                  <div key={idx} className="p-3 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-xs uppercase text-[#111111]">
                        {drill.drillTitle}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#62F5AD] bg-[#111111] px-1.5 py-0.5 rounded">
                        Target: {drill.targetGoal}
                      </span>
                    </div>
                    <p className="text-xs text-[#525252]">
                      {drill.instructions}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Rule Citations */}
          {report.rule_references && report.rule_references.length > 0 && (
            <Card variant="white" className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]/20">
                <span className="font-display font-black text-sm uppercase text-[#111111]">
                  Statutory Rule Citations
                </span>
                <span className="font-mono text-xs text-[#737373]">
                  ITTF Statutes 2026
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.rule_references.map((rule, idx) => (
                  <div key={idx} className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-xs uppercase text-[#111111]">
                        {rule.title}
                      </span>
                      <span className="font-mono font-bold text-[10px] text-[#737373]">
                        {rule.citation}
                      </span>
                    </div>
                    <p className="text-[#525252] leading-relaxed">
                      {rule.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Rules Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <Card key={rule.ruleId} variant="white" className="space-y-2 p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-xs uppercase text-[#111111]">
                  {rule.ruleId} · {rule.title}
                </span>
                <span className="px-2 py-0.5 bg-[#D9FF55] border-[1px] border-[#111111] rounded font-mono font-bold text-[10px]">
                  {rule.sourceSection}
                </span>
              </div>
              <p className="text-[#525252] leading-relaxed">
                {rule.description}
              </p>
              {rule.limitations && (
                <div className="p-2 bg-[#FFFDF6] border-[1px] border-[#111111]/30 rounded text-[11px] text-[#737373]">
                  <strong>Engine Limitation:</strong> {rule.limitations}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
