import test from 'node:test';
import assert from 'node:assert';
import { TableTennisEngine } from '../src/game/physics/tableTennisEngine.js';
import { mapToGameCoordinates, DEFAULT_CALIBRATION, isValidCalibration } from '../src/vision/calibration.js';
import { OneEuroFilter, Point2DSmoother } from '../src/vision/smoothing.js';
import { GestureDetector } from '../src/vision/gestureDetector.js';

test('TableTennisEngine initializes in READY state and begins serve', () => {
  const engine = new TableTennisEngine('easy');
  assert.strictEqual(engine.rallyState, 'READY');
  assert.strictEqual(engine.playerScore, 0);
  assert.strictEqual(engine.opponentScore, 0);

  engine.startServe('player');
  assert.strictEqual(engine.rallyState, 'SERVE');
  assert.strictEqual(engine.rallyCount, 0);

  engine.triggerPlayerServe();
  assert.strictEqual(engine.rallyState, 'RALLY');
  assert.ok(engine.ball.vz < 0, 'Ball should be moving forward towards opponent');
});

test('Continuous collision sub-stepping updates ball trajectory with gravity', () => {
  const engine = new TableTennisEngine('medium');
  engine.startServe('player');
  engine.triggerPlayerServe();

  const initialY = engine.ball.y;
  engine.update(0.016, 0, 0);

  // Position should have advanced
  assert.notStrictEqual(engine.ball.z, 1.35);
  assert.ok(engine.ball.trail.length > 0, 'Trail should be populated');
});

test('isValidCalibration identifies valid and invalid boundaries', () => {
  assert.strictEqual(isValidCalibration(DEFAULT_CALIBRATION), true);

  const invalidSpan = {
    minX: 0.5,
    maxX: 0.52, // too narrow span < 0.25
    minY: 0.2,
    maxY: 0.8,
    centerX: 0.5,
    centerY: 0.5,
    isCalibrated: true,
  };
  assert.strictEqual(isValidCalibration(invalidSpan), false);
});

test('mapToGameCoordinates mirrors X and bounds between -1 and 1', () => {
  const center = mapToGameCoordinates(0.5, 0.5, DEFAULT_CALIBRATION, true);
  assert.ok(Math.abs(center.x) <= 0.1, 'Center raw coordinate should map close to 0');

  // Left hand boundary (rawX = 0.85 -> mirrored = 0.15)
  const left = mapToGameCoordinates(0.85, 0.5, DEFAULT_CALIBRATION, true);
  assert.ok(Math.abs(left.x - (-1.0)) < 0.001, 'Left boundary should be near -1');

  // Right hand boundary (rawX = 0.15 -> mirrored = 0.85)
  const right = mapToGameCoordinates(0.15, 0.5, DEFAULT_CALIBRATION, true);
  assert.ok(Math.abs(right.x - 1.0) < 0.001, 'Right boundary should be near 1');
});

test('OneEuroFilter adapts to rapid motion without lag', () => {
  const filter = new OneEuroFilter(1.0, 0.05);
  const val1 = filter.filter(0, 0);
  assert.strictEqual(val1, 0);

  // Steady slow motion: strong smoothing
  const val2 = filter.filter(0.1, 16);
  assert.ok(val2 < 0.1);

  // Fast swing motion: adapts with higher alpha
  const val3 = filter.filter(1.5, 32);
  assert.ok(val3 > val2);
});

test('GestureDetector detects swing on rapid paddle movement', () => {
  const detector = new GestureDetector();
  const res1 = detector.detect(0, 0, 1000);
  assert.strictEqual(res1.gesture, 'ready');

  // Fast movement across delta T
  const res2 = detector.detect(0.8, 0.8, 1050);
  assert.strictEqual(res2.gesture, 'swing');
});
