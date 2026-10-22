/**
 * PONG AI — Match History & Session Telemetry Storage
 */

import { MatchStats } from '@game-engine/types';

const STORAGE_KEY = 'pong_ai_match_history_v2';

export function saveMatchRecord(match: MatchStats): void {
  try {
    const list = loadMatchHistory();
    list.unshift(match);
    const trimmed = list.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('[Storage] Failed to save match record:', err);
  }
}

export function loadMatchHistory(): MatchStats[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.warn('[Storage] Failed to load match history:', err);
  }
  return [];
}

export function clearMatchHistory(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[Storage] Failed to clear match history:', err);
  }
}

export interface SessionAggregates {
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  winPercentage: number;
  overallReturnSuccessRate: number;
  allTimeLongestRally: number;
  overallAverageReactionTime: number;
  totalReturns: number;
}

export function calculateSessionAggregates(history: MatchStats[]): SessionAggregates {
  if (!history || history.length === 0) {
    return {
      totalMatches: 0,
      matchesWon: 0,
      matchesLost: 0,
      winPercentage: 0,
      overallReturnSuccessRate: 0,
      allTimeLongestRally: 0,
      overallAverageReactionTime: 0,
      totalReturns: 0,
    };
  }

  let won = 0;
  let totalReturns = 0;
  let successfulReturns = 0;
  let maxRally = 0;
  let totalReactionTime = 0;
  let reactionSamplesCount = 0;

  for (const m of history) {
    if (m.playerScore > m.opponentScore) won++;
    totalReturns += m.totalReturns || 0;
    successfulReturns += m.successfulReturns || 0;
    if ((m.longestRally || 0) > maxRally) maxRally = m.longestRally;

    for (const r of m.reactionTimeSamples || []) {
      totalReactionTime += r;
      reactionSamplesCount++;
    }
  }

  return {
    totalMatches: history.length,
    matchesWon: won,
    matchesLost: history.length - won,
    winPercentage: Math.round((won / history.length) * 100),
    overallReturnSuccessRate: totalReturns > 0 ? Math.round((successfulReturns / totalReturns) * 1000) / 10 : 0,
    allTimeLongestRally: maxRally,
    overallAverageReactionTime: reactionSamplesCount > 0 ? Math.round(totalReactionTime / reactionSamplesCount) : 0,
    totalReturns,
  };
}

/**
 * Returns pre-seeded demo telemetry for demonstration purposes when user clicks "Load Demo Data".
 */
export function getDemoTelemetry(): MatchStats[] {
  const now = Date.now();
  return [
    {
      matchId: 'match_demo_01',
      startTime: now - 3600000,
      endTime: now - 3300000,
      playerScore: 11,
      opponentScore: 8,
      difficulty: 'medium',
      ruleProfile: 'TABLE_TENNIS_TRAINING',
      totalReturns: 28,
      successfulReturns: 23,
      missedReturns: 5,
      eligibleReturnAttempts: 28,
      returnSuccessRate: 82.1,
      missRate: 17.9,
      completedRallies: 19,
      totalRallies: 19,
      rallyLengths: [4, 6, 8, 3, 2, 7, 5, 9, 3, 4],
      longestRally: 9,
      averageRallyLength: 5.1,
      medianRallyLength: 5.0,
      averageReactionTimeMs: 245,
      reactionTimeSamples: [230, 250, 240, 260],
      tableZoneHits: { left: 8, center: 12, right: 8, deep: 14, short: 14 },
      tableZoneDistribution: { left: 8, center: 12, right: 8, deep: 14, short: 14 },
      trackingStabilityPercentage: 98,
      missionsCompleted: 1,
      controllerMode: 'gesture',
    },
    {
      matchId: 'match_demo_02',
      startTime: now - 7200000,
      endTime: now - 6900000,
      playerScore: 7,
      opponentScore: 4,
      difficulty: 'easy',
      ruleProfile: 'ARCADE_PONG',
      totalReturns: 18,
      successfulReturns: 14,
      missedReturns: 4,
      eligibleReturnAttempts: 18,
      returnSuccessRate: 77.8,
      missRate: 22.2,
      completedRallies: 11,
      totalRallies: 11,
      rallyLengths: [3, 4, 5, 2, 6, 3],
      longestRally: 6,
      averageRallyLength: 3.8,
      medianRallyLength: 4.0,
      averageReactionTimeMs: 280,
      reactionTimeSamples: [270, 290],
      tableZoneHits: { left: 4, center: 10, right: 4, deep: 8, short: 10 },
      tableZoneDistribution: { left: 4, center: 10, right: 4, deep: 8, short: 10 },
      trackingStabilityPercentage: 94,
      missionsCompleted: 0,
      controllerMode: 'keyboard',
    },
  ];
}
