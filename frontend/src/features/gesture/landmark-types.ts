/**
 * PONG AI — Gesture Feature Pipeline Types
 */

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export type HandLandmarks = Landmark3D[];

export type TrackingStatus =
  | 'IDLE'
  | 'INITIALIZING'
  | 'TRACKING'
  | 'LOST'
  | 'PERMISSION_DENIED'
  | 'UNSUPPORTED'
  | 'SIMULATED';

export interface NormalizedCoordinates {
  x: number; // Clamped to [-1.0, 1.0] (left to right)
  y: number; // Clamped to [-1.0, 1.0] (down to up)
  z?: number;
}

export type DetectedGesture = 'none' | 'swing' | 'open_palm' | 'ready';

export interface GestureControllerState {
  coordinates: NormalizedCoordinates;
  rawAnchor: { x: number; y: number };
  smoothedCoordinates: NormalizedCoordinates;
  tracking: boolean;
  status: TrackingStatus;
  confidence: number;
  latencyMs: number;
  fps: number;
  timestamp: number;
  gesture: DetectedGesture;
  landmarks?: HandLandmarks;
}

export interface CalibrationBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
  centerY: number;
  isCalibrated: boolean;
}

export const DEFAULT_CALIBRATION: CalibrationBounds = {
  minX: 0.15,
  maxX: 0.85,
  minY: 0.20,
  maxY: 0.80,
  centerX: 0.50,
  centerY: 0.50,
  isCalibrated: false,
};

// Standard MediaPipe 21 hand landmarks indices
export const LANDMARK_INDEX = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_MCP: 9,
  MIDDLE_FINGER_PIP: 10,
  MIDDLE_FINGER_DIP: 11,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_MCP: 13,
  RING_FINGER_PIP: 14,
  RING_FINGER_DIP: 15,
  RING_FINGER_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;
