// =====================================================================
// PONG AI — AI Coach Provider Interface
// =====================================================================

import { CoachingReport, MatchStats, GameRule } from '../../../shared/types.js';

export interface ProviderHealth {
  available: boolean;
  provider: 'gemini' | 'ollama';
  model: string;
  hasKey?: boolean;
  error?: string;
}

export interface AICoachProvider {
  readonly name: 'gemini' | 'ollama';
  readonly modelId: string;

  checkHealth(): Promise<ProviderHealth>;
  generateCoachingReport(stats: MatchStats): Promise<CoachingReport>;
  askAnalyticsQuestion(question: string, currentMatch: MatchStats, matchHistory?: MatchStats[]): Promise<string>;
  explainRule(rule: GameRule): Promise<string>;
}
