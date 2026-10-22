export type GameDifficulty = 'easy' | 'medium' | 'hard';

export type RallyState = 'READY' | 'SERVE' | 'RALLY' | 'POINT_END' | 'MATCH_OVER';

export type GestureType = 'ready' | 'swing' | 'open_palm' | 'none';

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
  playerScore: number;
  opponentScore: number;
  totalReturns: number;
  successfulReturns: number;
  returnSuccessRate: number; // 0 to 100
  longestRally: number;
  totalRallies: number;
  averageRallyLength: number;
  medianRallyLength: number;
  averageReactionTimeMs: number;
  reactionTimeSamples: number[];
  tableZoneDistribution: TableZoneDistribution;
  trackingStabilityPercentage: number;
  missionsCompleted: number;
  difficulty: GameDifficulty;
}

export interface CoachSummaryResponse {
  strengths: string[];
  weaknesses: string[];
  recommended_mission: Mission;
  tactical_advice: string;
  encouragement: string;
  suggested_difficulty: GameDifficulty;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  ollama: {
    available: boolean;
    model: string;
    version?: string;
  };
  uptime: number;
}
