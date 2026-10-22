export * from '../../../shared/types';
export * from '../../../shared/rules';
export * from '../../../shared/metrics';

import { RuleProfile } from '../../../shared/types';

export interface GameSettings {
  sensitivity: number; // 0.5 to 2.0
  smoothingFactor: number; // 0.1 to 0.9 (EMA alpha or 1€ filter cutoff)
  difficulty: 'easy' | 'medium' | 'hard';
  ruleProfile: RuleProfile;
  aiProvider: 'gemini' | 'ollama';
  soundEnabled: boolean;
  soundVolume: number;
  aiCoachingEnabled: boolean;
  showLandmarks: boolean;
  activeCameraId?: string;
  keyboardFallback: boolean;
  reducedMotion: boolean;
  playerAssistance: boolean;
}

export interface BallPhysicsState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  spinX: number;
  spinY: number;
  radius: number;
}

export interface PaddlePhysicsState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
}
