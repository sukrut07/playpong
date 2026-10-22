// =====================================================================
// PONG AI — Zod Schemas for Structured Coaching Output
// =====================================================================

import { z } from 'zod';

export const CoachingObservationSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(5).max(300),
  metricName: z.string().optional(),
  metricValue: z.union([z.string(), z.number()]).optional(),
});

export const CoachingEvidenceSchema = z.object({
  metric: z.string().min(2).max(80),
  observedValue: z.union([z.string(), z.number()]),
  expectedBenchmark: z.string().min(2).max(120),
  significance: z.string().min(5).max(250),
});

export const CoachingWeaknessSchema = z.object({
  issue: z.string().min(3).max(120),
  likelyCause: z.string().min(5).max(250),
  isHypothesis: z.boolean(),
});

export const TrainingPlanDrillSchema = z.object({
  drillTitle: z.string().min(3).max(80),
  targetMetric: z.string().min(2).max(60),
  targetGoal: z.string().min(2).max(100),
  instructions: z.string().min(10).max(300),
});

export const RuleReferenceLinkSchema = z.object({
  ruleId: z.string().min(2).max(40),
  title: z.string().min(2).max(100),
  citation: z.string().min(2).max(100),
  explanation: z.string().min(5).max(300),
  sourceUrl: z.string().optional(),
});

export const CoachingReportSchema = z.object({
  summary: z.string().min(10).max(600),
  observations: z.array(CoachingObservationSchema).min(1).max(6),
  evidence: z.array(CoachingEvidenceSchema).min(1).max(6),
  weaknesses: z.array(CoachingWeaknessSchema).min(1).max(5),
  recommendations: z.array(z.string().min(5).max(250)).min(1).max(6),
  training_plan: z.array(TrainingPlanDrillSchema).min(1).max(5),
  next_match_objective: z.string().min(5).max(150),
  rule_references: z.array(RuleReferenceLinkSchema).min(1).max(5),
  limitations: z.array(z.string().min(5).max(250)).min(1).max(5),
});

export type ValidatedCoachingReport = z.infer<typeof CoachingReportSchema>;
