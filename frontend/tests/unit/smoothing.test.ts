import test from 'node:test';
import assert from 'node:assert/strict';
import { OneEuroFilter, Point2DSmoother, LowPassFilter } from '../../src/features/gesture/smoothing';

test('LowPassFilter exponentially dampens values', () => {
  const lpf = new LowPassFilter(0.5);
  const first = lpf.filter(10);
  assert.equal(first, 10);

  const second = lpf.filter(20);
  assert.equal(second, 15); // 0.5 * 20 + 0.5 * 10
});

test('OneEuroFilter reduces jitter at low speeds', () => {
  const filter = new OneEuroFilter(1.0, 0.05);
  let time = 1000;
  
  // Initialize
  filter.filter(0.0, time);

  // Feed small tremor noise around 0.0
  const noiseValues = [0.03, -0.02, 0.04, -0.03, 0.02, -0.01];
  const smoothedDeltas: number[] = [];

  for (const n of noiseValues) {
    time += 16.6;
    const out = filter.filter(n, time);
    smoothedDeltas.push(Math.abs(out));
  }

  // Filtered amplitude should be significantly lower than raw noise spikes
  const maxSmoothed = Math.max(...smoothedDeltas);
  assert.ok(maxSmoothed < 0.04, `Expected dampening under 0.04, got ${maxSmoothed}`);
});

test('OneEuroFilter adapts with minimal lag during rapid transitions', () => {
  const filter = new OneEuroFilter(1.0, 0.05);
  let time = 1000;
  const val1 = filter.filter(0.0, time);
  assert.equal(val1, 0.0);

  // Slow motion
  time += 16.6;
  const val2 = filter.filter(0.1, time);
  assert.ok(val2 < 0.1, 'Slow motion should be dampened');

  // Fast swing motion: accelerates with higher alpha
  time += 16.6;
  const val3 = filter.filter(1.5, time);
  assert.ok(val3 > val2, 'Fast motion should accelerate response');
});

test('Point2DSmoother resets cleanly', () => {
  const smoother = new Point2DSmoother();
  smoother.smooth(0.5, 0.5, 1000);
  smoother.smooth(0.9, 0.8, 1016);
  smoother.reset();

  // Next sample after reset should initialize without stale history
  const fresh = smoother.smooth(0.1, 0.2, 2000);
  assert.equal(fresh.x, 0.1);
  assert.equal(fresh.y, 0.2);
});
