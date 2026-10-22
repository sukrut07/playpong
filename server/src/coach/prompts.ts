import { MatchStatsInputDto } from './schemas.js';

export function buildMissionPrompt(stats?: Partial<MatchStatsInputDto>): string {
  const statsSummary = stats
    ? `
Current Player Performance:
- Return Success Rate: ${stats.returnSuccessRate ?? 50}%
- Total Returns: ${stats.totalReturns ?? 0}
- Longest Rally: ${stats.longestRally ?? 0}
- Average Reaction Time: ${stats.averageReactionTimeMs ? Math.round(stats.averageReactionTimeMs) + 'ms' : 'N/A'}
- Table Zone Hits (Left: ${stats.tableZoneDistribution?.left ?? 0}, Center: ${stats.tableZoneDistribution?.center ?? 0}, Right: ${stats.tableZoneDistribution?.right ?? 0})
- Tracking Stability: ${stats.trackingStabilityPercentage ?? 95}%
- Current Difficulty: ${stats.difficulty ?? 'easy'}
`
    : `Player is starting a new session. Difficulty: easy.`;

  return `You are Rally Coach, an expert 3D table-tennis AI coach powered by Gemma 4.
Generate a new, achievable player mission grounded strictly in the player's performance data.

${statsSummary}

RULES:
1. Supported mission_type values ONLY: "consecutive_returns", "total_returns", "win_match", "rally_length", "perfect_placement".
2. target_value must be an integer between 2 and 20.
3. difficulty must be one of: "easy", "medium", "hard".
4. Output MUST be ONLY valid JSON matching this exact structure:
{
  "mission_title": "string (short 3-6 words)",
  "mission_description": "string (actionable, clear)",
  "mission_type": "consecutive_returns" | "total_returns" | "win_match" | "rally_length" | "perfect_placement",
  "target_value": integer,
  "difficulty": "easy" | "medium" | "hard",
  "coach_tip": "string (focused on hand positioning or paddle control)",
  "reason": "string (grounded in the provided stats)"
}
Do not include markdown codeblocks or conversational text outside the JSON. Return only the JSON object.`;
}

export function buildSummaryPrompt(stats: MatchStatsInputDto): string {
  return `You are Rally Coach, analyzing a finished match of Gesture Pong AI.
Player Match Statistics:
- Final Score: Player ${stats.playerScore} - ${stats.opponentScore} Opponent
- Total Returns: ${stats.totalReturns}
- Successful Returns: ${stats.successfulReturns}
- Return Success Rate: ${stats.returnSuccessRate.toFixed(1)}%
- Longest Rally: ${stats.longestRally} returns
- Average Rally Length: ${stats.averageRallyLength.toFixed(1)}
- Reaction Time Avg: ${stats.averageReactionTimeMs > 0 ? Math.round(stats.averageReactionTimeMs) + 'ms' : 'Not recorded'}
- Table Hit Distribution: Left=${stats.tableZoneDistribution.left}, Center=${stats.tableZoneDistribution.center}, Right=${stats.tableZoneDistribution.right}
- Hand Tracking Stability: ${stats.trackingStabilityPercentage.toFixed(1)}%
- Difficulty Played: ${stats.difficulty}

RULES:
1. Ground every comment ONLY on these numbers. Do not fabricate unmeasured biological movements.
2. Formulate 1 to 3 specific strengths and 1 to 3 measurable weaknesses.
3. Propose a recommended follow-up mission that targets their biggest weakness.
4. Output MUST be ONLY valid JSON matching this exact structure:
{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommended_mission": {
    "mission_title": "string",
    "mission_description": "string",
    "mission_type": "consecutive_returns" | "total_returns" | "win_match" | "rally_length" | "perfect_placement",
    "target_value": integer,
    "difficulty": "easy" | "medium" | "hard",
    "coach_tip": "string",
    "reason": "string"
  },
  "tactical_advice": "string (concise, tactical, 1-2 sentences)",
  "encouragement": "string (motivating sports coach tone)",
  "suggested_difficulty": "easy" | "medium" | "hard"
}
Do not include markdown codeblocks or conversational text outside the JSON. Return only the JSON object.`;
}

export function buildAdaptiveDifficultyPrompt(stats: MatchStatsInputDto): string {
  return `You are Rally Coach. Evaluate if difficulty should adapt based on this match:
- Player vs Opponent: ${stats.playerScore} - ${stats.opponentScore}
- Return Success Rate: ${stats.returnSuccessRate}%
- Longest Rally: ${stats.longestRally}
- Current Difficulty: ${stats.difficulty}

Return ONLY valid JSON:
{
  "suggested_difficulty": "easy" | "medium" | "hard",
  "reason": "string (1 sentence)",
  "paddle_speed_multiplier": number (0.8 to 1.3)
}`;
}
