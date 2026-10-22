/**
 * PONG AI — AI Model & Coaching Service
 * Coordinates with Python FastAPI / Ollama Gemma 4 service or fallback deterministic rule engine.
 */

import {
  MatchStats,
  CoachingReport,
  CoachSummaryResponse,
  Mission,
  GameDifficulty,
  GameRule,
} from '@game-engine/types';
import { RULE_REGISTRY } from '@game-engine/rules';
import { apiClient } from './api-client';

export interface ModelHealthStatus {
  available: boolean;
  provider: 'gemini' | 'ollama' | 'fallback';
  model: string;
  latencyMs?: number;
  error?: string;
}

export class ModelService {
  public async getHealth(): Promise<ModelHealthStatus> {
    try {
      const data = await apiClient.get<any>('/api/coach/health', { timeoutMs: 3000 });
      return {
        available: data.ai?.available ?? false,
        provider: data.ai?.provider ?? 'ollama',
        model: data.ai?.model ?? 'gemma4 (LangGraph Dual-Model)',
        latencyMs: data.ai?.latencyMs,
      };
    } catch (err: any) {
      return {
        available: false,
        provider: 'fallback',
        model: 'Deterministic ITTF 2026 Engine',
        error: err.message,
      };
    }
  }

  public async getCoachingReport(stats: MatchStats): Promise<CoachingReport> {
    try {
      const data = await apiClient.post<{ report: CoachingReport }>('/api/coach/report', { stats }, { timeoutMs: 9000 });
      if (data?.report) return data.report;
      throw new Error('Missing report body');
    } catch (err: any) {
      console.warn('[ModelService] Remote AI inference offline, generating deterministic report:', err.message);
      return this.generateDeterministicReport(stats);
    }
  }

  public async getMatchSummary(stats: MatchStats): Promise<CoachSummaryResponse> {
    try {
      const data = await apiClient.post<{ summary: CoachSummaryResponse }>('/api/coach/summary', { stats }, { timeoutMs: 6000 });
      if (data?.summary) return data.summary;
      throw new Error('Missing summary body');
    } catch {
      return this.generateDeterministicSummary(stats);
    }
  }

  public async getMission(difficulty: GameDifficulty = 'medium'): Promise<Mission> {
    try {
      const data = await apiClient.post<{ mission: Mission }>('/api/coach/mission', { stats: { difficulty } }, { timeoutMs: 4000 });
      if (data?.mission) return data.mission;
      throw new Error('Mission failed');
    } catch {
      return {
        id: `mission_${Date.now()}`,
        mission_title: 'Rally Maestro',
        mission_description: 'Keep the rally alive for 6 consecutive returns.',
        mission_type: 'consecutive_returns',
        target_value: 6,
        current_value: 0,
        difficulty,
        coach_tip: 'Anticipate the bounce and adjust your paddle height before impact.',
        reason: 'Stabilizing defensive return accuracy.',
        completed: false,
      };
    }
  }

  public async getRules(): Promise<GameRule[]> {
    try {
      const data = await apiClient.get<{ rules: GameRule[] }>('/api/coach/rules', { timeoutMs: 3000 });
      if (data?.rules) return data.rules;
      return RULE_REGISTRY;
    } catch {
      return RULE_REGISTRY;
    }
  }

