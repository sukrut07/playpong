// =====================================================================
// PONG AI — Shared Type Definitions & Contracts
// =====================================================================

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export type RuleProfile = 'ARCADE_PONG' | 'TABLE_TENNIS_TRAINING';

export type RallyState = 'READY' | 'SERVE' | 'RALLY' | 'POINT_END' | 'MATCH_OVER' | 'PAUSED';

export type GestureType = 'ready' | 'swing' | 'open_palm' | 'none';

export type GestureClass = 'IDLE' | 'READY' | 'FOREHAND' | 'BACKHAND' | 'SMASH';

export interface HandControlState {
  x: number; // Normalised -1 to 1 (left to right)
  y: number; // Normalised -1 to 1 (down to up)
  z?: number; // Depth estimation if available
  confidence: number;
  timestamp: number;
  tracking: boolean;
  gesture: GestureType;
  rawLandmarks?: Array<{ x: number; y: number; z: number }>;
}

export interface CalibrationData {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
  centerY: number;
  isCalibrated: boolean;
}

export type MissionType =
  | 'consecutive_returns'
  | 'total_returns'
  | 'win_match'
  | 'rally_length'
  | 'perfect_placement';

export interface Mission {
  id: string;
  mission_title: string;
  mission_description: string;
  mission_type: MissionType;
  target_value: number;
  current_value: number;
  difficulty: GameDifficulty;
  coach_tip: string;
  reason: string;
  completed: boolean;
}

export type MatchEventType =
  | 'match_started'
  | 'serve_started'
  | 'ball_hit_player'
  | 'ball_hit_opponent'
  | 'ball_bounce_table'
  | 'ball_hit_net'
  | 'ball_let'
  | 'point_won_player'
  | 'point_won_opponent'
  | 'rally_ended'
  | 'mission_started'
  | 'mission_progress'
  | 'mission_completed'
  | 'tracking_lost'
  | 'tracking_regained'
  | 'match_completed';

export interface MatchEvent {
  type: MatchEventType;
  timestamp: number;
  details?: Record<string, any>;
}

export interface TableZoneDistribution {
  left: number;
  center: number;
  right: number;
  deep: number;
  short: number;
}

export interface MatchStats {
  matchId: string;
  startTime: number;
  endTime?: number;
  ruleProfile: RuleProfile;
  playerScore: number;
  opponentScore: number;
  totalReturns: number;
  successfulReturns: number;
  missedReturns: number;
  eligibleReturnAttempts: number;
  returnSuccessRate: number | null; // 0 to 100 or null if denominator == 0
  missRate: number | null; // 0 to 100 or null
  longestRally: number;
  totalRallies: number;
  averageRallyLength: number | null;
  medianRallyLength: number | null;
  averageReactionTimeMs: number | null;
  reactionTimeSamples: number[];
  tableZoneDistribution: TableZoneDistribution;
  trackingStabilityPercentage: number;
  trackingAvailabilityPercentage?: number;
  missionsCompleted: number;
  difficulty: GameDifficulty;
  controllerMode: 'gesture' | 'keyboard';
  assisted?: boolean; // Phase 6: Human assistance layer enabled
}

// ---------------------------------------------------------------------
// Gemma 4 Structured Coaching Contracts
// ---------------------------------------------------------------------
export interface CoachingObservation {
  title: string;
  description: string;
  metricName?: string;
  metricValue?: string | number;
}

export interface CoachingEvidence {
  metric: string;
  observedValue: string | number;
  expectedBenchmark: string;
  significance: string;
}

export interface CoachingWeakness {
  issue: string;
  likelyCause: string;
  isHypothesis: boolean; // Must distinguish hypothesis from proven fact
}

export interface TrainingPlanDrill {
  drillTitle: string;
  targetMetric: string;
  targetGoal: string;
  instructions: string;
}

export interface RuleReferenceLink {
  ruleId: string;
  title: string;
  citation: string;
  explanation: string;
  sourceUrl?: string;
}

export interface CoachingReport {
  summary: string;
  observations: CoachingObservation[];
  evidence: CoachingEvidence[];
  weaknesses: CoachingWeakness[];
  recommendations: string[];
  training_plan: TrainingPlanDrill[];
  next_match_objective: string;
  rule_references: RuleReferenceLink[];
  limitations: string[];
  providerInfo?: {
    provider: 'gemini' | 'ollama';
    model: string;
    inferenceTimeMs: number;
  };
}

export interface CoachSummaryResponse {
  summary?: CoachingReport | string;
  strengths?: string[];
  weaknesses?: string[];
  recommended_mission?: Mission;
  tactical_advice?: string;
  encouragement?: string;
  suggested_difficulty?: GameDifficulty;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  ai: {
    provider: 'gemini' | 'ollama';
    available: boolean;
    model: string;
    hasKey?: boolean;
    error?: string;
  };
  uptime: number;
}

// ---------------------------------------------------------------------
// Rule Registry Types (ITTF 2026 & Arcade)
// ---------------------------------------------------------------------
export type RuleImplementationStatus =
  | 'IMPLEMENTED_AND_TESTED'
  | 'PARTIALLY_SIMULATED'
  | 'DOCUMENTED_ONLY'
  | 'NOT_IMPLEMENTED';

export interface GameRule {
  ruleId: string;
  ruleSet: RuleProfile;
  title: string;
  description: string;
  sourceOrganisation: string;
  sourceDocument: string;
  sourceVersion: string;
  sourceSection: string;
  sourceUrl?: string;
  effectiveDate: string;
  implemented: boolean;
  implementationStatus: RuleImplementationStatus;
  limitations: string;
  tests: string[];
}

// ---------------------------------------------------------------------
// Benchmark & Controller Evaluation Types
// ---------------------------------------------------------------------
export interface BenchmarkScenario {
  id: string;
  name: string;
  difficulty: GameDifficulty;
  seed: number;
  ballSpeedMultiplier: number;
  returnCountTarget: number;
}

export interface BenchmarkResult {
  scenarioId: string;
  scenarioName: string;
  difficulty: GameDifficulty;
  trials: number;
  interceptionSuccessRate: number; // percentage
  missedBallRate: number; // percentage
  meanInterceptionErrorMeters: number;
  meanResponseDelayMs: number;
  averageRallyLength: number;
  timestamp: number;
}

// ---------------------------------------------------------------------
// Multiplayer Contracts
// ---------------------------------------------------------------------
export type PlayerRole = 'player1' | 'player2' | 'spectator';

export interface MultiplayerRoomState {
  roomCode: string;
  player1Ready: boolean;
  player2Ready: boolean;
  player1Connected: boolean;
  player2Connected: boolean;
  status: 'waiting' | 'in_game' | 'finished';
  player1Score: number;
  player2Score: number;
  rallyCount: number;
  server: 'player1' | 'player2';
  ruleProfile: RuleProfile;
}

export interface PaddleUpdatePayload {
  roomCode: string;
  role: PlayerRole;
  x: number;
  y: number;
  timestamp: number;
}
