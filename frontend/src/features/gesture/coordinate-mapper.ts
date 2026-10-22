/**
 * PONG AI — Coordinate Mapper
 * Translates raw MediaPipe camera landmarks (normalized [0, 1])
 * into game engine coordinate space (clamped [-1.0, 1.0]).
 */

import { CalibrationBounds, HandLandmarks, LANDMARK_INDEX, NormalizedCoordinates } from './landmark-types';

/**
 * Extracts a stable palm anchor point from 21 MediaPipe hand landmarks.
 * Uses midpoint between wrist (0) and middle finger MCP (9) to minimize finger jitter.
 */
export function extractPalmAnchor(landmarks: HandLandmarks): { x: number; y: number } | null {
  if (!landmarks || landmarks.length < 10) {
    return null;
  }
  const wrist = landmarks[LANDMARK_INDEX.WRIST];
  const middleMcp = landmarks[LANDMARK_INDEX.MIDDLE_FINGER_MCP];

  if (!isValidNumber(wrist.x) || !isValidNumber(wrist.y) || !isValidNumber(middleMcp.x) || !isValidNumber(middleMcp.y)) {
    return null;
  }

  return {
    x: (wrist.x + middleMcp.x) * 0.5,
    y: (wrist.y + middleMcp.y) * 0.5,
  };
}

/**
 * Maps raw camera coordinate [0, 1] through user calibration window to game coordinate [-1, 1].
 *
 * @param rawX Normalized camera X (0 to 1, left to right from camera perspective)
 * @param rawY Normalized camera Y (0 to 1, top to bottom)
 * @param calibration User-calibrated active window
 * @param mirror If true, mirrors X so physical right = on-screen right
 */
export function mapCameraToGameCoordinates(
  rawX: number,
  rawY: number,
  calibration: CalibrationBounds,
  mirror: boolean = true
): NormalizedCoordinates {
  // Sanitize non-finite inputs
  const safeRawX = isValidNumber(rawX) ? Math.max(0, Math.min(1, rawX)) : 0.5;
  const safeRawY = isValidNumber(rawY) ? Math.max(0, Math.min(1, rawY)) : 0.5;

  // Mirror X so natural physical hand movement matches visual paddle movement
  const effectiveX = mirror ? 1.0 - safeRawX : safeRawX;

  // Compute span with protection against division by zero
  const xSpan = Math.max(0.05, calibration.maxX - calibration.minX);
  const ySpan = Math.max(0.05, calibration.maxY - calibration.minY);

  // Normalize within calibration window [0, 1]
  const normX = (effectiveX - calibration.minX) / xSpan;
  const normY = (safeRawY - calibration.minY) / ySpan;

  // Map to [-1, 1] game paddle coordinates:
  // X: -1 is full left, +1 is full right
  // Y: camera Y is 0 at top, 1 at bottom; 3D game Y is up, so invert
  const gameX = Math.max(-1.0, Math.min(1.0, (normX - 0.5) * 2.0));
  const gameY = Math.max(-1.0, Math.min(1.0, -(normY - 0.5) * 2.0));

  return {
    x: sanitizeCoordinate(gameX),
    y: sanitizeCoordinate(gameY),
  };
}

function isValidNumber(val: any): boolean {
  return typeof val === 'number' && Number.isFinite(val) && !Number.isNaN(val);
}

function sanitizeCoordinate(val: number): number {
  if (!Number.isFinite(val) || Number.isNaN(val)) return 0;
  return Math.round(val * 10000) / 10000;
}
