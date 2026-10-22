import test from 'node:test';
import assert from 'node:assert';
import { app, server } from '../index.js';
import { MissionSchema, CoachSummarySchema } from './schemas.js';

test('Server health and coach endpoints respond correctly', async () => {
  // Wait for server to bind or use existing listening address
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 3001;
  const baseUrl = `http://localhost:${port}`;

  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthData = (await healthRes.json()) as any;
  assert.strictEqual(healthData.status, 'ok');

  // 2. Coach health check
  const coachHealthRes = await fetch(`${baseUrl}/api/coach/health`);
  assert.strictEqual(coachHealthRes.status, 200);
  const coachHealthData = (await coachHealthRes.json()) as any;
  assert.ok('ai' in coachHealthData || 'ollama' in coachHealthData);

  // 3. Mission generation test (with actual Ollama gemma4:e2b or fallback)
  const missionRes = await fetch(`${baseUrl}/api/coach/mission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stats: {
        returnSuccessRate: 70,
        totalReturns: 12,
        longestRally: 5,
        difficulty: 'medium',
      },
    }),
  });
  assert.strictEqual(missionRes.status, 200);
  const missionData = (await missionRes.json()) as any;
  assert.ok('mission' in missionData);
  const parsedMission = MissionSchema.safeParse(missionData.mission);
  assert.strictEqual(parsedMission.success, true, 'Mission must conform to schema');

  // 4. Summary test
  const summaryRes = await fetch(`${baseUrl}/api/coach/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stats: {
        matchId: 'm_test_1',
        startTime: Date.now() - 30000,
        playerScore: 7,
        opponentScore: 4,
        totalReturns: 18,
        successfulReturns: 14,
        returnSuccessRate: 77.8,
        longestRally: 6,
        totalRallies: 11,
        averageRallyLength: 1.6,
        medianRallyLength: 2,
        averageReactionTimeMs: 320,
        reactionTimeSamples: [310, 330],
        tableZoneDistribution: { left: 4, center: 6, right: 4, deep: 8, short: 6 },
        trackingStabilityPercentage: 98,
        missionsCompleted: 1,
        difficulty: 'medium',
      },
    }),
  });
  assert.strictEqual(summaryRes.status, 200);
  const summaryData = (await summaryRes.json()) as any;
  console.log('Received summaryData:', JSON.stringify(summaryData, null, 2));
  assert.ok('summary' in summaryData);
  const parsedSummary = CoachSummarySchema.safeParse(summaryData.summary);
  if (!parsedSummary.success) {
    console.error('CoachSummary validation error:', JSON.stringify(parsedSummary.error, null, 2));
  }
  assert.strictEqual(parsedSummary.success, true, 'Summary must conform to schema');

  // Cleanly close server
  server.close();
});
