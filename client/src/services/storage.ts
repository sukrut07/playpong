import { MatchStats } from '../../../shared/types';

const STORAGE_KEY = 'gesture_pong_matches_v1';

export function saveMatchRecord(match: MatchStats): void {
  try {
    const list = loadMatchHistory();
    list.unshift(match);
    // Keep last 30 matches
    const trimmed = list.slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[Storage] Failed to save match record', e);
  }
}

export function loadMatchHistory(): MatchStats[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[Storage] Failed to load match history', e);
  }
  return [];
}

export interface SessionAggregates {
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  winPercentage: number;
  overallReturnSuccessRate: number;
  allTimeLongestRally: number;
  overallAverageReactionTime: number;
  totalMissionsCompleted: number;
}

export function calculateSessionAggregates(history: MatchStats[]): SessionAggregates {
  if (history.length === 0) {
    return {
      totalMatches: 0,
      matchesWon: 0,
      matchesLost: 0,
      winPercentage: 0,
      overallReturnSuccessRate: 0,
      allTimeLongestRally: 0,
      overallAverageReactionTime: 0,
      totalMissionsCompleted: 0,
    };
  }

  let won = 0;
  let totalReturns = 0;
  let successfulReturns = 0;
  let maxRally = 0;
  let totalReactionTime = 0;
  let reactionSamplesCount = 0;
  let missions = 0;

  for (const m of history) {
    if (m.playerScore > m.opponentScore) won++;
    totalReturns += m.totalReturns;
    successfulReturns += m.successfulReturns;
    if (m.longestRally > maxRally) maxRally = m.longestRally;
    missions += m.missionsCompleted || 0;

    for (const r of m.reactionTimeSamples || []) {
      totalReactionTime += r;
      reactionSamplesCount++;
    }
  }

  return {
    totalMatches: history.length,
    matchesWon: won,
    matchesLost: history.length - won,
    winPercentage: (won / history.length) * 100,
    overallReturnSuccessRate: totalReturns > 0 ? (successfulReturns / totalReturns) * 100 : 0,
    allTimeLongestRally: maxRally,
    overallAverageReactionTime: reactionSamplesCount > 0 ? totalReactionTime / reactionSamplesCount : 0,
    totalMissionsCompleted: missions,
  };
}
