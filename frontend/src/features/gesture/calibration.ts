/**
 * PONG AI — Gesture Calibration Manager
 * Persists and validates webcam tracking range bounds in browser localStorage.
 */

import { CalibrationBounds, DEFAULT_CALIBRATION } from './landmark-types';

const STORAGE_KEY = 'pong_ai_gesture_calibration_v2';

export { DEFAULT_CALIBRATION };

export function isValidCalibration(data: CalibrationBounds): boolean {
  if (!data) return false;
  const xSpan = data.maxX - data.minX;
  const ySpan = data.maxY - data.minY;

  return (
    xSpan >= 0.20 &&
    ySpan >= 0.15 &&
    data.minX >= 0 &&
    data.maxX <= 1 &&
    data.minY >= 0 &&
    data.maxY <= 1 &&
    data.minX < data.maxX &&
    data.minY < data.maxY &&
    data.centerX >= data.minX &&
    data.centerX <= data.maxX &&
    data.centerY >= data.minY &&
    data.centerY <= data.maxY
  );
}

export function loadCalibration(): CalibrationBounds {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidCalibration(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[Calibration] Failed to load calibration from localStorage:', err);
  }
  return { ...DEFAULT_CALIBRATION };
}

export function saveCalibration(data: CalibrationBounds): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (isValidCalibration(data)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }
  } catch (err) {
    console.warn('[Calibration] Failed to save calibration to localStorage:', err);
  }
}

export function resetCalibration(): CalibrationBounds {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[Calibration] Failed to reset calibration:', err);
  }
  return { ...DEFAULT_CALIBRATION };
}
