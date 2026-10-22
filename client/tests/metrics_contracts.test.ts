import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateReturnSuccessRate,
  calculateMissRate,
  calculateAverageRallyLength,
  calculateMedianRallyLength,
  calculateAverageReactionTime,
  computeAuditedMetrics,
} from '../../shared/metrics.js';

test('Metric Contract: Zero denominator yields null, never 0%', () => {
  const successRate = calculateReturnSuccessRate(0, 0);
  assert.equal(successRate, null, '0 attempts must return null, not 0%');

  const missRate = calculateMissRate(0, 0);
  assert.equal(missRate, null, '0 attempts must return null, not 0%');

  const avgRally = calculateAverageRallyLength(0, 0);
  assert.equal(avgRally, null, '0 completed rallies must return null');

  const medianRally = calculateMedianRallyLength([]);
  assert.equal(medianRally, null, 'Empty rally list must return null');

  const avgReaction = calculateAverageReactionTime([]);
  assert.equal(avgReaction, null, 'Empty reaction times must return null');
});

test('Metric Contract: Invariant returnSuccessRate + missRate === 100%', () => {
  const attempts = 25;
  const successes = 18;
  const misses = 7;

  const successRate = calculateReturnSuccessRate(successes, attempts);
  const missRate = calculateMissRate(misses, attempts);

  assert.ok(successRate !== null);
  assert.ok(missRate !== null);
  assert.equal(Math.round(successRate + missRate), 100);
});

test('Metric Contract: computeAuditedMetrics aggregates full match telemetry cleanly', () => {
  const input = {
    successfulReturns: 28,
    missedReturns: 12,
    totalContacts: 64,
    completedRallies: 15,
    rallyLengths: [2, 4, 1, 6, 8, 3, 5, 2, 9, 3, 4, 5, 6, 2, 4],
    reactionTimesMs: [240, 260, 210, 310, 190, 220],
    validTrackingFrames: 950,
    totalCameraFrames: 1000,
  };

  const output = computeAuditedMetrics(input);

  assert.equal(output.eligibleReturnAttempts, 40);
  assert.equal(output.returnSuccessRate, 70.0);
  assert.equal(output.missRate, 30.0);
  assert.equal(output.averageRallyLength, 4.3);
  assert.equal(output.longestRally, 9);
  assert.equal(output.trackingAvailabilityPercentage, 95.0);
  assert.ok(output.averageReactionTimeMs !== null && output.averageReactionTimeMs > 0);
});
