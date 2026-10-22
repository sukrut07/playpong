import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandControlState } from '../../../shared/types';
import { CalibrationData, mapToGameCoordinates } from './calibration';
import { Point2DSmoother } from './smoothing';
import { GestureDetector } from './gestureDetector';

export type HandControlCallback = (state: HandControlState) => void;

export class VisionPipeline {
  private handLandmarker: HandLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private lastVideoTime: number = -1;

  private smoother = new Point2DSmoother(1.2, 0.05);
  private gestureDetector = new GestureDetector();
  private calibration: CalibrationData;
  private onControlCallback: HandControlCallback | null = null;

  private currentControl: HandControlState = {
    x: 0,
    y: 0,
    confidence: 0,
    timestamp: Date.now(),
    tracking: false,
    gesture: 'none',
  };

  constructor(initialCalibration: CalibrationData) {
    this.calibration = initialCalibration;
  }

  public setCalibration(calib: CalibrationData) {
    this.calibration = calib;
  }

  public setOnControl(cb: HandControlCallback) {
    this.onControlCallback = cb;
  }

  public async initialize(): Promise<void> {
    if (this.handLandmarker) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      console.log('[VisionPipeline] MediaPipe HandLandmarker initialized successfully.');
    } catch (err) {
      console.error('[VisionPipeline] MediaPipe initialization error:', err);
      throw err;
    }
  }

  public async startCamera(videoEl: HTMLVideoElement, deviceId?: string): Promise<void> {
    await this.initialize();
    this.videoElement = videoEl;

    const constraints: MediaStreamConstraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 60 } }
        : { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 60 }, facingMode: 'user' },
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.videoElement.srcObject = this.stream;
    await this.videoElement.play();

    this.isRunning = true;
    this.loop();
  }

  public stopCamera(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.smoother.reset();
    this.gestureDetector.reset();

    this.currentControl = {
      ...this.currentControl,
      tracking: false,
      confidence: 0,
      gesture: 'none',
      timestamp: Date.now(),
    };
    if (this.onControlCallback) {
      this.onControlCallback(this.currentControl);
    }
  }

  private loop = () => {
    if (!this.isRunning || !this.videoElement || !this.handLandmarker) return;

    const video = this.videoElement;
    if (video.currentTime !== this.lastVideoTime && video.readyState >= 2) {
      this.lastVideoTime = video.currentTime;
      const now = performance.now();

      const results = this.handLandmarker.detectForVideo(video, now);

      if (results.landmarks && results.landmarks.length > 0) {
        const hand = results.landmarks[0];
        // Use wrist (0) and middle knuckle (9) midpoint for robust paddle anchor
        const anchorX = (hand[0].x + hand[9].x) * 0.5;
        const anchorY = (hand[0].y + hand[9].y) * 0.5;

        // Map through calibration window
        const gameCoord = mapToGameCoordinates(anchorX, anchorY, this.calibration, true);

        // Apply One Euro smoothing
        const smoothed = this.smoother.smooth(gameCoord.x, gameCoord.y, now);

        // Detect swing / gestures
        const { gesture } = this.gestureDetector.detect(smoothed.x, smoothed.y, now, hand);

        this.currentControl = {
          x: smoothed.x,
          y: smoothed.y,
          confidence: 0.95,
          timestamp: Date.now(),
          tracking: true,
          gesture,
          rawLandmarks: hand,
        };
      } else {
        // Tracking lost - hold current position safely without jump
        this.currentControl = {
          ...this.currentControl,
          tracking: false,
          confidence: 0,
          gesture: 'none',
          timestamp: Date.now(),
        };
      }

      if (this.onControlCallback) {
        this.onControlCallback(this.currentControl);
      }
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public getCurrentControl(): HandControlState {
    return this.currentControl;
  }
}
