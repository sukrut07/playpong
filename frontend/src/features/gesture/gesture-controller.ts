/**
 * PONG AI — Gesture Controller State Machine
 * Testable controller that sits downstream of MediaPipe or Synthetic Landmark feeds.
 * Ensures identical mapping, calibration, and smoothing behavior across production webcam and dry-run tests.
 */

import {
  CalibrationBounds,
  DEFAULT_CALIBRATION,
  GestureControllerState,
  HandLandmarks,
  NormalizedCoordinates,
  TrackingStatus,
  DetectedGesture,
} from './landmark-types';
import { extractPalmAnchor, mapCameraToGameCoordinates } from './coordinate-mapper';
import { Point2DSmoother } from './smoothing';

export type GestureControllerListener = (state: GestureControllerState) => void;

export class GestureController {
  private calibration: CalibrationBounds;
  private smoother: Point2DSmoother;
  private listeners: GestureControllerListener[] = [];

  private currentState: GestureControllerState = {
    coordinates: { x: 0, y: 0 },
    rawAnchor: { x: 0.5, y: 0.5 },
    smoothedCoordinates: { x: 0, y: 0 },
    tracking: false,
    status: 'IDLE',
    confidence: 0,
    latencyMs: 0,
    fps: 0,
    timestamp: Date.now(),
    gesture: 'none',
  };

  // FPS tracking
  private frameCount: number = 0;
  private lastFpsUpdate: number = performance.now();
  private lastVelocityCheckTime: number = performance.now();
  private lastSmoothedPos: NormalizedCoordinates = { x: 0, y: 0 };

  constructor(
    initialCalibration: CalibrationBounds = DEFAULT_CALIBRATION,
    minCutoff: number = 1.4,
    beta: number = 0.7
  ) {
    this.calibration = initialCalibration;
    this.smoother = new Point2DSmoother(minCutoff, beta);
  }

  public setCalibration(calibration: CalibrationBounds) {
    this.calibration = calibration;
  }

  public getCalibration(): CalibrationBounds {
    return this.calibration;
  }

  public subscribe(listener: GestureControllerListener): () => void {
    this.listeners.push(listener);
    listener(this.currentState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): GestureControllerState {
    return this.currentState;
  }

  public reset(): void {
    this.smoother.reset();
    this.currentState = {
      coordinates: { x: 0, y: 0 },
      rawAnchor: { x: 0.5, y: 0.5 },
      smoothedCoordinates: { x: 0, y: 0 },
      tracking: false,
      status: 'IDLE',
      confidence: 0,
      latencyMs: 0,
      fps: 0,
      timestamp: Date.now(),
      gesture: 'none',
    };
    this.emitState();
  }

  /**
   * Process a frame of 21 landmarks (from real camera or synthetic generator).
   */
  public processFrame(
    landmarks: HandLandmarks | null,
    timestampMs: number = performance.now(),
    processingLatencyMs: number = 0,
    statusOverride?: TrackingStatus
  ): GestureControllerState {
    const now = timestampMs;

    // Update FPS calculation
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 1000) {
      this.currentState.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    if (!landmarks || landmarks.length === 0) {
      // Tracking lost: hold current coordinate safely without jumping!
      this.currentState = {
        ...this.currentState,
        tracking: false,
        status: statusOverride ?? 'LOST',
        confidence: 0,
        latencyMs: processingLatencyMs,
        timestamp: Date.now(),
        gesture: 'none',
        landmarks: undefined,
      };
      this.emitState();
      return this.currentState;
    }

    const anchor = extractPalmAnchor(landmarks);
    if (!anchor) {
      this.currentState.tracking = false;
      this.currentState.status = 'LOST';
      this.emitState();
      return this.currentState;
    }

    // Map to game space [-1, 1]
    const rawGameCoord = mapCameraToGameCoordinates(anchor.x, anchor.y, this.calibration, true);

    // Apply adaptive smoothing
    const smoothed = this.smoother.smooth(rawGameCoord.x, rawGameCoord.y, now);

    // Detect swing gesture from velocity
    const dt = Math.max(0.001, (now - this.lastVelocityCheckTime) / 1000);
    const speed = Math.hypot(smoothed.x - this.lastSmoothedPos.x, smoothed.y - this.lastSmoothedPos.y) / dt;
    this.lastVelocityCheckTime = now;
    this.lastSmoothedPos = { x: smoothed.x, y: smoothed.y };

    let detectedGesture: DetectedGesture = 'none';
    if (speed > 1.4) {
      detectedGesture = 'swing';
    } else if (speed < 0.35) {
      detectedGesture = 'ready';
    }

    this.currentState = {
      coordinates: rawGameCoord,
      rawAnchor: anchor,
      smoothedCoordinates: {
        x: Math.round(smoothed.x * 10000) / 10000,
        y: Math.round(smoothed.y * 10000) / 10000,
      },
      tracking: true,
      status: statusOverride ?? 'TRACKING',
      confidence: 0.95,
      latencyMs: processingLatencyMs,
      fps: this.currentState.fps,
      timestamp: Date.now(),
      gesture: detectedGesture,
      landmarks,
    };

    this.emitState();
    return this.currentState;
  }

  private emitState() {
    for (const listener of this.listeners) {
      listener(this.currentState);
    }
  }
}
