import { CalibrationData } from '../../../shared/types';
export type { CalibrationData };

const STORAGE_KEY = 'gesture_pong_calibration_v1';

export const DEFAULT_CALIBRATION: CalibrationData = {
  minX: 0.15,
  maxX: 0.85,
  minY: 0.20,
  maxY: 0.80,
  centerX: 0.50,
  centerY: 0.50,
  isCalibrated: false,
};

export function loadCalibration(): CalibrationData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidCalibration(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load calibration from localStorage', e);
  }
  return { ...DEFAULT_CALIBRATION };
}

export function saveCalibration(data: CalibrationData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save calibration to localStorage', e);
  }
}

export function isValidCalibration(data: CalibrationData): boolean {
  if (!data) return false;
  const xSpan = data.maxX - data.minX;
  const ySpan = data.maxY - data.minY;
  // Span must be at least 0.25 and bounds within [0, 1]
  return (
    xSpan >= 0.25 &&
    ySpan >= 0.20 &&
    data.minX >= 0 &&
    data.maxX <= 1 &&
    data.minY >= 0 &&
    data.maxY <= 1 &&
    data.minX < data.maxX &&
    data.minY < data.maxY
  );
}

/**
 * Maps raw camera landmark (normalized 0 to 1) into [-1, 1] game paddle coordinates.
 * Handles mirroring consistently so moving your physical hand right moves the on-screen paddle right.
 */
export function mapToGameCoordinates(
  rawX: number,
  rawY: number,
  calib: CalibrationData,
  mirror: boolean = true
): { x: number; y: number } {
  // Mirror rawX so physical right = screen right
  const effectiveX = mirror ? 1.0 - rawX : rawX;

  // Clamped linear interpolation within calibration window
  const normX = (effectiveX - calib.minX) / Math.max(0.01, calib.maxX - calib.minX);
  // Y in vision is 0 at top, 1 at bottom; in game 3D Y is up, so invert
  const normY = (rawY - calib.minY) / Math.max(0.01, calib.maxY - calib.minY);

  // Map to [-1, 1]
  const gameX = Math.max(-1.0, Math.min(1.0, (normX - 0.5) * 2.0));
  const gameY = Math.max(-1.0, Math.min(1.0, -(normY - 0.5) * 2.0));

  return { x: gameX, y: gameY };
}
