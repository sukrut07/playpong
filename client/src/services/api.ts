import {
  Mission,
  CoachSummaryResponse,
  CoachingReport,
  MatchStats,
  HealthCheckResponse,
  GameDifficulty,
  GameRule,
} from '../../../shared/types';
import { RULE_REGISTRY } from '../../../shared/rules';

export class CoachApiClient {
  private baseUrl: string = '/api/coach';

  public async checkHealth(): Promise<HealthCheckResponse['ai']> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) {
        return {
          available: false,
          provider: 'gemini',
          model: 'unknown',
          error: `HTTP error ${res.status}`,
        };
      }
      const data = await res.json();
      return (
        data.ai || {
          available: false,
          provider: 'gemini',
          model: 'gemma-4-26b-a4b-it',
        }
      );
    } catch (e: any) {
      return {
        available: false,
        provider: 'gemini',
        model: 'gemma-4-26b-a4b-it',
        error: e.message || 'Server unreachable',
      };
    }
  }

  public async switchProvider(provider: 'gemini' | 'ollama'): Promise<{ status: string; activeProvider: string }> {
    const res = await fetch(`${this.baseUrl}/provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    return res.json();
  }

  public async requestCoachingReport(stats: MatchStats): Promise<CoachingReport> {
    try {
      const res = await fetch(`${this.baseUrl}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats }),
      });
      if (!res.ok) throw new Error(`Report generation failed (${res.status})`);
      const data = await res.json();
      return data.report;
    } catch (e: any) {
      console.warn('[CoachApiClient] Remote report generation failed, using local fallback:', e);
      // Local client-side fallback matching schema
      return {
        summary: `Match finished with score ${stats.playerScore} - ${stats.opponentScore}. Return success rate measured at ${stats.returnSuccessRate?.toFixed(1) ?? 'N/A'}% across ${stats.eligibleReturnAttempts} eligible attempts.`,
        observations: [
          {
            title: 'Defensive Interceptions',
            description: `Player executed ${stats.successfulReturns} successful returns with average reaction time of ${stats.averageReactionTimeMs ? Math.round(stats.averageReactionTimeMs) + 'ms' : 'N/A'}.`,
            metricName: 'Return Success Rate',
            metricValue: `${stats.returnSuccessRate?.toFixed(1) ?? 'N/A'}%`,
          },
          {
            title: 'Rally Exchange Depth',
            description: `Sustained a peak rally of ${stats.longestRally} returns with an average exchange of ${stats.averageRallyLength?.toFixed(1) ?? 'N/A'} returns.`,
            metricName: 'Longest Rally',
            metricValue: stats.longestRally,
          },
        ],
        evidence: [
          {
            metric: 'Return Success Rate',
            observedValue: `${stats.returnSuccessRate?.toFixed(1) ?? 'N/A'}%`,
            expectedBenchmark: '> 75.0% for balanced match progression',
            significance: 'Key measure of defensive paddle placement and strike timing.',
          },
        ],
        weaknesses: [
          {
            issue: 'Central Court Clustering',
            likelyCause: 'Safe return instincts tend to route balls toward table center',
            isHypothesis: true,
          },
        ],
        recommendations: [
          'Pre-position your paddle before the ball crosses the net.',
          'Practice cross-court angled returns in Gesture Lab.',
        ],
        training_plan: [
          {
            drillTitle: 'Continuous Return Rhythm',
            targetMetric: 'Return Success Rate',
            targetGoal: 'Reach 80% over 15 attempts',
            instructions: 'Focus on compact, smooth forward strokes without over-extending.',
          },
        ],
        next_match_objective: 'Maintain an 80%+ return rate on 15+ consecutive rallies.',
        rule_references: [
          {
            ruleId: 'ITTF-2.7',
            title: 'The Return',
            citation: 'ITTF Statutes 2026 §2.7.1',
            explanation: 'The ball having been served or returned shall be struck so that it touches the opponents court.',
          },
        ],
        limitations: [
          'Live Gemma 4 provider currently offline; report generated via deterministic local rules engine.',
          'MediaPipe hand tracking is 2D planar and does not measure real-world ball spin or blade rubber friction.',
        ],
        providerInfo: {
          provider: 'gemini',
          model: 'gemma-4-26b-a4b-it (fallback)',
          inferenceTimeMs: 0,
        },
      };
    }
  }

  public async askAnalyticsQuestion(
    question: string,
    currentMatch: MatchStats,
    history?: MatchStats[]
  ): Promise<string> {
    try {
      const res = await fetch(`${this.baseUrl}/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, currentMatch, history }),
      });
      if (!res.ok) throw new Error(`QA request failed (${res.status})`);
      const data = await res.json();
      return data.answer;
    } catch (e: any) {
      return `Telemetry Answer: In match ${currentMatch.matchId}, you achieved ${currentMatch.successfulReturns} successful returns out of ${currentMatch.eligibleReturnAttempts} attempts (${currentMatch.returnSuccessRate?.toFixed(1) ?? 'N/A'}%). Longest rally was ${currentMatch.longestRally} returns. (Note: Live AI Q&A unavailable: ${e.message})`;
    }
  }

  public async fetchRules(profile?: string): Promise<GameRule[]> {
    try {
      const url = profile ? `${this.baseUrl}/rules?profile=${profile}` : `${this.baseUrl}/rules`;
      const res = await fetch(url);
      if (!res.ok) return RULE_REGISTRY;
      const data = await res.json();
      return data.rules || RULE_REGISTRY;
    } catch {
      return RULE_REGISTRY;
    }
  }

  public async requestMission(
    stats?: Partial<MatchStats>,
    difficulty: GameDifficulty = 'easy'
  ): Promise<{ mission: Mission; source: 'gemma4' | 'fallback' }> {
    try {
      const res = await fetch(`${this.baseUrl}/mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: { ...stats, difficulty } }),
      });
      if (!res.ok) throw new Error('Mission request failed');
      return await res.json();
    } catch {
      return {
        source: 'fallback',
        mission: {
          id: `fallback_${Date.now()}`,
          mission_title: 'Solid Fundamentals',
          mission_description: 'Return 4 consecutive balls without missing.',
          mission_type: 'consecutive_returns',
          target_value: 4,
          current_value: 0,
          difficulty,
          coach_tip: 'Keep your paddle centered and make controlled forward strokes.',
          reason: 'Calibrating stroke timing.',
          completed: false,
        },
      };
    }
  }

  public async requestSummary(stats: MatchStats): Promise<{
    summary: CoachSummaryResponse;
    source: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats }),
      });
      if (!res.ok) throw new Error('Summary request failed');
      return await res.json();
    } catch {
      const diff = stats.difficulty || 'easy';
      return {
        source: 'fallback',
        summary: {
          summary: `Match evaluation completed: ${stats.playerScore} - ${stats.opponentScore}`,
          strengths: [`Return success rate: ${stats.returnSuccessRate?.toFixed(1) ?? 'N/A'}%`],
          weaknesses: ['Paddle reaction delay approaching edge balls'],
          recommended_mission: {
            id: `rec_${Date.now()}`,
            mission_title: 'Extended Rally Drill',
            mission_description: 'Reach a rally of 5 or more returns.',
            mission_type: 'rally_length',
            target_value: 5,
            current_value: 0,
            difficulty: diff,
            coach_tip: 'Focus on early paddle preparation before the ball bounces.',
            reason: 'Stabilizing return timing against varying speed.',
            completed: false,
          },
          tactical_advice: 'Focus on early paddle preparation and smooth horizontal pushes.',
          encouragement: 'Every rally sharpens your reflexes. Keep competing!',
          suggested_difficulty: diff,
        },
      };
    }
  }
}

export const coachApi = new CoachApiClient();
