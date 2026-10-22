import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidCalibration, DEFAULT_CALIBRATION } from '../../src/features/gesture/calibration';
import { CalibrationBounds } from '../../src/features/gesture/landmark-types';

test('isValidCalibration identifies valid bounds', () => {
  assert.equal(isValidCalibration(DEFAULT_CALIBRATION), true);

  const customValid: CalibrationBounds = {
    minX: 0.1,
    maxX: 0.9,
    minY: 0.1,
    maxY: 0.8,
    centerX: 0.5,
    centerY: 0.45,
    isCalibrated: true,
  };
  assert.equal(isValidCalibration(customValid), true);
});

test('isValidCalibration rejects inverted or collapsed spans', () => {
  // Inverted min/max
  const invertedX: CalibrationBounds = {
    minX: 0.8,
    maxX: 0.2,
    minY: 0.2,
    maxY: 0.8,
    centerX: 0.5,
    centerY: 0.5,
    isCalibrated: true,
  };
  assert.equal(isValidCalibration(invertedX), false);

  // Too narrow span (< 0.20)
  const narrowSpan: CalibrationBounds = {
    minX: 0.45,
    maxX: 0.55,
    minY: 0.2,
    maxY: 0.8,
    centerX: 0.5,
    centerY: 0.5,
    isCalibrated: true,
  };
  assert.equal(isValidCalibration(narrowSpan), false);
});

test('isValidCalibration validates center point is within bounds', () => {
  const centerOutOfBounds: CalibrationBounds = {
    minX: 0.2,
    maxX: 0.8,
    minY: 0.2,
    maxY: 0.8,
    centerX: 0.9, // outside minX..maxX
    centerY: 0.5,
    isCalibrated: true,
  };
  assert.equal(isValidCalibration(centerOutOfBounds), false);
});
