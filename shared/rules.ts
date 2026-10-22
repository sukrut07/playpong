// =====================================================================
// PONG AI — Versioned Rule Registry
// =====================================================================
// Reference: ITTF Statutes 2026 (effective 1 January 2026)
// Chapter 2: The Laws of Table Tennis
// URL: https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf

import { GameRule } from './types';

export const RULE_REGISTRY: GameRule[] = [
  // -------------------------------------------------------------------
  // TABLE_TENNIS_TRAINING Profile (ITTF Statutes 2026)
  // -------------------------------------------------------------------
  {
    ruleId: 'ITTF-2.1',
    ruleSet: 'TABLE_TENNIS_TRAINING',
    title: 'The Table Dimensions & Surface',
    description:
      'The upper surface of the table shall be rectangular, 2.74m in length and 1.525m in width, horizontal at 76cm above the floor. It shall yield a uniform bounce of about 23cm when a standard ball is dropped from 30cm.',
    sourceOrganisation: 'International Table Tennis Federation (ITTF)',
    sourceDocument: 'ITTF Statutes 2026 — Chapter 2: The Laws of Table Tennis',
    sourceVersion: '2026-01-01 Consolidated',
    sourceSection: '§2.1.1, §2.1.3',
    sourceUrl: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations:
      'Exact 2.74m x 1.525m dimensions modeled in 3D physics. Surface restitution modeled at 0.88 coefficient for uniform rebound.',
    tests: ['engine_vision.test.ts', 'rules_evaluator.test.ts'],
  },
  {
    ruleId: 'ITTF-2.2',
    ruleSet: 'TABLE_TENNIS_TRAINING',
    title: 'The Net Assembly',
    description:
      'The net assembly shall consist of the net, its suspension, and the supporting posts. The top of the net along its whole length shall be 15.25cm above the playing surface.',
    sourceOrganisation: 'ITTF',
    sourceDocument: 'ITTF Statutes 2026',
    sourceVersion: '2026-01-01',
    sourceSection: '§2.2.1, §2.2.4',
    sourceUrl: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations:
      'Modeled at z=0 with exact height of 0.1525m. Ball trajectory sub-stepping tests net collision and dampens forward velocity.',
    tests: ['engine_vision.test.ts', 'rules_evaluator.test.ts'],
  },
  {
    ruleId: 'ITTF-2.3',
    ruleSet: 'TABLE_TENNIS_TRAINING',
    title: 'The Ball Specifications',
    description:
      'The ball shall be spherical, with a diameter of 40mm and weigh 2.7g, made of celluloid or similar plastics material.',
    sourceOrganisation: 'ITTF',
    sourceDocument: 'ITTF Statutes 2026',
    sourceVersion: '2026-01-01',
    sourceSection: '§2.3.1, §2.3.2',
    sourceUrl: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations:
      'Ball radius set to 0.02m (40mm diameter). Aerodynamic drag factor applied per substep.',
    tests: ['engine_vision.test.ts'],
  },
  {
    ruleId: 'ITTF-2.5',
    ruleSet: 'TABLE_TENNIS_TRAINING',
    title: 'Definitions: Rally, Let, and Point',
    description:
      'A rally is the period during which the ball is in play. A let is a rally of which the result is not scored. A point is a rally of which the result is scored.',
    sourceOrganisation: 'ITTF',
    sourceDocument: 'ITTF Statutes 2026',
    sourceVersion: '2026-01-01',
    sourceSection: '§2.5.1, §2.5.2, §2.5.3',
    sourceUrl: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations:
      'Managed directly by the finite state machine: READY -> SERVE -> RALLY -> POINT_END.',
    tests: ['engine_vision.test.ts', 'rules_evaluator.test.ts'],
  },
  {
    ruleId: 'ITTF-2.6',
    ruleSet: 'TABLE_TENNIS_TRAINING',
    title: 'The Service Execution',
    description:
      'Service shall begin with the ball resting freely on the open palm of the server stationary free hand. The server shall toss the ball vertically upwards without imparting spin, at least 16cm high.',
    sourceOrganisation: 'ITTF',
    sourceDocument: 'ITTF Statutes 2026',
    sourceVersion: '2026-01-01',
    sourceSection: '§2.6.1, §2.6.2',
    sourceUrl: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'PARTIALLY_SIMULATED',
    limitations:
      'Alternating server rotation and serve timing are enforced. Physical 16cm palm toss cannot be verified without high-speed multi-angle cameras.',
    tests: ['rules_evaluator.test.ts'],
  },
  {
    ruleId: 'ITTF-2.7',
    ruleSet: 'TABLE_TENNIS_TRAINING',
    title: 'The Return',
    description:
      'The ball, having been served or returned, shall be struck so that it touches the opponent’s court, either directly or after touching the net assembly.',
    sourceOrganisation: 'ITTF',
    sourceDocument: 'ITTF Statutes 2026',
    sourceVersion: '2026-01-01',
    sourceSection: '§2.7.1',
    sourceUrl: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations:
      'Enforced via table boundary checks and bounce detectors.',
    tests: ['engine_vision.test.ts', 'rules_evaluator.test.ts'],
  },
  {
    ruleId: 'ITTF-2.9',
    ruleSet: 'TABLE_TENNIS_TRAINING',
    title: 'A Let (Service Let)',
    description:
      'The rally shall be a let if in service the ball touches the net assembly, provided the service is otherwise correct or the ball is obstructed by the receiver.',
    sourceOrganisation: 'ITTF',
    sourceDocument: 'ITTF Statutes 2026',
    sourceVersion: '2026-01-01',
    sourceSection: '§2.9.1.1',
    sourceUrl: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'PARTIALLY_SIMULATED',
    limitations:
      'If ball clips net on initial serve and lands legally on opponent table, rally resets to let without scoring.',
    tests: ['rules_evaluator.test.ts'],
  },
  {
    ruleId: 'ITTF-2.10',
    ruleSet: 'TABLE_TENNIS_TRAINING',
    title: 'A Point Scoring Conditions',
    description:
      'A player scores a point if an opponent fails to make a correct service or return, or if the ball touches anything other than the net before being struck.',
    sourceOrganisation: 'ITTF',
    sourceDocument: 'ITTF Statutes 2026',
    sourceVersion: '2026-01-01',
    sourceSection: '§2.10.1',
    sourceUrl: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations:
      'Points awarded when ball misses paddle plane, double-bounces on table, or sails out of bounds.',
    tests: ['rules_evaluator.test.ts'],
  },
  {
    ruleId: 'ITTF-2.11',
    ruleSet: 'TABLE_TENNIS_TRAINING',
    title: 'A Game (11 Points & Deuce Rule)',
    description:
      'A game shall be won by the player or pair first scoring 11 points unless both players score 10 points, when the game shall be won by the first player or pair subsequently gaining a lead of 2 points.',
    sourceOrganisation: 'ITTF',
    sourceDocument: 'ITTF Statutes 2026',
    sourceVersion: '2026-01-01',
    sourceSection: '§2.11.1',
    sourceUrl: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations:
      'Full 11-point threshold and 2-point lead deuce logic strictly implemented.',
    tests: ['rules_evaluator.test.ts'],
  },
  {
    ruleId: 'ITTF-2.4',
    ruleSet: 'TABLE_TENNIS_TRAINING',
    title: 'Racket Blade and Covering Specifications',
    description:
      'The racket may be of any size, shape, or weight but the blade shall be flat and rigid. At least 85% of the blade by thickness shall be of natural wood. The covering side used for striking shall be covered with ordinary pimpled rubber or sandwich rubber.',
    sourceOrganisation: 'ITTF',
    sourceDocument: 'ITTF Statutes 2026',
    sourceVersion: '2026-01-01',
    sourceSection: '§2.4.1 - §2.4.6',
    sourceUrl: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_clean.pdf',
    effectiveDate: '2026-01-01',
    implemented: false,
    implementationStatus: 'DOCUMENTED_ONLY',
    limitations:
      'Physical rubber thickness (max 4.0mm) and blade composition cannot be physically evaluated by browser webcam.',
    tests: [],
  },

  // -------------------------------------------------------------------
  // ARCADE_PONG Profile
  // -------------------------------------------------------------------
  {
    ruleId: 'ARCADE-01',
    ruleSet: 'ARCADE_PONG',
    title: 'Arcade Instant Respawn Serve',
    description:
      'Following any scored point, the ball automatically respawns directly in front of the active player paddle with zero penalty delays.',
    sourceOrganisation: 'PONG AI Studio',
    sourceDocument: 'PONG AI Arcade Game Rules Specification',
    sourceVersion: '1.0',
    sourceSection: 'Section 1.1',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations: 'Custom arcade mechanics designed for instant, high-cadence gameplay.',
    tests: ['engine_vision.test.ts', 'rules_evaluator.test.ts'],
  },
  {
    ruleId: 'ARCADE-02',
    ruleSet: 'ARCADE_PONG',
    title: 'Arcade Boundary Deflection & Miss Conditions',
    description:
      'Lateral boundaries reflect the ball inside the playfield; the ball is considered missed only once it completely crosses the player paddle plane.',
    sourceOrganisation: 'PONG AI Studio',
    sourceDocument: 'PONG AI Arcade Game Rules Specification',
    sourceVersion: '1.0',
    sourceSection: 'Section 1.2',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations: 'Simplifies table physics to encourage continuous rallies.',
    tests: ['engine_vision.test.ts'],
  },
  {
    ruleId: 'ARCADE-03',
    ruleSet: 'ARCADE_PONG',
    title: 'Arcade First to Target Score',
    description:
      'The match concludes immediately when either the human player or AI opponent reaches the configured target score (default 7 or 11 points). No deuce margin is required in Arcade mode.',
    sourceOrganisation: 'PONG AI Studio',
    sourceDocument: 'PONG AI Arcade Game Rules Specification',
    sourceVersion: '1.0',
    sourceSection: 'Section 1.3',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations: 'Fixed target score without requirement for two-point lead.',
    tests: ['rules_evaluator.test.ts'],
  },
  {
    ruleId: 'ARCADE-04',
    ruleSet: 'ARCADE_PONG',
    title: 'Arcade Rally Velocity Scaling',
    description:
      'During a single rally, each successive return increments the ball velocity by 3% up to a maximum multiplier of 1.6x.',
    sourceOrganisation: 'PONG AI Studio',
    sourceDocument: 'PONG AI Arcade Game Rules Specification',
    sourceVersion: '1.0',
    sourceSection: 'Section 1.4',
    effectiveDate: '2026-01-01',
    implemented: true,
    implementationStatus: 'IMPLEMENTED_AND_TESTED',
    limitations: 'Adds dynamic arcade tension to long rallies.',
    tests: ['engine_vision.test.ts'],
  },
];

export function getRulesByProfile(profile: 'ARCADE_PONG' | 'TABLE_TENNIS_TRAINING'): GameRule[] {
  return RULE_REGISTRY.filter((r) => r.ruleSet === profile);
}

export function getRuleById(ruleId: string): GameRule | undefined {
  return RULE_REGISTRY.find((r) => r.ruleId === ruleId);
}
