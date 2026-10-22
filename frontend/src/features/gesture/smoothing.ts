/**
 * PONG AI — Adaptive Motion Smoothing Filters
 * Implements 1€ (One Euro) Filter and Low Pass Exponential Moving Average.
 * Eliminates webcam tremor at slow velocities while guaranteeing near-zero lag during fast racket swings.
 */

export class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  constructor(private alpha: number = 0.5) {}

  public filter(val: number, alpha: number = this.alpha): number {
    if (this.y === null || this.s === null) {
      this.s = val;
      this.y = val;
      return val;
    }
    this.s = alpha * val + (1 - alpha) * this.s;
    this.y = this.s;
    return this.y;
  }

  public setAlpha(alpha: number) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  public reset() {
    this.y = null;
    this.s = null;
  }
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number | null = null;
  private dxPrev: number = 0;
  private tPrev: number | null = null;

  constructor(minCutoff: number = 1.0, beta: number = 0.05, dCutoff: number = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  private alpha(rate: number, cutoff: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    const te = 1.0 / rate;
    return 1.0 / (1.0 + tau / te);
  }

  public filter(val: number, timestampMs: number): number {
    if (this.tPrev === null || this.xPrev === null) {
      this.xPrev = val;
      this.dxPrev = 0;
      this.tPrev = timestampMs;
      return val;
    }

    const dt = Math.max(0.001, (timestampMs - this.tPrev) / 1000.0);
    this.tPrev = timestampMs;

    const rate = 1.0 / dt;
    const dx = (val - this.xPrev) * rate;
    const edx = this.alpha(rate, this.dCutoff) * dx + (1 - this.alpha(rate, this.dCutoff)) * this.dxPrev;
    this.dxPrev = edx;

    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    const a = this.alpha(rate, cutoff);
    const xFiltered = a * val + (1 - a) * this.xPrev;
    this.xPrev = xFiltered;

    return xFiltered;
  }

  public reset() {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }
}

export class Point2DSmoother {
  private xFilter: OneEuroFilter;
  private yFilter: OneEuroFilter;

  constructor(minCutoff: number = 1.4, beta: number = 0.7) {
    this.xFilter = new OneEuroFilter(minCutoff, beta);
    this.yFilter = new OneEuroFilter(minCutoff, beta);
  }

  public smooth(x: number, y: number, timestampMs: number): { x: number; y: number } {
    return {
      x: this.xFilter.filter(x, timestampMs),
      y: this.yFilter.filter(y, timestampMs),
    };
  }

  public reset() {
    this.xFilter.reset();
    this.yFilter.reset();
  }
}
