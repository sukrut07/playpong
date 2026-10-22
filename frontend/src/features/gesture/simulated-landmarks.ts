/**
 * PONG AI — Synthetic Hand Landmark Generator for Dry-Run Testing
 * Enables full offline automated verification without webcam hardware or permissions.
 */

import { HandLandmarks, Landmark3D, LANDMARK_INDEX } from './landmark-types';

/**
 * Constructs a topologically valid 21-point hand skeleton around an anchor point (x, y).
 * Uses standard anatomical finger spreads and relative joint distances.
 */
export function generateSyntheticHand(
  anchor: { x: number; y: number; z?: number },
  scale: number = 0.12
): HandLandmarks {
  const ax = anchor.x;
  const ay = anchor.y;
  const az = anchor.z ?? 0;

  const landmarks: Landmark3D[] = new Array(21);

  // Wrist at base
  landmarks[LANDMARK_INDEX.WRIST] = { x: ax, y: ay + scale * 0.7, z: az };

  // Thumb
  landmarks[LANDMARK_INDEX.THUMB_CMC] = { x: ax - scale * 0.4, y: ay + scale * 0.4, z: az - 0.02 };
  landmarks[LANDMARK_INDEX.THUMB_MCP] = { x: ax - scale * 0.6, y: ay + scale * 0.2, z: az - 0.03 };
  landmarks[LANDMARK_INDEX.THUMB_IP] = { x: ax - scale * 0.7, y: ay - scale * 0.05, z: az - 0.04 };
  landmarks[LANDMARK_INDEX.THUMB_TIP] = { x: ax - scale * 0.75, y: ay - scale * 0.3, z: az - 0.05 };

  // Index
  landmarks[LANDMARK_INDEX.INDEX_FINGER_MCP] = { x: ax - scale * 0.25, y: ay - scale * 0.1, z: az };
  landmarks[LANDMARK_INDEX.INDEX_FINGER_PIP] = { x: ax - scale * 0.25, y: ay - scale * 0.4, z: az - 0.02 };
  landmarks[LANDMARK_INDEX.INDEX_FINGER_DIP] = { x: ax - scale * 0.25, y: ay - scale * 0.65, z: az - 0.03 };
  landmarks[LANDMARK_INDEX.INDEX_FINGER_TIP] = { x: ax - scale * 0.25, y: ay - scale * 0.85, z: az - 0.04 };

  // Middle (primary anchor knuckle is index 9)
  landmarks[LANDMARK_INDEX.MIDDLE_FINGER_MCP] = { x: ax, y: ay - scale * 0.15, z: az };
  landmarks[LANDMARK_INDEX.MIDDLE_FINGER_PIP] = { x: ax, y: ay - scale * 0.5, z: az - 0.02 };
  landmarks[LANDMARK_INDEX.MIDDLE_FINGER_DIP] = { x: ax, y: ay - scale * 0.75, z: az - 0.03 };
  landmarks[LANDMARK_INDEX.MIDDLE_FINGER_TIP] = { x: ax, y: ay - scale * 1.0, z: az - 0.04 };

  // Ring
  landmarks[LANDMARK_INDEX.RING_FINGER_MCP] = { x: ax + scale * 0.25, y: ay - scale * 0.1, z: az };
  landmarks[LANDMARK_INDEX.RING_FINGER_PIP] = { x: ax + scale * 0.25, y: ay - scale * 0.42, z: az - 0.02 };
  landmarks[LANDMARK_INDEX.RING_FINGER_DIP] = { x: ax + scale * 0.25, y: ay - scale * 0.68, z: az - 0.03 };
  landmarks[LANDMARK_INDEX.RING_FINGER_TIP] = { x: ax + scale * 0.25, y: ay - scale * 0.88, z: az - 0.04 };

  // Pinky
  landmarks[LANDMARK_INDEX.PINKY_MCP] = { x: ax + scale * 0.45, y: ay + scale * 0.05, z: az };
  landmarks[LANDMARK_INDEX.PINKY_PIP] = { x: ax + scale * 0.5, y: ay - scale * 0.25, z: az - 0.02 };
  landmarks[LANDMARK_INDEX.PINKY_DIP] = { x: ax + scale * 0.5, y: ay - scale * 0.48, z: az - 0.03 };
  landmarks[LANDMARK_INDEX.PINKY_TIP] = { x: ax + scale * 0.5, y: ay - scale * 0.68, z: az - 0.04 };

  return landmarks;
}

