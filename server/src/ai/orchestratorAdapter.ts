// =====================================================================
// PONG AI — Python LangGraph AI Orchestrator Adapter
// =====================================================================
// Bridges Node.js server to the local Python FastAPI orchestrator
// (FastAPI + LangGraph + Ollama Gemma 4 E2B/E4B)

import { AICoachProvider, ProviderHealth } from './provider.js';
import { CoachingReport, MatchStats, GameRule } from '../../../shared/types.js';

export class OrchestratorAdapter implements AICoachProvider {
  public readonly name = 'ollama' as const;
  public readonly modelId: string = 'gemma4 (LangGraph Dual-Model)';
  private baseUrl: string;
  private timeoutMs: number;

  constructor(
    baseUrl: string = process.env.AI_ORCHESTRATOR_URL || 'http://localhost:8000',
    timeoutMs: number = 90000
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
  }

  public async checkHealth(): Promise<ProviderHealth> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        return {
          available: false,
          provider: 'ollama',
          model: this.modelId,
          error: `AI Orchestrator returned status ${res.status}`,
        };
      }

      const data = (await res.json()) as any;
      return {
        available: data.status === 'ok',
        provider: 'ollama',
        model: `${data.active_model} (${data.policy})`,
        error: data.ollama_reachable ? undefined : 'Ollama runtime unreachable',
      };
    } catch (err: any) {
      return {
        available: false,
        provider: 'ollama',
        model: this.modelId,
        error: `AI Orchestrator offline on ${this.baseUrl}: ${err.message}`,
      };
    }
  }

  public async getModels(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/v1/models`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  public async generateCoachingReport(stats: MatchStats): Promise<CoachingReport> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/v1/coach/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Orchestrator failed (${res.status}): ${errorText}`);
      }

      const report = (await res.json()) as CoachingReport;
      return report;
    } catch (err: any) {
      clearTimeout(timer);
      throw err;
    }
  }

  public async askAnalyticsQuestion(
    question: string,
    currentMatch: MatchStats,
    matchHistory?: MatchStats[]
  ): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/v1/analytics/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          currentMatch,
          history: matchHistory,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Orchestrator returned ${res.status}`);
      }

      const data = (await res.json()) as any;
      return data.answer || data.report?.summary || 'Analysis complete.';
    } catch (err: any) {
      clearTimeout(timer);
      throw err;
    }
  }

  public async explainRule(rule: GameRule): Promise<string> {
    const res = await fetch(`${this.baseUrl}/v1/rules/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rule_id: rule.ruleId,
        question: `Explain rule ${rule.ruleId}: ${rule.title}`,
        rule_profile: rule.ruleSet,
      }),
    });

    if (!res.ok) {
      return `${rule.title} (${rule.sourceDocument} ${rule.sourceSection}): ${rule.description}`;
    }

    const data = (await res.json()) as any;
    return data.explanation || rule.description;
  }
}
