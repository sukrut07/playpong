import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aiProviderManager } from './providerManager.js';
import { MatchStats } from '../../../shared/types.js';

test('AI Provider Manager: initializes with default provider and returns health structure', async () => {
  const health = await aiProviderManager.getHealth();
  assert.ok(health);
  assert.ok(health.provider === 'gemini' || health.provider === 'ollama');
  assert.ok(health.model);
});

test('AI Provider Manager: generates deterministic fallback report when keys are missing or offline', async () => {
  const mockStats: MatchStats = {
    matchId: 'test_match_001',
    startTime: Date.now() - 60000,
    endTime: Date.now(),
    ruleProfile: 'TABLE_TENNIS_TRAINING',
    playerScore: 11,
    opponentScore: 8,
    totalReturns: 24,
    successfulReturns: 18,
    missedReturns: 6,
    eligibleReturnAttempts: 24,
    returnSuccessRate: 75.0,
    missRate: 25.0,
    longestRally: 7,
    totalRallies: 19,
    averageRallyLength: 1.3,
    medianRallyLength: 1.0,
    averageReactionTimeMs: 240,
    reactionTimeSamples: [220, 250, 240],
    tableZoneDistribution: { left: 4, center: 10, right: 4, deep: 6, short: 12 },
    trackingStabilityPercentage: 96.0,
    trackingAvailabilityPercentage: 96.0,
    missionsCompleted: 1,
    difficulty: 'medium',
    controllerMode: 'gesture',
  };

  const report = await aiProviderManager.generateReport(mockStats);

  assert.ok(report.summary.length > 10, 'Report must contain executive summary');
  assert.ok(report.observations.length >= 1, 'Report must contain observations');
  assert.ok(report.evidence.length >= 1, 'Report must contain empirical evidence');
  assert.ok(report.weaknesses.length >= 1, 'Report must distinguish weaknesses as hypotheses');
  assert.ok(report.recommendations.length >= 1, 'Report must provide actionable recommendations');
  assert.ok(report.training_plan.length >= 1, 'Report must include training drill plan');
  assert.ok(report.rule_references.length >= 1, 'Report must link to official rules');
  assert.ok(report.limitations.length >= 1, 'Report must honestly state limitations');
});

test('AI Provider Manager: switches between gemini and ollama gracefully', () => {
  aiProviderManager.setProvider('ollama');
  assert.equal(aiProviderManager.getActiveProvider().name, 'ollama');

  aiProviderManager.setProvider('gemini');
  assert.equal(aiProviderManager.getActiveProvider().name, 'gemini');
});
