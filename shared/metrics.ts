// =====================================================================
// PONG AI — Centralized Auditable Metric Calculations
// =====================================================================
// Strict mathematical definitions to ensure 100% consistency across
// HUD displays, Analytics Studio, Benchmark Lab, and Gemma 4 Prompts.

export interface MetricCalculationInput {
  successfulReturns: number;
  missedReturns: number;
  totalContacts: number;
  completedRallies: number;
  rallyLengths: number[];
  reactionTimesMs: number[];
  validTrackingFrames?: number;
  totalCameraFrames?: number;
}

export interface MetricCalculationOutput {
  eligibleReturnAttempts: number;
  returnSuccessRate: number | null; // 0 to 100 or null if denominator == 0
  missRate: number | null; // 0 to 100 or null
  averageRallyLength: number | null;
  medianRallyLength: number | null;
  longestRally: number;
  averageReactionTimeMs: number | null;
  trackingAvailabilityPercentage: number | null;
}

/**
 * Calculates return success rate as a percentage:
 * return_success_rate = (successful_returns / eligible_return_attempts) * 100
 *
 * Invariant: Returns null if eligible_return_attempts is zero. Never returns 0% when no attempts exist.
 */
export function calculateReturnSuccessRate(
  successfulReturns: number,
  eligibleReturnAttempts: number
): number | null {
  if (eligibleReturnAttempts <= 0) {
    return null;
  }
  const rate = (successfulReturns / eligibleReturnAttempts) * 100;
  return Math.min(100, Math.max(0, Math.round(rate * 10) / 10));
}

/**
 * Calculates miss rate as a percentage:
 * miss_rate = (missed_returns / eligible_return_attempts) * 100
 *
 * Invariant: returnSuccessRate + missRate === 100% when eligibleReturnAttempts > 0
 */
export function calculateMissRate(
  missedReturns: number,
  eligibleReturnAttempts: number
): number | null {
  if (eligibleReturnAttempts <= 0) {
    return null;
  }
  const rate = (missedReturns / eligibleReturnAttempts) * 100;
  return Math.min(100, Math.max(0, Math.round(rate * 10) / 10));
}

/**
 * Calculates average rally length across completed rallies:
 * average_rally_length = total_counted_contacts / completed_rallies
 */
export function calculateAverageRallyLength(
  totalContacts: number,
  completedRallies: number
): number | null {
  if (completedRallies <= 0) {
    return null;
  }
  return Math.round((totalContacts / completedRallies) * 10) / 10;
}

/**
 * Calculates median rally length from an array of rally lengths:
 */
export function calculateMedianRallyLength(rallyLengths: number[]): number | null {
  if (!rallyLengths || rallyLengths.length === 0) {
    return null;
  }
  const sorted = [...rallyLengths].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10;
  }
  return sorted[mid];
}

/**
 * Calculates average reaction time in ms, filtering invalid readings:
 */
export function calculateAverageReactionTime(reactionTimesMs: number[]): number | null {
  const valid = reactionTimesMs.filter((t) => t >= 50 && t <= 3000);
  if (valid.length === 0) {
    return null;
  }
  const sum = valid.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / valid.length);
}

/**
 * Calculates tracking availability percentage:
 * tracking_availability = (valid_frames / total_camera_frames) * 100
 */
export function calculateTrackingAvailability(
  validFrames?: number,
  totalFrames?: number
): number | null {
  if (validFrames === undefined || totalFrames === undefined || totalFrames <= 0) {
    return null;
  }
  const avail = (validFrames / totalFrames) * 100;
  return Math.min(100, Math.max(0, Math.round(avail * 10) / 10));
}

/**
 * Aggregates all gameplay metrics in a single audited step:
 */
export function computeAuditedMetrics(input: MetricCalculationInput): MetricCalculationOutput {
  const eligibleAttempts = input.successfulReturns + input.missedReturns;

  return {
    eligibleReturnAttempts: eligibleAttempts,
    returnSuccessRate: calculateReturnSuccessRate(input.successfulReturns, eligibleAttempts),
    missRate: calculateMissRate(input.missedReturns, eligibleAttempts),
    averageRallyLength: calculateAverageRallyLength(input.totalContacts, input.completedRallies),
    medianRallyLength: calculateMedianRallyLength(input.rallyLengths),
    longestRally: input.rallyLengths.length > 0 ? Math.max(...input.rallyLengths) : 0,
    averageReactionTimeMs: calculateAverageReactionTime(input.reactionTimesMs),
    trackingAvailabilityPercentage: calculateTrackingAvailability(
      input.validTrackingFrames,
      input.totalCameraFrames
    ),
  };
}

/**
 * Human-readable formatter for metrics that safely handles null values:
 */
export function formatMetricPercentage(val: number | null, fallback = 'Insufficient Data'): string {
  if (val === null || isNaN(val)) return fallback;
  return `${val.toFixed(1)}%`;
}

export function formatMetricNumber(val: number | null, unit = '', fallback = '—'): string {
  if (val === null || isNaN(val)) return fallback;
  return `${val}${unit}`;
}

// Aliases matching prompt mathematical specification:
export const return_success_rate = calculateReturnSuccessRate;
export const miss_rate = calculateMissRate;
export const average_rally_length = calculateAverageRallyLength;