  private generateDeterministicReport(stats: MatchStats): CoachingReport {
    const successRate = stats.returnSuccessRate !== null ? `${stats.returnSuccessRate.toFixed(1)}%` : 'N/A';
    const isWin = stats.playerScore > stats.opponentScore;
    const zones = stats.tableZoneHits || stats.tableZoneDistribution || { left: 0, center: 0, right: 0, deep: 0, short: 0 };

    return {
      summary: `Match concluded with ${isWin ? 'player victory' : 'opponent victory'} (${stats.playerScore} - ${stats.opponentScore}). Telemetry indicates a ${successRate} return success rate across ${stats.completedRallies ?? stats.totalRallies ?? 0} completed rallies.`,
      observations: [
        {
          title: 'Court Interceptions',
          description: `Executed ${stats.successfulReturns} successful returns out of ${stats.eligibleReturnAttempts} eligible attempts.`,
          metricName: 'Return Success Rate',
          metricValue: successRate,
        },
        {
          title: 'Rally Exchange Depth',
          description: `Sustained a peak rally of ${stats.longestRally} returns with an average exchange of ${stats.averageRallyLength?.toFixed(1) ?? '1.0'} returns.`,
          metricName: 'Longest Rally',
          metricValue: stats.longestRally,
        },
        {
          title: 'Placement Distribution',
          description: `Zone counts: Left (${zones.left}), Center (${zones.center}), Right (${zones.right}).`,
          metricName: 'Zone Distribution',
          metricValue: `L:${zones.left} C:${zones.center} R:${zones.right}`,
        },
      ],
      evidence: [
        {
          metric: 'Return Success Rate',
          observedValue: successRate,
          expectedBenchmark: '> 75.0% for balanced match progression',
          significance: 'Primary indicator of defensive stability and paddle-ball contact accuracy.',
        },
      ],
      weaknesses: [
        {
          issue: 'Lateral Placement Spread',
          likelyCause: 'Safe return instincts tend to route balls toward table center',
          isHypothesis: true,
        },
      ],
      recommendations: [
        'Pre-position your paddle before the ball crosses the net plane.',
        'Use the OneEuroFilter smoothing calibration in Gesture Lab to eliminate hand micro-tremors.',
      ],
      training_plan: [
        {
          drillTitle: 'Continuous Return Rhythm',
          targetMetric: 'Return Success Rate',
          targetGoal: 'Reach 80% over 15 returns',
          instructions: 'Practice in Arcade mode focusing on smooth horizontal paddle deflections without over-reaching.',
        },
      ],
      next_match_objective: 'Maintain an 80%+ return success rate on 15+ consecutive rallies.',
      rule_references: [
        {
          ruleId: 'ITTF-2.1',
          title: 'The Table Dimensions & Surface',
          citation: '§2.1.1, §2.1.3 ITTF Statutes 2026 — Chapter 2: The Laws of Table Tennis',
          explanation: 'The upper surface of the table shall be rectangular, 2.74m in length and 1.525m in width, horizontal at 76cm above the floor.',
        },
      ],
      limitations: [
        'Live Gemma 4 inference offline; report calculated via deterministic rules & metrics engine.',
        'MediaPipe webcam tracking is 2D planar and does not capture 3D racket rubber friction or ball spin.',
      ],
      providerInfo: {
        provider: 'fallback',
        model: 'Deterministic ITTF 2026 Engine',
        inferenceTimeMs: 0,
      },
    };
  }

  private generateDeterministicSummary(stats: MatchStats): CoachSummaryResponse {
    const isWin = stats.playerScore > stats.opponentScore;
    return {
      summary: `Match completed: ${stats.playerScore} - ${stats.opponentScore} (${isWin ? 'Win' : 'Loss'}).`,
      strengths: [
        `Return success rate: ${stats.returnSuccessRate !== null ? stats.returnSuccessRate.toFixed(1) + '%' : 'N/A'}`,
        `Peak rally streak: ${stats.longestRally} returns`,
      ],
      weaknesses: ['Paddle reaction delay approaching edge balls'],
      recommended_mission: {
        id: `mission_${Date.now()}`,
        mission_title: 'Extended Rally Drill',
        mission_description: 'Reach a rally of 5 or more returns.',
        mission_type: 'rally_length',
        target_value: 5,
        current_value: 0,
        difficulty: stats.difficulty || 'medium',
        coach_tip: 'Focus on early paddle preparation before the ball bounces.',
        reason: 'Stabilizing return timing against varying speed.',
        completed: false,
      },
      tactical_advice: 'Focus on early paddle preparation and smooth horizontal pushes.',
      encouragement: 'Every rally sharpens your reflexes. Keep competing!',
      suggested_difficulty: stats.difficulty || 'medium',
    };
  }
}

export const modelService = new ModelService();
