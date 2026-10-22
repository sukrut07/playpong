import { Router, Request, Response } from 'express';
import { ollamaService } from '../services/ollama.js';
import {
  MissionSchema,
  CoachSummarySchema,
  MatchStatsInputSchema,
  AdaptiveDifficultySchema,
  MissionDto,
  CoachSummaryDto,
} from '../coach/schemas.js';
import {
  buildMissionPrompt,
  buildSummaryPrompt,
  buildAdaptiveDifficultyPrompt,
} from '../coach/prompts.js';
import { getFallbackMission } from '../coach/missions.js';

export const coachRouter = Router();

// Health check endpoint
coachRouter.get('/health', async (_req: Request, res: Response) => {
  const ollamaHealth = await ollamaService.checkHealth();
  res.json({
    status: ollamaHealth.available ? 'ok' : 'degraded',
    ollama: ollamaHealth,
    timestamp: Date.now(),
  });
});

// Mission generation endpoint
coachRouter.post('/mission', async (req: Request, res: Response) => {
  try {
    const rawStats = req.body?.stats;
    const statsParse = rawStats ? MatchStatsInputSchema.partial().safeParse(rawStats) : null;
    const stats = statsParse?.success ? statsParse.data : undefined;
    const difficulty = (stats?.difficulty as 'easy' | 'medium' | 'hard') || 'easy';

    // Check Ollama availability
    const health = await ollamaService.checkHealth();
    if (!health.available) {
      console.log('[CoachRoute] Ollama unavailable, returning deterministic fallback mission.');
      return res.json({
        source: 'fallback',
        mission: getFallbackMission(difficulty),
      });
    }

    const prompt = buildMissionPrompt(stats);
    const rawAiResponse = await ollamaService.generateJson<any>(prompt, 9000);

    if (rawAiResponse) {
      // Validate schema
      const parseResult = MissionSchema.safeParse({
        ...rawAiResponse,
        id: `gemma_${Date.now()}`,
        current_value: 0,
        completed: false,
      });

      if (parseResult.success) {
        console.log('[CoachRoute] Gemma 4 generated valid mission:', parseResult.data.mission_title);
        return res.json({
          source: 'gemma4',
          mission: parseResult.data,
        });
      } else {
        console.warn('[CoachRoute] Gemma 4 output failed schema validation:', parseResult.error.flatten());
      }
    }

    // Fallback if parsing failed or timeout occurred
    const fallback = getFallbackMission(difficulty);
    return res.json({
      source: 'fallback',
      mission: fallback,
      note: 'AI generation timed out or schema validation failed',
    });
  } catch (err: any) {
    console.error('[CoachRoute] Error in /mission:', err);
    return res.json({
      source: 'fallback',
      mission: getFallbackMission('easy'),
    });
  }
});

// Post-match summary endpoint
coachRouter.post('/summary', async (req: Request, res: Response) => {
  try {
    const parseStats = MatchStatsInputSchema.safeParse(req.body?.stats);
    if (!parseStats.success) {
      return res.status(400).json({
        error: 'Invalid match stats payload',
        details: parseStats.error.flatten(),
      });
    }

    const stats = parseStats.data;
    const health = await ollamaService.checkHealth();

    if (!health.available) {
      return res.json({
        source: 'fallback',
        summary: generateDeterministicSummary(stats),
      });
    }

    const prompt = buildSummaryPrompt(stats);
    const rawAiResponse = await ollamaService.generateJson<any>(prompt, 10000);

    if (rawAiResponse) {
      const parseResult = CoachSummarySchema.safeParse(rawAiResponse);
      if (parseResult.success) {
        return res.json({
          source: 'gemma4',
          summary: parseResult.data,
        });
      } else {
        console.warn('[CoachRoute] Gemma 4 summary validation failed:', parseResult.error.flatten());
      }
    }

    return res.json({
      source: 'fallback',
      summary: generateDeterministicSummary(stats),
    });
  } catch (err: any) {
    console.error('[CoachRoute] Error in /summary:', err);
    const stats = req.body?.stats;
    return res.json({
      source: 'fallback',
      summary: generateDeterministicSummary(stats || {
        playerScore: 0,
        opponentScore: 0,
        totalReturns: 0,
        successfulReturns: 0,
        returnSuccessRate: 0,
        longestRally: 0,
        totalRallies: 0,
        averageRallyLength: 0,
        medianRallyLength: 0,
        averageReactionTimeMs: 0,
        reactionTimeSamples: [],
        tableZoneDistribution: { left: 0, center: 0, right: 0, deep: 0, short: 0 },
        trackingStabilityPercentage: 100,
        missionsCompleted: 0,
        difficulty: 'easy',
      }),
    });
  }
});

