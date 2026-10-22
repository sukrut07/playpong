/**
 * PONG AI — MediaPipe Vision Adapter
 * Encapsulates HandLandmarker initialization, video stream management,
 * and per-frame detection with resource cleanup.
 */

import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandLandmarks, Landmark3D, TrackingStatus } from './landmark-types';

export interface MediaPipeDetectionCallback {
  (result: {
    landmarks: HandLandmarks | null;
    timestampMs: number;
    latencyMs: number;
  }): void;
}

export class MediaPipeVisionAdapter {
  private handLandmarker: HandLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private lastVideoTime: number = -1;
  private onFrameCallback: MediaPipeDetectionCallback | null = null;
  private status: TrackingStatus = 'IDLE';

  public getStatus(): TrackingStatus {
    return this.status;
  }

  public async initialize(): Promise<void> {
    if (this.handLandmarker) return;

    this.status = 'INITIALIZING';
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

      this.status = 'IDLE';
    } catch (err) {
      console.error('[MediaPipeAdapter] Initialization error:', err);
      this.status = 'UNSUPPORTED';
      throw err;
    }
  }

  public async startCamera(
    videoEl: HTMLVideoElement,
    onFrame: MediaPipeDetectionCallback,
    deviceId?: string
  ): Promise<void> {
    await this.initialize();
    this.videoElement = videoEl;
    this.onFrameCallback = onFrame;

    const constraints: MediaStreamConstraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 60 } }
        : { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 60 }, facingMode: 'user' },
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      this.isRunning = true;
      this.status = 'TRACKING';
      this.loop();
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.status = 'PERMISSION_DENIED';
      } else {
        this.status = 'UNSUPPORTED';
      }
      throw err;
    }
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

    this.status = 'IDLE';
  }

  private loop = () => {
    if (!this.isRunning || !this.videoElement || !this.handLandmarker) return;

    const video = this.videoElement;
    if (video.currentTime !== this.lastVideoTime && video.readyState >= 2) {
      this.lastVideoTime = video.currentTime;
      const startTime = performance.now();

      const results = this.handLandmarker.detectForVideo(video, startTime);
      const latencyMs = Math.round(performance.now() - startTime);

      let landmarks: HandLandmarks | null = null;
      if (results.landmarks && results.landmarks.length > 0) {
        landmarks = results.landmarks[0].map((pt) => ({
          x: pt.x,
          y: pt.y,
          z: pt.z,
        }));
      }

      if (this.onFrameCallback) {
        this.onFrameCallback({
          landmarks,
          timestampMs: startTime,
          latencyMs,
        });
      }
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };
}
