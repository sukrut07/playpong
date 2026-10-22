import {
  Mission,
  CoachSummaryResponse,
  MatchStats,
  HealthCheckResponse,
  GameDifficulty,
} from '../../../shared/types';

export class CoachApiClient {
  private baseUrl: string = '/api/coach';

  public async checkHealth(): Promise<HealthCheckResponse['ollama']> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) return { available: false, model: 'none' };
      const data = await res.json();
      return data.ollama;
    } catch {
      return { available: false, model: 'none' };
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
    } catch (e) {
      console.warn('[CoachApiClient] Using local fallback mission:', e);
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
    source: 'gemma4' | 'fallback';
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats }),
      });
      if (!res.ok) throw new Error('Summary request failed');
      return await res.json();
    } catch (e) {
      console.warn('[CoachApiClient] Using local fallback summary:', e);
      const diff = stats.difficulty || 'easy';
      return {
        source: 'fallback',
        summary: {
          strengths: [
            stats.returnSuccessRate >= 60
              ? `Dependable return accuracy of ${stats.returnSuccessRate.toFixed(1)}%`
              : `Active baseline movement with ${stats.totalReturns} total return attempts`,
            `Peak rally sustained for ${stats.longestRally} returns`,
          ],
          weaknesses: [
            stats.returnSuccessRate < 60
              ? `Return accuracy dropped to ${stats.returnSuccessRate.toFixed(1)}%`
              : `Opponent capitalized on central placement`,
          ],
          recommended_mission: {
            id: `rec_${Date.now()}`,
            mission_title: 'Extended Rally Drill',
            mission_description: 'Reach a rally of 5 or more returns.',
            mission_type: 'rally_length',
            target_value: 5,
            current_value: 0,
            difficulty: diff,
            coach_tip: 'Focus on early paddle preparation before the ball bounces.',
            reason: 'Stabilizing return timing against varying spin.',
            completed: false,
          },
          tactical_advice:
            'Focus on consistent contact in front of your body rather than chasing edge angles.',
          encouragement: 'Great effort! Your reflexes are sharpening with every rally.',
          suggested_difficulty: diff,
        },
      };
    }
  }

  public async checkAdaptiveDifficulty(
    stats: MatchStats
  ): Promise<{
    suggested_difficulty: GameDifficulty;
    reason: string;
    paddle_speed_multiplier: number;
    source: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/adaptive-difficulty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats }),
      });
      if (!res.ok) throw new Error('Adaptive request failed');
      return await res.json();
    } catch {
      return {
        suggested_difficulty: stats.difficulty,
        reason: 'Maintained current difficulty level.',
        paddle_speed_multiplier: 1.0,
        source: 'fallback',
      };
    }
  }
}

export const coachApi = new CoachApiClient();
