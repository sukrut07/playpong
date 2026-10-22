import { HealthCheckResponse } from '../../../shared/types.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e2b';

export class OllamaService {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = OLLAMA_BASE_URL, model: string = DEFAULT_MODEL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
  }

  public getModelName(): string {
    return this.model;
  }

  public setModelName(model: string): void {
    this.model = model;
  }

  public async checkHealth(): Promise<HealthCheckResponse['ollama']> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return { available: false, model: this.model };
      }

      const data = (await res.json()) as { models?: Array<{ name: string; model: string }> };
      const modelList = data.models || [];
      const hasModel = modelList.some(
        (m) => m.name === this.model || m.model === this.model || m.name.startsWith(this.model)
      );

      return {
        available: true,
        model: hasModel ? this.model : (modelList[0]?.name ?? 'none'),
      };
    } catch {
      return { available: false, model: this.model };
    }
  }

  public async generateJson<T>(prompt: string, timeoutMs = 8000): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.3,
            top_p: 0.9,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[OllamaService] HTTP error ${res.status}`);
        return null;
      }

      const raw = (await res.json()) as { response: string };
      if (!raw || !raw.response) {
        return null;
      }

      // Strip any accidental markdown formatting or surrounding whitespace
      let text = raw.response.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(text) as T;
      return parsed;
    } catch (err: any) {
      console.warn(`[OllamaService] Generation failed: ${err.message || err}`);
      return null;
    }
  }
}

export const ollamaService = new OllamaService();
