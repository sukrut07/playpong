import React, { useState } from 'react';
import { MatchStats, CoachingReport, CoachSummaryResponse } from '../../../../shared/types';
import { coachApi } from '../../services/api';
import {
  Trophy,
  Activity,
  Award,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Sparkles,
  HelpCircle,
  Send,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { formatMetricPercentage, formatMetricNumber } from '../../../../shared/metrics';

export interface MatchSummaryModalProps {
  stats: MatchStats;
  coachSummary: CoachSummaryResponse | null;
  coachingReport?: CoachingReport | null;
  loadingCoach: boolean;
  onPlayAgain: () => void;
  onViewAnalytics: () => void;
  onHome: () => void;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({
  stats,
  coachingReport,
  loadingCoach,
  onPlayAgain,
  onViewAnalytics,
  onHome,
}) => {
  const isWinner = stats.playerScore > stats.opponentScore;

  // Natural Language Q&A state
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [qaLoading, setQaLoading] = useState(false);

  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!qaQuestion.trim()) return;

    setQaLoading(true);
    setQaAnswer(null);
    try {
      const answer = await coachApi.askAnalyticsQuestion(qaQuestion, stats);
      setQaAnswer(answer);
    } catch (err: any) {
      setQaAnswer(`Could not generate answer: ${err.message}`);
    } finally {
      setQaLoading(false);
    }
  };

  const sampleQuestions = [
    'Why did I lose most of my rallies?',
    'Did tracking latency correlate with my missed returns?',
    'What is the highest priority technical drill for my next match?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="relative w-full max-w-4xl bg-[#FAF6EB] border-[3px] border-[#121212] shadow-[8px_8px_0px_#121212] my-8 flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header Ribbon */}
        <div className={`px-6 py-4 border-b-[2.5px] border-[#121212] flex items-center justify-between ${isWinner ? 'bg-[#CCFF00]' : 'bg-[#FF6B4A] text-white'}`}>
          <div className="flex items-center space-x-3">
            <Trophy className="w-7 h-7 text-[#121212]" />
            <div>
              <h2 className="text-2xl font-black font-display uppercase tracking-tight text-[#121212]">
                {isWinner ? 'Match Victory' : 'Match Defeat'}
              </h2>
              <p className="text-xs font-mono text-[#121212]">
                Rule Profile: <strong>{stats.ruleProfile}</strong> · Difficulty: <strong>{stats.difficulty.toUpperCase()}</strong>
              </p>
            </div>
          </div>

          <div className="text-right font-display font-black text-3xl text-[#121212]">
            {stats.playerScore} - {stats.opponentScore}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-5 gap-3">
            <div className="neo-box p-3 bg-white text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Return Accuracy</span>
              <strong className="text-xl font-mono text-blue-700">
                {formatMetricPercentage(stats.returnSuccessRate)}
              </strong>
              <span className="text-[10px] font-mono text-gray-400 block">
                {stats.successfulReturns}/{stats.eligibleReturnAttempts} hits
              </span>
            </div>

            <div className="neo-box p-3 bg-white text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Miss Rate</span>
              <strong className="text-xl font-mono text-red-600">
                {formatMetricPercentage(stats.missRate)}
              </strong>
              <span className="text-[10px] font-mono text-gray-400 block">
                {stats.missedReturns} errors
              </span>
            </div>

            <div className="neo-box p-3 bg-white text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Longest Rally</span>
              <strong className="text-xl font-display text-orange-600">
                {stats.longestRally}
              </strong>
              <span className="text-[10px] font-mono text-gray-400 block">returns streak</span>
            </div>

            <div className="neo-box p-3 bg-white text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Avg Reaction</span>
              <strong className="text-xl font-mono text-purple-700">
                {stats.averageReactionTimeMs ? `${Math.round(stats.averageReactionTimeMs)}ms` : 'N/A'}
              </strong>
              <span className="text-[10px] font-mono text-gray-400 block">paddle response</span>
            </div>

            <div className="neo-box p-3 bg-white text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Tracking Avail</span>
              <strong className="text-xl font-mono text-green-700">
                {stats.trackingAvailabilityPercentage ?? stats.trackingStabilityPercentage}%
              </strong>
              <span className="text-[10px] font-mono text-gray-400 block">camera uptime</span>
            </div>
          </div>

          {/* GEMMA 4 COACHING INTELLIGENCE LAYER */}
          <div className="neo-box p-5 bg-white space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-[#121212] pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-display font-black text-xl text-[#121212] uppercase tracking-tight">
                  Gemma 4 Evidence-Grounded Coaching Report
                </h3>
              </div>

              {coachingReport?.providerInfo && (
                <span className="neo-badge bg-[#E4DCFF] text-[11px]">
                  {coachingReport.providerInfo.provider === 'gemini' ? 'Google Gemini API' : 'Local Ollama'} · {coachingReport.providerInfo.model}
                </span>
              )}
            </div>

            {loadingCoach && (
              <div className="p-8 text-center font-mono text-sm text-gray-600 animate-pulse">
                Analyzing match telemetry and evaluating against ITTF Statutes with Gemma 4...
              </div>
            )}

            {coachingReport && (
              <div className="space-y-4">
                {/* Executive Summary */}
                <div className="p-4 bg-[#FAF6EB] border-[2px] border-[#121212] text-sm leading-relaxed text-[#121212]">
                  <strong>Executive Assessment:</strong> {coachingReport.summary}
                </div>

                {/* Observations & Empirical Evidence */}
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Audited Observations & Telemetry Evidence
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {coachingReport.observations.slice(0, 2).map((obs, idx) => (
                      <div key={idx} className="p-3 border-[1.5px] border-[#121212] bg-[#FAF6EB]">
                        <div className="font-bold text-xs font-display text-[#121212]">{obs.title}</div>
                        <p className="text-xs text-gray-700 mt-1">{obs.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hypotheses on Weaknesses */}
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Weakness Diagnosis (Distinguished as Hypotheses)
                  </h4>
                  <div className="space-y-2">
                    {coachingReport.weaknesses.map((w, idx) => (
                      <div key={idx} className="p-3 border-[1.5px] border-[#121212] bg-white flex items-center justify-between text-xs">
                        <div>
                          <strong>{w.issue}:</strong> {w.likelyCause}
                        </div>
                        <span className={`neo-badge ${w.isHypothesis ? 'bg-[#FFD027]' : 'bg-gray-200'} text-[10px]`}>
                          {w.isHypothesis ? 'Hypothesis' : 'Observed Fact'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Training Plan */}
                <div className="p-4 bg-[#CCFF00]/15 border-[2px] border-[#121212]">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-green-900 mb-2">
                    Targeted Training Plan & Next Objective
                  </h4>
                  {coachingReport.training_plan.map((drill, idx) => (
                    <div key={idx} className="text-xs space-y-1 mb-2">
                      <div className="font-bold font-sans text-sm text-[#121212]">{drill.drillTitle}</div>
                      <div className="text-gray-700">Target: {drill.targetMetric} ({drill.targetGoal})</div>
                      <p className="text-gray-600 italic">{drill.instructions}</p>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-green-800/20 text-xs font-mono font-bold text-green-900">
                    Next Match Objective: {coachingReport.next_match_objective}
                  </div>
                </div>

                {/* Regulatory Traceability References */}
                {coachingReport.rule_references.length > 0 && (
                  <div className="p-3 bg-[#E4DCFF] border-[1.5px] border-[#121212] text-xs font-mono">
                    <span className="font-bold uppercase block text-purple-900 mb-1">
                      Applicable Rule Reference
                    </span>
                    {coachingReport.rule_references.map((r, idx) => (
                      <div key={idx} className="text-[11px] text-[#121212]">
                        <strong>{r.citation} ({r.title}):</strong> {r.explanation}
                      </div>
                    ))}
                  </div>
                )}

                {/* Limitations */}
                {coachingReport.limitations.length > 0 && (
                  <div className="p-3 border-[1.5px] border-dashed border-[#121212] bg-[#FAF6EB] text-[11px] font-mono text-gray-600">
                    <strong>Honest Simulation Disclosure:</strong> {coachingReport.limitations.join(' ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NATURAL LANGUAGE ANALYTICS ASSISTANT (Q&A) */}
          <div className="neo-box p-5 bg-[#FAF6EB] space-y-3">
            <h3 className="font-display font-black text-lg text-[#121212] flex items-center">
              <HelpCircle className="w-5 h-5 mr-1.5" /> Ask Gemma 4 About This Match
            </h3>
            <p className="text-xs text-gray-600">
              Query the intelligence layer directly regarding your telemetry, reaction time, or specific rallies.
            </p>

            {/* Quick Sample Questions */}
            <div className="flex items-center gap-2 flex-wrap">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setQaQuestion(q)}
                  className="px-2.5 py-1 text-xs font-mono border-[1.5px] border-[#121212] bg-white hover:bg-gray-100 text-left"
                >
                  "{q}"
                </button>
              ))}
            </div>

            {/* Question Input Form */}
            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Gemma 4 anything about your gameplay stats..."
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                className="flex-1 px-3 py-2 border-[2px] border-[#121212] font-mono text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
              />
              <button
                type="submit"
                disabled={qaLoading || !qaQuestion.trim()}
                className="neo-btn neo-btn-lime px-4 py-2 text-xs font-mono uppercase"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                {qaLoading ? 'Analyzing...' : 'Ask'}
              </button>
            </form>

            {/* Answer Display Box */}
            {qaAnswer && (
              <div className="p-4 neo-box bg-white text-xs leading-relaxed font-sans mt-2">
                <span className="font-mono text-[10px] text-purple-700 font-bold uppercase block mb-1">
                  Gemma 4 Response
                </span>
                {qaAnswer}
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="px-6 py-4 border-t-[2.5px] border-[#121212] bg-white flex items-center justify-between shrink-0">
          <button
            onClick={onHome}
            className="neo-btn neo-btn-white px-4 py-2 text-xs font-mono uppercase"
          >
            Main Menu
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onViewAnalytics}
              className="neo-btn neo-btn-lavender px-4 py-2 text-xs font-mono uppercase"
            >
              Open Analytics Studio
            </button>
            <button
              onClick={onPlayAgain}
              className="neo-btn neo-btn-lime px-5 py-2 text-xs font-mono uppercase font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Play Rematch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
