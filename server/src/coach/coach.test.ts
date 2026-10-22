import test from 'node:test';
import assert from 'node:assert';
import { MissionSchema, CoachSummarySchema, MatchStatsInputSchema } from './schemas.js';
import { getFallbackMission, FALLBACK_MISSIONS } from './missions.js';
import { buildMissionPrompt, buildSummaryPrompt } from './prompts.js';

test('MissionSchema validates valid mission structure', () => {
  const valid = {
    id: 'test_1',
    mission_title: 'Build a longer rally',
    mission_description: 'Return five balls in a row.',
    mission_type: 'consecutive_returns',
    target_value: 5,
    current_value: 0,
    difficulty: 'easy',
    coach_tip: 'Keep your hand inside the central tracking area.',
    reason: 'Your recent returns were inconsistent near the edges.',
    completed: false,
  };

  const parsed = MissionSchema.safeParse(valid);
  assert.strictEqual(parsed.success, true);
});

test('MissionSchema rejects invalid target value out of bounds', () => {
  const invalid = {
    id: 'test_2',
    mission_title: 'Too many returns',
    mission_description: 'Return 9999 balls.',
    mission_type: 'consecutive_returns',
    target_value: 9999, // Max is 50
    current_value: 0,
    difficulty: 'easy',
    coach_tip: 'Good luck.',
    reason: 'Testing boundary.',
    completed: false,
  };

  const parsed = MissionSchema.safeParse(invalid);
  assert.strictEqual(parsed.success, false);
});

test('Fallback missions provide valid missions for each difficulty', () => {
  for (const diff of ['easy', 'medium', 'hard'] as const) {
    const mission = getFallbackMission(diff);
    assert.strictEqual(mission.difficulty, diff);
    assert.ok(mission.target_value > 0);
    const parsed = MissionSchema.safeParse(mission);
    assert.strictEqual(parsed.success, true);
  }
});

test('Prompt builder includes actual stats', () => {
  const prompt = buildMissionPrompt({
    returnSuccessRate: 85,
    totalReturns: 14,
    longestRally: 6,
    difficulty: 'medium',
  });

  assert.ok(prompt.includes('85%'));
  assert.ok(prompt.includes('14'));
  assert.ok(prompt.includes('medium'));
  assert.ok(prompt.includes('RULES:'));
});
