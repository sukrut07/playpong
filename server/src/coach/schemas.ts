import { z } from 'zod';

export const GameDifficultySchema = z.enum(['easy', 'medium', 'hard']);

export const MissionTypeSchema = z.enum([
  'consecutive_returns',
  'total_returns',
  'win_match',
  'rally_length',
  'perfect_placement',
]);

export const MissionSchema = z.object({
  id: z.string().default(() => `m_${Date.now()}`),
  mission_title: z.string().min(3).max(60),
  mission_description: z.string().min(5).max(150),
  mission_type: MissionTypeSchema,
  target_value: z.number().int().min(1).max(50),
  current_value: z.number().default(0),
  difficulty: GameDifficultySchema,
  coach_tip: z.string().min(5).max(180),
  reason: z.string().min(5).max(180),
  completed: z.boolean().default(false),
});

export const MatchStatsInputSchema = z.object({
  matchId: z.string(),
  startTime: z.number(),
  endTime: z.number().optional(),
  playerScore: z.number().int().nonnegative(),
  opponentScore: z.number().int().nonnegative(),
  totalReturns: z.number().int().nonnegative(),
  successfulReturns: z.number().int().nonnegative(),
  returnSuccessRate: z.number().min(0).max(100),
  longestRally: z.number().int().nonnegative(),
  totalRallies: z.number().int().nonnegative(),
  averageRallyLength: z.number().nonnegative(),
  medianRallyLength: z.number().nonnegative(),
  averageReactionTimeMs: z.number().nonnegative(),
  reactionTimeSamples: z.array(z.number()),
  tableZoneDistribution: z.object({
    left: z.number().nonnegative(),
    center: z.number().nonnegative(),
    right: z.number().nonnegative(),
    deep: z.number().nonnegative(),
    short: z.number().nonnegative(),
  }),
  trackingStabilityPercentage: z.number().min(0).max(100),
  missionsCompleted: z.number().int().nonnegative(),
  difficulty: GameDifficultySchema,
});

export const CoachSummarySchema = z.object({
  strengths: z.array(z.string().min(3).max(120)).min(1).max(4),
  weaknesses: z.array(z.string().min(3).max(120)).min(1).max(4),
  recommended_mission: MissionSchema,
  tactical_advice: z.string().min(10).max(250),
  encouragement: z.string().min(5).max(150),
  suggested_difficulty: GameDifficultySchema,
});

export const AdaptiveDifficultySchema = z.object({
  suggested_difficulty: GameDifficultySchema,
  reason: z.string().min(5).max(200),
  paddle_speed_multiplier: z.number().min(0.7).max(1.5),
});

export type MissionDto = z.infer<typeof MissionSchema>;
export type CoachSummaryDto = z.infer<typeof CoachSummarySchema>;
export type MatchStatsInputDto = z.infer<typeof MatchStatsInputSchema>;