export type DryRunScenario =
  | 'CENTER_HOLD'
  | 'LEFT_SWEEP'
  | 'RIGHT_SWEEP'
  | 'VERTICAL_BOUNCE'
  | 'NOISY_TREMOR'
  | 'TRACKING_LOSS_RECOVERY';

export interface SyntheticFrame {
  landmarks: HandLandmarks | null; // null represents missing hand / frame drop
  timestampMs: number;
  label: string;
}

/**
 * Generates an array of synthetic frames for dry-run verification.
 */
export function generateScenarioFrames(scenario: DryRunScenario, frameCount: number = 30): SyntheticFrame[] {
  const frames: SyntheticFrame[] = [];
  const dt = 16.6; // ~60 FPS
  let baseTime = performance.now();

  switch (scenario) {
    case 'CENTER_HOLD':
      for (let i = 0; i < frameCount; i++) {
        frames.push({
          landmarks: generateSyntheticHand({ x: 0.5, y: 0.5 }),
          timestampMs: baseTime + i * dt,
          label: 'Center Hold (0.5, 0.5)',
        });
      }
      break;

    case 'LEFT_SWEEP':
      for (let i = 0; i < frameCount; i++) {
        const t = i / (frameCount - 1);
        const x = 0.5 + (0.8 - 0.5) * t; // In camera space, rawX 0.8 mirrors to physical left
        frames.push({
          landmarks: generateSyntheticHand({ x, y: 0.5 }),
          timestampMs: baseTime + i * dt,
          label: `Left Sweep (t=${t.toFixed(2)})`,
        });
      }
      break;

    case 'RIGHT_SWEEP':
      for (let i = 0; i < frameCount; i++) {
        const t = i / (frameCount - 1);
        const x = 0.5 - (0.5 - 0.2) * t; // In camera space, rawX 0.2 mirrors to physical right
        frames.push({
          landmarks: generateSyntheticHand({ x, y: 0.5 }),
          timestampMs: baseTime + i * dt,
          label: `Right Sweep (t=${t.toFixed(2)})`,
        });
      }
      break;

    case 'VERTICAL_BOUNCE':
      for (let i = 0; i < frameCount; i++) {
        const angle = (i / frameCount) * Math.PI * 2;
        const y = 0.5 + Math.sin(angle) * 0.25;
        frames.push({
          landmarks: generateSyntheticHand({ x: 0.5, y }),
          timestampMs: baseTime + i * dt,
          label: `Vertical Sweep (y=${y.toFixed(2)})`,
        });
      }
      break;

    case 'NOISY_TREMOR':
      for (let i = 0; i < frameCount; i++) {
        // High-frequency jitter around center
        const jitterX = (Math.sin(i * 1.7) * 0.04) + (Math.cos(i * 3.1) * 0.02);
        const jitterY = (Math.cos(i * 1.9) * 0.04) + (Math.sin(i * 2.7) * 0.02);
        frames.push({
          landmarks: generateSyntheticHand({ x: 0.5 + jitterX, y: 0.5 + jitterY }),
          timestampMs: baseTime + i * dt,
          label: `Noisy Jitter (${jitterX.toFixed(3)}, ${jitterY.toFixed(3)})`,
        });
      }
      break;

    case 'TRACKING_LOSS_RECOVERY':
      // 10 valid frames, 10 dropped frames, 10 recovered frames
      for (let i = 0; i < frameCount; i++) {
        const isLost = i >= 10 && i < 20;
        frames.push({
          landmarks: isLost ? null : generateSyntheticHand({ x: 0.5, y: 0.5 }),
          timestampMs: baseTime + i * dt,
          label: isLost ? 'Tracking Lost (null frame)' : 'Tracking Active',
        });
      }
      break;
  }

  return frames;
}
