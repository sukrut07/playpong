// =====================================================================
// PONG AI — Evidence-Grounded Gemma 4 Prompt Templates
// =====================================================================

import { MatchStats, GameRule } from '../../../shared/types.js';
import { formatMetricPercentage, formatMetricNumber } from '../../../shared/metrics.js';

export function buildGemma4CoachingPrompt(stats: MatchStats, applicableRules?: GameRule[]): {
  systemPrompt: string;
  userPrompt: string;
} {
  const returnRateStr = formatMetricPercentage(stats.returnSuccessRate);
  const missRateStr = formatMetricPercentage(stats.missRate);
  const avgRallyStr = formatMetricNumber(stats.averageRallyLength, ' returns');
  const medianRallyStr = formatMetricNumber(stats.medianRallyLength, ' returns');
  const avgReactionStr = stats.averageReactionTimeMs ? `${Math.round(stats.averageReactionTimeMs)}ms` : 'Not recorded';
  const trackingAvailStr = stats.trackingAvailabilityPercentage !== undefined
    ? `${stats.trackingAvailabilityPercentage.toFixed(1)}%`
    : `${stats.trackingStabilityPercentage.toFixed(1)}%`;

  const rulesContext = applicableRules && applicableRules.length > 0
    ? applicableRules.map(r => `- Rule ${r.ruleId} (${r.title}): ${r.sourceSection} ${r.sourceDocument}`).join('\n')
    : 'Standard rules applied.';

  const systemPrompt = `You are Gemma 4, serving as the official AI Intelligence Layer and sports performance coach for PONG AI, a 3D racket simulation.
You do not merely chat; you analyze empirical match telemetry, distinguish observed facts from hypotheses, evaluate performance against deterministic metric contracts, and connect outcomes to official table-tennis rules.

CRITICAL CONSTRAINTS:
1. GROUNDING: Cite ONLY numbers provided in the match telemetry. NEVER invent unmeasured physical biometric stats (e.g., wrist angles, eye gaze).
2. DISTINGUISH HYPOTHESIS: Clearly label likely weaknesses as hypotheses if sample size is limited.
3. STRUCTURED OUTPUT: Return ONLY valid JSON matching the specified schema. No markdown backticks, no conversational preamble.
4. RULE TRACEABILITY: Whenever explaining or citing regulations, cite the exact source section and document.`;

  const userPrompt = `AUDITED MATCH TELEMETRY:
- Match ID: ${stats.matchId}
- Rule Profile: ${stats.ruleProfile}
- Final Score: Player ${stats.playerScore} - ${stats.opponentScore} Opponent
- Outcome: ${stats.playerScore > stats.opponentScore ? 'VICTORY' : 'DEFEAT'}
- Eligible Return Attempts: ${stats.eligibleReturnAttempts}
- Successful Returns: ${stats.successfulReturns}
- Missed Returns: ${stats.missedReturns}
- Return Success Rate: ${returnRateStr} (Formula: successful_returns / eligible_attempts)
- Miss Rate: ${missRateStr}
- Total Rallies Completed: ${stats.totalRallies}
- Longest Rally Streak: ${stats.longestRally} returns
- Average Rally Length: ${avgRallyStr}
- Median Rally Length: ${medianRallyStr}
- Average Reaction Time: ${avgReactionStr}
- Table Landing Distribution: Left=${stats.tableZoneDistribution.left}, Center=${stats.tableZoneDistribution.center}, Right=${stats.tableZoneDistribution.right}, Deep=${stats.tableZoneDistribution.deep}, Short=${stats.tableZoneDistribution.short}
- Webcam Tracking Availability: ${trackingAvailStr}
- Controller Input Mode: ${stats.controllerMode}
- Difficulty Level: ${stats.difficulty}

APPLICABLE RULES REFERENCE:
${rulesContext}

REQUIRED JSON SCHEMA:
{
  "summary": "string (high-level executive summary of match outcome and primary finding, 2-3 sentences)",
  "observations": [
    {
      "title": "string (3-5 words)",
      "description": "string (specific observation referencing actual numbers)",
      "metricName": "string",
      "metricValue": "string or number"
    }
  ],
  "evidence": [
    {
      "metric": "string (e.g. Return Success Rate)",
      "observedValue": "string or number (e.g. 70.0%)",
      "expectedBenchmark": "string (e.g. > 75% for Medium difficulty)",
      "significance": "string (why this matters for table tennis play)"
    }
  ],
  "weaknesses": [
    {
      "issue": "string",
      "likelyCause": "string",
      "isHypothesis": boolean
    }
  ],
  "recommendations": [
    "string (actionable technical or tactical advice)"
  ],
  "training_plan": [
    {
      "drillTitle": "string",
      "targetMetric": "string",
      "targetGoal": "string",
      "instructions": "string (clear practice steps in Gesture Lab or Arcade mode)"
    }
  ],
  "next_match_objective": "string (single measurable target, e.g. reach 80% return rate or keep 6-rally average)",
  "rule_references": [
    {
      "ruleId": "string (e.g. ITTF-2.7 or ARCADE-02)",
      "title": "string",
      "citation": "string (e.g. ITTF Statutes 2026 §2.7.1)",
      "explanation": "string (how this rule applied to the match events)"
    }
  ],
  "limitations": [
    "string (honest statement regarding 2D webcam tracking limits or sample size warnings)"
  ]
}`;

  return { systemPrompt, userPrompt };
}

export function buildAnalyticsQAPrompt(
  question: string,
  currentMatch: MatchStats,
  history: MatchStats[] = []
): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are Gemma 4, the analytics engine for PONG AI.
Answer the user's question regarding their gameplay statistics, performance trends, latency, or rule outcomes.
Base your response entirely on the provided telemetry records.
Distinguish correlation from causation. If sample size is insufficient, explicitly state that limitation.
Keep responses concise, insightful, and professional (under 150 words).`;

  const userPrompt = `USER QUESTION: "${question}"

CURRENT MATCH TELEMETRY:
- Score: Player ${currentMatch.playerScore} - ${currentMatch.opponentScore} Opponent
- Return Success Rate: ${formatMetricPercentage(currentMatch.returnSuccessRate)} (${currentMatch.successfulReturns}/${currentMatch.eligibleReturnAttempts})
- Average Rally Length: ${formatMetricNumber(currentMatch.averageRallyLength, ' returns')} (Longest: ${currentMatch.longestRally})
- Reaction Time: ${currentMatch.averageReactionTimeMs ? Math.round(currentMatch.averageReactionTimeMs) + 'ms' : 'N/A'}
- Table Placement: Left=${currentMatch.tableZoneDistribution.left}, Center=${currentMatch.tableZoneDistribution.center}, Right=${currentMatch.tableZoneDistribution.right}
- Hand Tracking Availability: ${currentMatch.trackingAvailabilityPercentage ?? currentMatch.trackingStabilityPercentage}%
- Controller: ${currentMatch.controllerMode}
- Difficulty: ${currentMatch.difficulty}
- Rule Profile: ${currentMatch.ruleProfile}

HISTORICAL SESSIONS AVAILABLE: ${history.length} matches logged.`;

  return { systemPrompt, userPrompt };
}
