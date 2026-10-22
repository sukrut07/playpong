import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPalmAnchor, mapCameraToGameCoordinates } from '../../src/features/gesture/coordinate-mapper';
import { DEFAULT_CALIBRATION } from '../../src/features/gesture/landmark-types';
import { generateSyntheticHand } from '../../src/features/gesture/simulated-landmarks';

test('extractPalmAnchor calculates midpoint of wrist and middle knuckle', () => {
  const landmarks = generateSyntheticHand({ x: 0.5, y: 0.4 });
  const anchor = extractPalmAnchor(landmarks);

  assert.ok(anchor !== null, 'Anchor should not be null');
  assert.ok(typeof anchor.x === 'number' && Number.isFinite(anchor.x));
  assert.ok(typeof anchor.y === 'number' && Number.isFinite(anchor.y));
  assert.ok(Math.abs(anchor.x - 0.5) < 0.1, 'Anchor X should be near hand center');
});

test('extractPalmAnchor returns null on missing or empty landmarks', () => {
  assert.equal(extractPalmAnchor([]), null);
  assert.equal(extractPalmAnchor(null as any), null);
});

test('mapCameraToGameCoordinates mirrors X and clamps within [-1, 1]', () => {
  // Center camera position (0.5, 0.5) maps near game center (0, 0)
  const centerCoord = mapCameraToGameCoordinates(0.5, 0.5, DEFAULT_CALIBRATION, true);
  assert.ok(Math.abs(centerCoord.x) < 0.1, `Expected center X near 0, got ${centerCoord.x}`);
  assert.ok(Math.abs(centerCoord.y) < 0.1, `Expected center Y near 0, got ${centerCoord.y}`);

  // Right in camera frame (0.8) with mirroring should map to negative (left on screen)
  const leftCoord = mapCameraToGameCoordinates(0.85, 0.5, DEFAULT_CALIBRATION, true);
  assert.ok(leftCoord.x <= -0.9, `Expected left bound <= -0.9, got ${leftCoord.x}`);

  // Left in camera frame (0.15) with mirroring should map to positive (right on screen)
  const rightCoord = mapCameraToGameCoordinates(0.15, 0.5, DEFAULT_CALIBRATION, true);
  assert.ok(rightCoord.x >= 0.9, `Expected right bound >= 0.9, got ${rightCoord.x}`);
});

test('mapCameraToGameCoordinates defends against NaN, Infinity, and out-of-range bounds', () => {
  const nanResult = mapCameraToGameCoordinates(NaN, Infinity, DEFAULT_CALIBRATION, true);
  assert.ok(Number.isFinite(nanResult.x), 'Result X must be finite');
  assert.ok(Number.isFinite(nanResult.y), 'Result Y must be finite');
  assert.ok(nanResult.x >= -1.0 && nanResult.x <= 1.0);
  assert.ok(nanResult.y >= -1.0 && nanResult.y <= 1.0);

  // Extreme coordinates clamped
  const extremeResult = mapCameraToGameCoordinates(999, -500, DEFAULT_CALIBRATION, true);
  assert.ok(extremeResult.x >= -1.0 && extremeResult.x <= 1.0);
  assert.ok(extremeResult.y >= -1.0 && extremeResult.y <= 1.0);
});
