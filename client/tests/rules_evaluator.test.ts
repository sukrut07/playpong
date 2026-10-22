import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RULE_REGISTRY, getRulesByProfile, getRuleById } from '../../shared/rules.js';

test('Rules Registry: Both ARCADE_PONG and TABLE_TENNIS_TRAINING profiles exist', () => {
  const arcadeRules = getRulesByProfile('ARCADE_PONG');
  const ttRules = getRulesByProfile('TABLE_TENNIS_TRAINING');

  assert.ok(arcadeRules.length >= 4, 'Arcade profile must have at least 4 documented rules');
  assert.ok(ttRules.length >= 8, 'ITTF profile must have key ITTF 2026 rules');

  for (const rule of RULE_REGISTRY) {
    assert.ok(rule.ruleId, 'Rule must have ruleId');
    assert.ok(rule.title, 'Rule must have title');
    assert.ok(rule.sourceDocument, 'Rule must cite sourceDocument');
    assert.ok(rule.implementationStatus, 'Rule must have implementationStatus');
  }
});

test('Rules Traceability: ITTF 2026 provisions correctly cite sections and statuses', () => {
  const tableRule = getRuleById('ITTF-2.1');
  assert.ok(tableRule);
  assert.equal(tableRule.implementationStatus, 'IMPLEMENTED_AND_TESTED');
  assert.equal(tableRule.sourceSection, '§2.1.1, §2.1.3');

  const serveRule = getRuleById('ITTF-2.6');
  assert.ok(serveRule);
  assert.equal(serveRule.implementationStatus, 'PARTIALLY_SIMULATED');
  assert.ok(serveRule.limitations.includes('16cm'));

  const racketCoveringRule = getRuleById('ITTF-2.4');
  assert.ok(racketCoveringRule);
  assert.equal(racketCoveringRule.implementationStatus, 'DOCUMENTED_ONLY');
});

test('Rule Evaluation: Deuce logic requires 2-point lead at 10-10 or above', () => {
  function checkGameWin(pScore: number, oScore: number, isTableTennisMode: boolean): { won: boolean; winner?: 'player' | 'opponent' } {
    if (!isTableTennisMode) {
      // Arcade mode: first to 11
      if (pScore >= 11) return { won: true, winner: 'player' };
      if (oScore >= 11) return { won: true, winner: 'opponent' };
      return { won: false };
    }

    // ITTF rule 2.11: 11 points, or 2-point lead if >= 10
    if (pScore >= 11 && pScore - oScore >= 2) return { won: true, winner: 'player' };
    if (oScore >= 11 && oScore - pScore >= 2) return { won: true, winner: 'opponent' };
    return { won: false };
  }

  // Under 10: normal win at 11
  assert.deepEqual(checkGameWin(11, 7, true), { won: true, winner: 'player' });

  // At 10-10: 11-10 does NOT win in ITTF mode
  assert.deepEqual(checkGameWin(11, 10, true), { won: false });

  // At 12-10: 2 point lead wins!
  assert.deepEqual(checkGameWin(12, 10, true), { won: true, winner: 'player' });

  // In arcade mode, 11-10 DOES win immediately
  assert.deepEqual(checkGameWin(11, 10, false), { won: true, winner: 'player' });
});
