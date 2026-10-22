// =====================================================================
// PONG AI — Hosted Gemma 4 Gemini API Adapter
// =====================================================================
// Official documentation: https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api
// Supported model identifiers:
// - gemma-4-26b-a4b-it (Mixture-of-Experts with 4B active parameters)
// - gemma-4-31b-it (Dense 31B parameter model)

import { AICoachProvider, ProviderHealth } from './provider.js';
import { CoachingReport, MatchStats, GameRule } from '../../../shared/types.js';
import { buildGemma4CoachingPrompt, buildAnalyticsQAPrompt } from './promptTemplates.js';
import { CoachingReportSchema } from './schemas.js';
import { RULE_REGISTRY } from '../../../shared/rules.js';

export class GeminiGemmaAdapter implements AICoachProvider {
  public readonly name = 'gemini' as const;
  public readonly modelId: string;
  private apiKey: string;
  private timeoutMs: number;

  constructor(
    apiKey: string = process.env.GEMINI_API_KEY || '',
    modelId: string = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it',
    timeoutMs = 12000
  ) {
    this.apiKey = apiKey;
    this.modelId = modelId;
    this.timeoutMs = timeoutMs;
  }

  public async checkHealth(): Promise<ProviderHealth> {
    if (!this.apiKey) {
      return {
        available: false,
        provider: 'gemini',
        model: this.modelId,
        hasKey: false,
        error: 'Missing GEMINI_API_KEY in environment variables.',
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      // Lightweight probe request to verify API key validity
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}?key=${this.apiKey}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        return {
          available: true,
          provider: 'gemini',
          model: this.modelId,
          hasKey: true,
        };
      }

      const errText = await res.text();
      return {
        available: false,
        provider: 'gemini',
        model: this.modelId,
        hasKey: true,
        error: `Gemini API probe error (${res.status}): ${errText.slice(0, 100)}`,
      };
    } catch (err: any) {
      return {
        available: false,
        provider: 'gemini',
        model: this.modelId,
        hasKey: true,
        error: `Connection error: ${err.message || 'Probe aborted'}`,
      };
    }
  }

  public async generateCoachingReport(stats: MatchStats): Promise<CoachingReport> {
    if (!this.apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your .env file.'
      );
    }

    const startTime = Date.now();
    const applicableRules = RULE_REGISTRY.filter((r) => r.ruleSet === stats.ruleProfile);
    const { systemPrompt, userPrompt } = buildGemma4CoachingPrompt(stats, applicableRules);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            topP: 0.9,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorBody}`);
      }

      const data = (await response.json()) as any;
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Gemini API returned an empty or malformed completion.');
      }

      let parsed: any;
      try {
        let cleanText = rawText.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        parsed = JSON.parse(cleanText);
      } catch (parseErr) {
        throw new Error(`Failed to parse Gemma 4 response as JSON: ${rawText.slice(0, 150)}`);
      }

      // Validate against strict Zod schema
      const validated = CoachingReportSchema.parse(parsed);

      return {
        ...validated,
        providerInfo: {
          provider: 'gemini',
          model: this.modelId,
          inferenceTimeMs: Date.now() - startTime,
        },
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`Gemma 4 request timed out after ${this.timeoutMs}ms.`);
      }
      throw err;
    }
  }

  public async askAnalyticsQuestion(
    question: string,
    currentMatch: MatchStats,
    matchHistory?: MatchStats[]
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const { systemPrompt, userPrompt } = buildAnalyticsQAPrompt(question, currentMatch, matchHistory);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
      }

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.trim() : 'No response generated.';
    } catch (err: any) {
      clearTimeout(timeout);
      throw err;
    }
  }

  public async explainRule(rule: GameRule): Promise<string> {
    if (!this.apiKey) {
      return `${rule.title} (${rule.ruleId}): ${rule.description} [Source: ${rule.sourceSection} ${rule.sourceDocument}]`;
    }

    const prompt = `Explain the following table tennis regulation clearly and concisely for an arcade player:
Rule ID: ${rule.ruleId}
Title: ${rule.title}
Official Citation: ${rule.sourceSection} from ${rule.sourceDocument}
Description: ${rule.description}
Simulation Limitations: ${rule.limitations}

Output 2-3 sentences explaining when this rule applies and how it affects gameplay.`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150 },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (response.ok) {
        const data = (await response.json()) as any;
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || rule.description;
      }
    } catch {}

    return `${rule.title}: ${rule.description}`;
  }
}