// Adaptive difficulty suggestion
coachRouter.post('/adaptive-difficulty', async (req: Request, res: Response) => {
  try {
    const parseStats = MatchStatsInputSchema.safeParse(req.body?.stats);
    if (!parseStats.success) {
      return res.status(400).json({ error: 'Invalid match stats' });
    }
    const stats = parseStats.data;
    const health = await ollamaService.checkHealth();

    if (health.available) {
      const prompt = buildAdaptiveDifficultyPrompt(stats);
      const raw = await ollamaService.generateJson<any>(prompt, 7000);
      const parsed = raw ? AdaptiveDifficultySchema.safeParse(raw) : null;
      if (parsed?.success) {
        return res.json({ source: 'gemma4', ...parsed.data });
      }
    }

    // Deterministic rule-based adjustment
    let suggested = stats.difficulty;
    let mult = 1.0;
    let reason = 'Balanced performance matches current tier.';

    if (stats.returnSuccessRate > 75 && stats.playerScore > stats.opponentScore) {
      suggested = stats.difficulty === 'easy' ? 'medium' : 'hard';
      mult = 1.15;
      reason = 'High return accuracy and match victory indicates readiness for elevated challenge.';
    } else if (stats.returnSuccessRate < 40 && stats.opponentScore > stats.playerScore + 2) {
      suggested = stats.difficulty === 'hard' ? 'medium' : 'easy';
      mult = 0.85;
      reason = 'Low return rate; lowering opponent velocity to reinforce core consistency.';
    }

    return res.json({
      source: 'deterministic_rules',
      suggested_difficulty: suggested,
      reason,
      paddle_speed_multiplier: mult,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

function generateDeterministicSummary(stats: any): CoachSummaryDto {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (stats.returnSuccessRate >= 65) {
    strengths.push(`Solid return consistency at ${stats.returnSuccessRate.toFixed(1)}%`);
  } else {
    weaknesses.push(`Return accuracy dipped to ${stats.returnSuccessRate.toFixed(1)}%`);
  }

  if (stats.longestRally >= 5) {
    strengths.push(`Excellent patience in sustaining a ${stats.longestRally}-shot rally`);
  } else {
    weaknesses.push(`Rallies ended prematurely; peak rally was ${stats.longestRally} returns`);
  }

  if (stats.averageReactionTimeMs > 0 && stats.averageReactionTimeMs < 350) {
    strengths.push(`Sharp reaction time averaging ${Math.round(stats.averageReactionTimeMs)}ms`);
  } else if (stats.averageReactionTimeMs > 500) {
    weaknesses.push(`Reaction window was slightly delayed (${Math.round(stats.averageReactionTimeMs)}ms average)`);
  }

  if (strengths.length === 0) {
    strengths.push('Committed effort maintaining paddle coverage across the baseline');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Edge table placement can be pushed for deeper offensive shots');
  }

  const difficulty = (stats.difficulty as 'easy' | 'medium' | 'hard') || 'easy';

  return {
    strengths,
    weaknesses,
    recommended_mission: getFallbackMission(difficulty),
    tactical_advice:
      stats.returnSuccessRate >= 50
        ? 'Great form! Work on quick hand resets to prepare for fast cross-court returns.'
        : 'Keep your hand within the calibrated center zone and make compact forward pushing strokes.',
    encouragement: 'Every rally sharpens your reflexes. Step back to the table and keep competing!',
    suggested_difficulty: difficulty,
  };
}
