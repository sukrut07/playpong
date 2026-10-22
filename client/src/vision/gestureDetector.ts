import { GestureType } from '../../../shared/types';

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export class GestureDetector {
  private lastX: number = 0;
  private lastY: number = 0;
  private lastTime: number = 0;
  private velocity: number = 0;

  public detect(
    gameX: number,
    gameY: number,
    timestamp: number,
    landmarks?: Landmark3D[]
  ): { gesture: GestureType; velocity: number } {
    if (this.lastTime === 0) {
      this.lastX = gameX;
      this.lastY = gameY;
      this.lastTime = timestamp;
      return { gesture: 'ready', velocity: 0 };
    }

    const dt = Math.max(0.005, (timestamp - this.lastTime) / 1000.0);
    const dx = gameX - this.lastX;
    const dy = gameY - this.lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const instantVelocity = dist / dt;

    // Smoothed velocity
    this.velocity = 0.7 * instantVelocity + 0.3 * this.velocity;
    this.lastX = gameX;
    this.lastY = gameY;
    this.lastTime = timestamp;

    // Open palm check (fingers extended vs wrist)
    if (landmarks && landmarks.length >= 21) {
      const wrist = landmarks[0];
      const tipIndices = [4, 8, 12, 16, 20];
      const mcpIndices = [2, 5, 9, 13, 17];

      let extendedFingers = 0;
      for (let i = 0; i < tipIndices.length; i++) {
        const tip = landmarks[tipIndices[i]];
        const mcp = landmarks[mcpIndices[i]];
        const distTipWrist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
        const distMcpWrist = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y);
        if (distTipWrist > distMcpWrist * 1.3) {
          extendedFingers++;
        }
      }

      if (extendedFingers >= 4 && this.velocity < 1.0) {
        return { gesture: 'open_palm', velocity: this.velocity };
      }
    }

    // Swing detected if fast paddle movement
    if (this.velocity > 2.8) {
      return { gesture: 'swing', velocity: this.velocity };
    }

    return { gesture: 'ready', velocity: this.velocity };
  }

  public reset() {
    this.lastTime = 0;
    this.velocity = 0;
  }
}
