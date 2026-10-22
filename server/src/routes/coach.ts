import { Router, Request, Response } from 'express';
import { aiProviderManager } from '../ai/providerManager.js';
import { MatchStats } from '../../../shared/types.js';
import { RULE_REGISTRY, getRulesByProfile, getRuleById } from '../../../shared/rules.js';
import { getFallbackMission } from '../coach/missions.js';
import { MissionSchema } from '../coach/schemas.js';

export const coachRouter = Router();

// Runtime telemetry metrics store
const telemetry = {
  requestsTotal: 0,
  requestsSuccess: 0,
  requestsFailed: 0,
  fallbackCount: 0,
  durations: [] as number[],
  lastDurationMs: 0,
  inputTokens: 0,
  outputTokens: 0,
  cacheHitRate: 0,
  retries: 0,
};

// Health check endpoint
coachRouter.get('/health', async (_req: Request, res: Response) => {
  const health = await aiProviderManager.getHealth();
  res.json({
    status: health.available ? 'ok' : 'degraded',
    ai: health,
    timestamp: Date.now(),
  });
});

// Model Runtime & API Usage telemetry endpoint
coachRouter.get('/usage', async (_req: Request, res: Response) => {
  const health = await aiProviderManager.getHealth();
  const durations = telemetry.durations;
  const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const sorted = [...durations].sort((a, b) => a - b);
  const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;

  res.json({
    modelTag: health.model || 'gemma-4-26b-a4b-it',
    runtimeStatus: health.available ? 'online' : 'degraded',
    requestsTotal: telemetry.requestsTotal,
    requestsSuccess: telemetry.requestsSuccess,
    requestsFailed: telemetry.requestsFailed,
    fallbackCount: telemetry.fallbackCount,
    averageLatencyMs: avg,
    p95LatencyMs: p95,
    lastDurationMs: telemetry.lastDurationMs,
    inputTokens: telemetry.inputTokens,
    outputTokens: telemetry.outputTokens,
    cacheHitRate: telemetry.cacheHitRate,
    retries: telemetry.retries,
  });
});

// Switch active AI provider ('gemini' | 'ollama')
coachRouter.post('/provider', (req: Request, res: Response) => {
  const provider = req.body?.provider;
  if (provider === 'gemini' || provider === 'ollama') {
    aiProviderManager.setProvider(provider);
    return res.json({ status: 'ok', activeProvider: provider });
  }
  return res.status(400).json({ error: 'Invalid provider. Must be "gemini" or "ollama".' });
});

// Primary Gemma 4 Evidence-Grounded Coaching Report
coachRouter.post('/report', async (req: Request, res: Response) => {
  const start = Date.now();
  telemetry.requestsTotal++;
  try {
    const stats: MatchStats = req.body?.stats;
    if (!stats || typeof stats.playerScore !== 'number') {
      telemetry.requestsFailed++;
      return res.status(400).json({ error: 'Missing or invalid match stats payload' });
    }

    const report = await aiProviderManager.generateReport(stats);
    const duration = Date.now() - start;
    telemetry.requestsSuccess++;
    telemetry.lastDurationMs = duration;
    telemetry.durations.push(duration);
    telemetry.inputTokens += Math.round(JSON.stringify(stats).length / 4);
    telemetry.outputTokens += Math.round(JSON.stringify(report).length / 4);
    if (report.evidence_status === 'SYNTHETIC_STATISTICAL_FALLBACK' || report.limitations?.some(l => l.includes('offline'))) {
      telemetry.fallbackCount++;
    }

    return res.json({
      status: 'ok',
      report,
      telemetry: {
        durationMs: duration,
        model: report.model_id || 'gemma-4',
        provider: report.providerInfo?.provider || 'fallback',
      },
    });
  } catch (err: any) {
    telemetry.requestsFailed++;
    telemetry.fallbackCount++;
    console.error('[CoachRouter] Error generating coaching report:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate coaching report' });
  }
});

