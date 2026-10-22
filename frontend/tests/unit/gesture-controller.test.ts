import test from 'node:test';
import assert from 'node:assert/strict';
import { GestureController } from '../../src/features/gesture/gesture-controller';
import { generateScenarioFrames, generateSyntheticHand } from '../../src/features/gesture/simulated-landmarks';

test('GestureController smoke test: follows simulated landmark movement without NaN or Infinity', () => {
  const controller = new GestureController();
  const centerFrames = generateScenarioFrames('CENTER_HOLD', 10);

  for (const frame of centerFrames) {
    const state = controller.processFrame(frame.landmarks, frame.timestampMs);
    assert.equal(state.tracking, true);
    assert.equal(state.status, 'TRACKING');
    assert.ok(Number.isFinite(state.coordinates.x));
    assert.ok(Number.isFinite(state.coordinates.y));
    assert.ok(Number.isFinite(state.smoothedCoordinates.x));
    assert.ok(Number.isFinite(state.smoothedCoordinates.y));
  }
});

test('GestureController: left sweep moves coordinate toward negative X, right sweep toward positive X', () => {
  const controller = new GestureController();

  // Left sweep: in camera frame rawX increases toward 0.85, which mirrors to negative X in game space
  const leftFrames = generateScenarioFrames('LEFT_SWEEP', 20);
  let finalLeftState: any;
  for (const f of leftFrames) {
    finalLeftState = controller.processFrame(f.landmarks, f.timestampMs);
  }
  assert.ok(finalLeftState.coordinates.x < -0.4, `Expected left coordinate < -0.4, got ${finalLeftState.coordinates.x}`);

  controller.reset();

  // Right sweep: in camera frame rawX decreases toward 0.15, which mirrors to positive X in game space
  const rightFrames = generateScenarioFrames('RIGHT_SWEEP', 20);
  let finalRightState: any;
  for (const f of rightFrames) {
    finalRightState = controller.processFrame(f.landmarks, f.timestampMs);
  }
  assert.ok(finalRightState.coordinates.x > 0.4, `Expected right coordinate > 0.4, got ${finalRightState.coordinates.x}`);
});

test('GestureController tracking loss: holds last coordinate safely without jump', () => {
  const controller = new GestureController();
  let time = 1000;

  // Position hand at specific coordinate
  const hand = generateSyntheticHand({ x: 0.3, y: 0.4 });
  const activeState = controller.processFrame(hand, time);
  const heldX = activeState.smoothedCoordinates.x;
  const heldY = activeState.smoothedCoordinates.y;

  // Feed multiple null (missing hand) frames
  for (let i = 0; i < 10; i++) {
    time += 16.6;
    const lostState = controller.processFrame(null, time);
    assert.equal(lostState.tracking, false);
    assert.equal(lostState.status, 'LOST');
    // Coordinates should stay at held position without wild jumping to 0 or arbitrary coordinates
    assert.equal(lostState.smoothedCoordinates.x, heldX);
    assert.equal(lostState.smoothedCoordinates.y, heldY);
  }

  // Recovery: hand returns
  time += 16.6;
  const recoveredHand = generateSyntheticHand({ x: 0.35, y: 0.4 });
  const recoveredState = controller.processFrame(recoveredHand, time);
  assert.equal(recoveredState.tracking, true);
  assert.equal(recoveredState.status, 'TRACKING');
});
