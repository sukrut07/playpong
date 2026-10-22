// =====================================================================
// PONG AI — Local Gemma 4 Ollama Adapter
// =====================================================================
// Secondary adapter for local / offline inference workflows

import { AICoachProvider, ProviderHealth } from './provider.js';
import { CoachingReport, MatchStats, GameRule } from '../../../shared/types.js';
import { buildGemma4CoachingPrompt, buildAnalyticsQAPrompt } from './promptTemplates.js';
import { CoachingReportSchema } from './schemas.js';
import { RULE_REGISTRY } from '../../../shared/rules.js';

export class OllamaGemmaAdapter implements AICoachProvider {
  public readonly name = 'ollama' as const;
  public readonly modelId: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(
    baseUrl: string = process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    modelId: string = process.env.OLLAMA_MODEL || 'gemma4:e2b',
    timeoutMs = 12000
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.modelId = modelId;
    this.timeoutMs = timeoutMs;
  }

  public async checkHealth(): Promise<ProviderHealth> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        return {
          available: false,
          provider: 'ollama',
          model: this.modelId,
          error: `Ollama returned HTTP ${res.status}`,
        };
      }

      const data = (await res.json()) as { models?: Array<{ name: string; model: string }> };
      const modelList = data.models || [];
      const hasModel = modelList.some(
        (m) => m.name === this.modelId || m.model === this.modelId || m.name.startsWith(this.modelId)
      );

      return {
        available: true,
        provider: 'ollama',
        model: hasModel ? this.modelId : (modelList[0]?.name ?? this.modelId),
      };
    } catch (err: any) {
      return {
        available: false,
        provider: 'ollama',
        model: this.modelId,
        error: `Cannot reach Ollama daemon at ${this.baseUrl}: ${err.message}`,
      };
    }
  }

  public async generateCoachingReport(stats: MatchStats): Promise<CoachingReport> {
    const startTime = Date.now();
    const applicableRules = RULE_REGISTRY.filter((r) => r.ruleSet === stats.ruleProfile);
    const { systemPrompt, userPrompt } = buildGemma4CoachingPrompt(stats, applicableRules);

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelId,
          prompt: fullPrompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.2,
            top_p: 0.9,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Ollama returned status ${res.status}`);
      }

      const data = (await res.json()) as { response: string };
      let text = data.response.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(text);
      const validated = CoachingReportSchema.parse(parsed);

      return {
        ...validated,
        providerInfo: {
          provider: 'ollama',
          model: this.modelId,
          inferenceTimeMs: Date.now() - startTime,
        },
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`Local Ollama inference timed out after ${this.timeoutMs}ms.`);
      }
      throw err;
    }
  }

  public async askAnalyticsQuestion(
    question: string,
    currentMatch: MatchStats,
    matchHistory?: MatchStats[]
  ): Promise<string> {
    const { systemPrompt, userPrompt } = buildAnalyticsQAPrompt(question, currentMatch, matchHistory);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelId,
          prompt: fullPrompt,
          stream: false,
          options: { temperature: 0.3 },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`Ollama returned status ${res.status}`);
      const data = (await res.json()) as { response: string };
      return data.response.trim();
    } catch (err: any) {
      clearTimeout(timeout);
      throw err;
    }
  }

  public async explainRule(rule: GameRule): Promise<string> {
    return `${rule.title} (${rule.ruleId}): ${rule.description} [Source: ${rule.sourceSection} from ${rule.sourceDocument}]`;
  }
}