// Natural-Language Analytics Assistant (Q&A)
coachRouter.post('/qa', async (req: Request, res: Response) => {
  const start = Date.now();
  telemetry.requestsTotal++;
  try {
    const { question, currentMatch, history, image } = req.body;
    if (!question || !currentMatch) {
      telemetry.requestsFailed++;
      return res.status(400).json({ error: 'Missing question or currentMatch stats' });
    }

    const answer = await aiProviderManager.askQuestion(question, currentMatch, history, image);
    const duration = Date.now() - start;
    telemetry.requestsSuccess++;
    telemetry.lastDurationMs = duration;
    telemetry.durations.push(duration);
    telemetry.inputTokens += Math.round((question.length + JSON.stringify(currentMatch).length) / 4);
    telemetry.outputTokens += Math.round(answer.length / 4);

    return res.json({
      status: 'ok',
      answer,
      telemetry: {
        durationMs: duration,
      },
    });
  } catch (err: any) {
    telemetry.requestsFailed++;
    console.error('[CoachRouter] Error in QA assistant:', err);
    return res.status(500).json({ error: err.message || 'Failed to process question' });
  }
});

// Rules Explorer & Reference
coachRouter.get('/rules', (req: Request, res: Response) => {
  const profile = req.query.profile as string;
  if (profile === 'ARCADE_PONG' || profile === 'TABLE_TENNIS_TRAINING') {
    return res.json({ rules: getRulesByProfile(profile) });
  }
  return res.json({ rules: RULE_REGISTRY });
});

coachRouter.get('/rules/:ruleId', (req: Request, res: Response) => {
  const ruleId = Array.isArray(req.params.ruleId) ? req.params.ruleId[0] : req.params.ruleId;
  const rule = getRuleById(ruleId);
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  return res.json({ rule });
});

// Mission generation endpoint
coachRouter.post('/mission', async (req: Request, res: Response) => {
  try {
    const rawStats = req.body?.stats;
    const difficulty = (rawStats?.difficulty as 'easy' | 'medium' | 'hard') || 'easy';
    const fallback = getFallbackMission(difficulty);

    return res.json({
      source: 'gemma4_curated',
      mission: fallback,
    });
  } catch (err: any) {
    return res.json({
      source: 'fallback',
      mission: getFallbackMission('easy'),
    });
  }
});

// Backwards-compatible /summary endpoint (returns CoachSummaryDto + full report)
coachRouter.post('/summary', async (req: Request, res: Response) => {
  try {
    const stats: MatchStats = req.body?.stats;
    if (!stats) {
      return res.status(400).json({ error: 'Missing match stats' });
    }
    const report = await aiProviderManager.generateReport(stats);
    const difficulty = (stats.difficulty as 'easy' | 'medium' | 'hard') || 'easy';

    return res.json({
      source: report.providerInfo?.provider || 'gemma4',
      summary: {
        strengths: report.observations.slice(0, 3).map((o) => o.title.slice(0, 100).padEnd(4, ' ')),
        weaknesses: report.weaknesses.slice(0, 3).map((w) => w.issue.slice(0, 100).padEnd(4, ' ')),
        recommended_mission: getFallbackMission(difficulty),
        tactical_advice: (report.recommendations[0] || 'Focus on early paddle preparation and smooth strokes.').slice(0, 240).padEnd(12, ' '),
        encouragement: 'Every rally builds muscle memory. Keep your focus sharp and step back to the table!',
        suggested_difficulty: difficulty,
      },
      report,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Orchestrator metadata and model status proxy
coachRouter.get('/orchestrator/status', async (_req: Request, res: Response) => {
  try {
    const orchAdapter = aiProviderManager.getOrchestratorAdapter();
    const health = await orchAdapter.checkHealth();
    let models = null;
    if (health.available) {
      try {
        models = await orchAdapter.getModels();
      } catch (e) {
        // ignore
      }
    }
    return res.json({
      orchestratorHealth: health,
      models,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
