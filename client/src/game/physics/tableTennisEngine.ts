import {
  RallyState,
  GameDifficulty,
  RuleProfile,
  TableZoneDistribution,
} from '../../../../shared/types';
import {
  calculateReturnSuccessRate,
  calculateMissRate,
  calculateAverageRallyLength,
  calculateMedianRallyLength,
  calculateAverageReactionTime,
} from '../../../../shared/metrics';
import { sound } from '../../services/audio';

export interface BallState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  trail: Array<{ x: number; y: number; z: number }>;
}

export interface PaddleState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  width: number;
  height: number;
}

export interface GameEventPayload {
  type: string;
  detail?: any;
  timestamp: number;
}

export type GameEventListener = (event: GameEventPayload) => void;

export class TableTennisEngine {
  // Regulation Table dimensions (meters) - ITTF Statute §2.1
  public readonly TABLE_HALF_LENGTH = 1.37; // Total length = 2.74m
  public readonly TABLE_HALF_WIDTH = 0.7625; // Total width = 1.525m
  public readonly NET_HEIGHT = 0.1525; // Net height = 15.25cm (ITTF Statute §2.2)
  public readonly TABLE_Y = 0.0;
  public readonly GRAVITY = -9.81;

  // Ball & Paddles
  public ball: BallState = {
    x: 0,
    y: 0.35,
    z: 1.2,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 0.02, // 40mm diameter ping pong ball (ITTF Statute §2.3)
    trail: [],
  };

  public playerPaddle: PaddleState = {
    x: 0,
    y: 0.25,
    z: 1.55,
    vx: 0,
    vy: 0,
    vz: 0,
    width: 0.18,
    height: 0.18,
  };

  public opponentPaddle: PaddleState = {
    x: 0,
    y: 0.25,
    z: -1.55,
    vx: 0,
    vy: 0,
    vz: 0,
    width: 0.18,
    height: 0.18,
  };

  // State Machine & Rule Profiles
  public rallyState: RallyState = 'READY';
  public ruleProfile: RuleProfile = 'TABLE_TENNIS_TRAINING';
  public difficulty: GameDifficulty = 'easy';

  // Scoring & Stats
  public playerScore: number = 0;
  public opponentScore: number = 0;
  public rallyCount: number = 0;
  public longestRally: number = 0;
  public rallyLengths: number[] = [];
  public totalReturns: number = 0;
  public successfulReturns: number = 0;
  public missedReturns: number = 0;

  // Serve tracking
  public currentServer: 'player' | 'opponent' = 'player';
  public servePointsPlayed: number = 0;

  // Rally diagnostics & rules
  private lastHitter: 'player' | 'opponent' | 'none' = 'none';
  private bounceCountSinceHit: number = 0;
  private lastBounceSide: 'player' | 'opponent' | 'none' = 'none';
  private lastHitTime: number = 0;
  private listeners: GameEventListener[] = [];

  // Reaction time calculation (from opponent hit to player return)
  private opponentHitTime: number = 0;
  public reactionTimes: number[] = [];

  // Table zone hits for heatmap
  public tableZoneHits: TableZoneDistribution = {
    left: 0,
    center: 0,
    right: 0,
    deep: 0,
    short: 0,
  };

  // Deterministic seed support for Benchmarks
  private benchmarkRngSeed: number | null = null;

  constructor(difficulty: GameDifficulty = 'easy', ruleProfile: RuleProfile = 'TABLE_TENNIS_TRAINING') {
    this.difficulty = difficulty;
    this.ruleProfile = ruleProfile;
  }

  public setDifficulty(diff: GameDifficulty) {
    this.difficulty = diff;
  }

  public setRuleProfile(profile: RuleProfile) {
    this.ruleProfile = profile;
  }

  public setBenchmarkSeed(seed: number | null) {
    this.benchmarkRngSeed = seed;
  }

  private pseudoRandom(): number {
    if (this.benchmarkRngSeed === null) {
      return Math.random();
    }
    // LCG PRNG for deterministic benchmark runs
    this.benchmarkRngSeed = (this.benchmarkRngSeed * 1664525 + 1013904223) % 4294967296;
    return this.benchmarkRngSeed / 4294967296;
  }

  public addEventListener(listener: GameEventListener) {
    this.listeners.push(listener);
  }

  public removeEventListener(listener: GameEventListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private emit(type: string, detail?: any) {
    const payload: GameEventPayload = { type, detail, timestamp: Date.now() };
    for (const l of this.listeners) {
      l(payload);
    }
  }

  public startServe(server: 'player' | 'opponent' = 'player') {
    this.currentServer = server;
    this.rallyState = 'SERVE';
    this.rallyCount = 0;
    this.bounceCountSinceHit = 0;
    this.lastHitter = 'none';
    this.lastBounceSide = 'none';

    if (server === 'player') {
      this.ball.x = this.playerPaddle.x * 0.5;
      this.ball.y = 0.25;
      this.ball.z = 1.35;
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.vz = 0;
    } else {
      this.ball.x = 0;
      this.ball.y = 0.35;
      this.ball.z = -1.35;
      this.ball.vx = (this.pseudoRandom() - 0.5) * 0.8;
      this.ball.vy = 2.2;
      this.ball.vz = 4.2;
      this.lastHitter = 'opponent';
      this.opponentHitTime = Date.now();
      this.rallyState = 'RALLY';
      sound.playHit(0.9);
      this.emit('serve_started', { server: 'opponent' });
    }
  }

  public triggerPlayerServe() {
    if (this.rallyState !== 'SERVE') return;
    this.ball.vx = (this.playerPaddle.x + (this.pseudoRandom() - 0.5) * 0.2) * 1.5;
    this.ball.vy = 2.5;
    this.ball.vz = -4.5;
    this.lastHitter = 'player';
    this.rallyState = 'RALLY';
    this.lastHitTime = Date.now();
    sound.playHit(1.0);
    this.emit('serve_started', { server: 'player' });
    this.emit('ball_hit_player', { x: this.ball.x, z: this.ball.z });
  }

  public update(dt: number, playerInputX: number, playerInputY: number) {
    const step = Math.min(0.033, dt);

    // Update Player Paddle position from hand or keyboard input
    const targetX = playerInputX * (this.TABLE_HALF_WIDTH * 1.15);
    // Neutral hand (0.0) positions paddle at 0.22m (standard table tennis ball bounce height).
    // Full down (-1.0) lowers paddle to 0.04m (table surface for low chops).
    // Full up (+1.0) raises paddle to 0.46m (for high blocks and smashes).
    const targetY = Math.max(0.04, Math.min(0.55, 0.22 + playerInputY * 0.22));
    const targetZ = 1.55;

    this.playerPaddle.vx = (targetX - this.playerPaddle.x) / step;
    this.playerPaddle.vy = (targetY - this.playerPaddle.y) / step;
    this.playerPaddle.x = targetX;
    this.playerPaddle.y = targetY;
    this.playerPaddle.z = targetZ;

    // Update Opponent AI Paddle
    this.updateOpponentAI(step);

    if (this.rallyState === 'SERVE' && this.currentServer === 'player') {
      this.ball.x = this.playerPaddle.x;
      this.ball.y = this.playerPaddle.y + 0.05;
      this.ball.z = this.playerPaddle.z - 0.12;
      return;
    }

    if (this.rallyState !== 'RALLY') return;

    // Sub-stepping continuous collision detection (CCD)
    const substeps = 4;
    const subDt = step / substeps;

    for (let i = 0; i < substeps; i++) {
      this.physicsSubstep(subDt);
      if (this.rallyState !== 'RALLY') break;
    }

    // Update visual trajectory trail
    this.ball.trail.push({ x: this.ball.x, y: this.ball.y, z: this.ball.z });
    if (this.ball.trail.length > 18) {
      this.ball.trail.shift();
    }
  }

  private physicsSubstep(dt: number) {
    const airDrag = 0.05;
    this.ball.vx -= this.ball.vx * airDrag * dt;
    this.ball.vy += this.GRAVITY * dt;
    this.ball.vz -= this.ball.vz * airDrag * dt;

    const nextX = this.ball.x + this.ball.vx * dt;
    const nextY = this.ball.y + this.ball.vy * dt;
    const nextZ = this.ball.z + this.ball.vz * dt;

    // Check Net Collision (Continuous at z = 0)
    if (
      (this.ball.z <= 0 && nextZ >= 0) ||
      (this.ball.z >= 0 && nextZ <= 0)
    ) {
      const frac = Math.abs(this.ball.z) / Math.max(0.0001, Math.abs(nextZ - this.ball.z));
      const crossY = this.ball.y + (nextY - this.ball.y) * frac;
      const crossX = this.ball.x + (nextX - this.ball.x) * frac;

      if (
        Math.abs(crossX) <= this.TABLE_HALF_WIDTH &&
        crossY >= this.TABLE_Y &&
        crossY <= this.TABLE_Y + this.NET_HEIGHT
      ) {
        // Hit net
        this.ball.vz = -this.ball.vz * 0.3;
        this.ball.vy = Math.max(0.5, this.ball.vy * 0.4);
        sound.playNet();
        this.emit('ball_hit_net');
      }
    }

    // Check Table Surface Collision
    if (
      this.ball.y >= this.TABLE_Y &&
      nextY <= this.TABLE_Y &&
      this.ball.vy < 0
    ) {
      const frac = (this.ball.y - this.TABLE_Y) / Math.max(0.0001, this.ball.y - nextY);
      const hitX = this.ball.x + (nextX - this.ball.x) * frac;
      const hitZ = this.ball.z + (nextZ - this.ball.z) * frac;

      if (
        Math.abs(hitX) <= this.TABLE_HALF_WIDTH &&
        Math.abs(hitZ) <= this.TABLE_HALF_LENGTH
      ) {
        // Legal table bounce
        const bounceSide = hitZ > 0 ? 'player' : 'opponent';
        this.ball.y = this.TABLE_Y + 0.001;
        this.ball.vy = -this.ball.vy * 0.88; // 0.88 restitution (ITTF §2.1.3 uniform bounce)
        sound.playBounce(Math.abs(this.ball.vy) / 4.0);

        this.bounceCountSinceHit++;
        this.lastBounceSide = bounceSide;

        if (bounceSide === 'player') {
          this.recordTableZone(hitX, hitZ);
        }

        this.emit('ball_bounce_table', { side: bounceSide, x: hitX, z: hitZ });

        // Double bounce check
        if (this.bounceCountSinceHit > 1) {
          if (bounceSide === 'player') {
            this.missedReturns++;
            this.endPoint('opponent', 'Double bounce on player side');
          } else {
            this.endPoint('player', 'Double bounce on opponent side');
          }
          return;
        }

        this.ball.x = nextX;
        this.ball.z = nextZ;
        return;
      }
    }

    // Floor contact / Miss evaluation
    if (nextY <= -0.4) {
      if (this.lastHitter === 'player') {
        if (this.bounceCountSinceHit === 0) {
          this.endPoint('opponent', 'Player hit out of bounds directly');
        } else if (this.lastBounceSide === 'opponent') {
          this.endPoint('player', 'Opponent missed return');
        } else {
          this.endPoint('opponent', 'Ball out');
        }
      } else if (this.lastHitter === 'opponent') {
        if (this.bounceCountSinceHit === 0) {
          this.endPoint('player', 'Opponent hit out of bounds');
        } else if (this.lastBounceSide === 'player') {
          this.missedReturns++;
          this.endPoint('opponent', 'Player missed return');
        } else {
          this.endPoint('player', 'Ball out');
        }
      }
      return;
    }

    // Check Player Paddle Collision
    const now = Date.now();
    const inPlayerZRange =
      this.ball.vz > 0 &&
      nextZ >= this.playerPaddle.z - 0.16 &&
      this.ball.z <= this.playerPaddle.z + 0.16;

    if (inPlayerZRange && now - this.lastHitTime > 120) {
      const dx = nextX - this.playerPaddle.x;
      const dy = nextY - this.playerPaddle.y;

      // Generous hit box for hand tracking & responsive arcade feel
      const hitRadiusX = 0.26;
      const hitRadiusY = 0.24;

      if (Math.abs(dx) <= hitRadiusX && Math.abs(dy) <= hitRadiusY) {
        this.lastHitTime = now;
        this.lastHitter = 'player';
        this.bounceCountSinceHit = 0;
        this.totalReturns++;
        this.successfulReturns++;
        this.rallyCount++;
        if (this.rallyCount > this.longestRally) {
          this.longestRally = this.rallyCount;
        }

        if (this.opponentHitTime > 0) {
          const reactionTime = now - this.opponentHitTime;
          this.reactionTimes.push(reactionTime);
          this.opponentHitTime = 0;
        }

        const horizontalDeflection = Math.max(-1.5, Math.min(1.5, dx / 0.14));
        this.ball.vx = horizontalDeflection * 2.2 + this.playerPaddle.vx * 0.25;
        this.ball.vy = Math.max(1.8, 2.2 + (this.playerPaddle.vy > 0 ? this.playerPaddle.vy * 0.2 : 0));

        const speedBonus = this.ruleProfile === 'ARCADE_PONG' ? Math.min(1.6, 1 + this.rallyCount * 0.03) : 1.0;
        const baseSpeed = (this.difficulty === 'hard' ? -5.8 : this.difficulty === 'medium' ? -5.0 : -4.3) * speedBonus;
        this.ball.vz = baseSpeed;

        // Push ball cleanly in front of paddle to prevent sticking/tunneling
        this.ball.z = this.playerPaddle.z - 0.06;

        sound.playHit(1.0);
        this.emit('ball_hit_player', {
          x: nextX,
          y: nextY,
          rallyCount: this.rallyCount,
          reactionTime: this.reactionTimes[this.reactionTimes.length - 1],
        });
      }
    }

    // Check Opponent Paddle Collision
    const inOpponentZRange =
      this.ball.vz < 0 &&
      nextZ <= this.opponentPaddle.z + 0.16 &&
      this.ball.z >= this.opponentPaddle.z - 0.16;

    if (inOpponentZRange && now - this.lastHitTime > 120) {
      const dx = nextX - this.opponentPaddle.x;
      const dy = nextY - this.opponentPaddle.y;

      if (Math.abs(dx) <= 0.26 && Math.abs(dy) <= 0.24) {
        this.lastHitTime = now;
        this.lastHitter = 'opponent';
        this.bounceCountSinceHit = 0;
        this.opponentHitTime = now;

        const deflection = Math.max(-1.5, Math.min(1.5, dx / 0.14));
        this.ball.vx = -deflection * 1.6;
        this.ball.vy = 2.0 + this.pseudoRandom() * 0.35;
        const returnZSpeed = this.difficulty === 'hard' ? 5.4 : this.difficulty === 'medium' ? 4.6 : 3.9;
        this.ball.vz = returnZSpeed;

        // Push ball cleanly in front of opponent paddle
        this.ball.z = this.opponentPaddle.z + 0.06;

        sound.playHit(0.85);
        this.emit('ball_hit_opponent', { x: nextX, y: nextY });
      }
    }

    // Out of bounds emergency check
    if (nextY < -0.6 || Math.abs(nextZ) > 2.5 || Math.abs(nextX) > 2.0) {
      if (this.lastHitter === 'player') {
        this.endPoint(this.lastBounceSide === 'opponent' ? 'player' : 'opponent', 'Out of bounds');
      } else {
        this.missedReturns++;
        this.endPoint(this.lastBounceSide === 'player' ? 'opponent' : 'player', 'Out of bounds');
      }
      return;
    }

    this.ball.x = nextX;
    this.ball.y = nextY;
    this.ball.z = nextZ;
  }

  private updateOpponentAI(dt: number) {
    let targetX = 0;
    let targetY = 0.25;

    if (this.ball.vz < 0) {
      const timeToIntercept = (this.opponentPaddle.z - this.ball.z) / this.ball.vz;
      if (timeToIntercept > 0 && timeToIntercept < 2.0) {
        targetX = this.ball.x + this.ball.vx * timeToIntercept;
        targetY = Math.max(0.08, this.ball.y + this.ball.vy * timeToIntercept + 0.5 * this.GRAVITY * timeToIntercept * timeToIntercept);
      }
    }

    let maxSpeed = 2.8;
    let noise = 0.08;
    if (this.difficulty === 'medium') {
      maxSpeed = 4.2;
      noise = 0.04;
    } else if (this.difficulty === 'hard') {
      maxSpeed = 6.2;
      noise = 0.01;
    }

    targetX = Math.max(
      -this.TABLE_HALF_WIDTH * 1.1,
      Math.min(this.TABLE_HALF_WIDTH * 1.1, targetX + (this.pseudoRandom() - 0.5) * noise)
    );
    targetY = Math.max(0.1, Math.min(0.5, targetY));

    const dx = targetX - this.opponentPaddle.x;
    const dy = targetY - this.opponentPaddle.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.001) {
      const step = Math.min(dist, maxSpeed * dt);
      this.opponentPaddle.x += (dx / dist) * step;
      this.opponentPaddle.y += (dy / dist) * step;
    }
  }

  private recordTableZone(x: number, z: number) {
    if (x < -0.25) this.tableZoneHits.left++;
    else if (x > 0.25) this.tableZoneHits.right++;
    else this.tableZoneHits.center++;

    if (z < -0.7) this.tableZoneHits.deep++;
    else this.tableZoneHits.short++;
  }

  private endPoint(winner: 'player' | 'opponent', reason: string) {
    this.rallyState = 'POINT_END';
    this.rallyLengths.push(this.rallyCount);

    if (winner === 'player') {
      this.playerScore++;
      sound.playPointWon();
      this.emit('point_won_player', { score: this.playerScore, reason });
    } else {
      this.opponentScore++;
      sound.playPointLost();
      this.emit('point_won_opponent', { score: this.opponentScore, reason });
    }

    this.emit('rally_ended', {
      rallyLength: this.rallyCount,
      winner,
      reason,
      playerScore: this.playerScore,
      opponentScore: this.opponentScore,
    });

    // Determine next server based on rule profile
    this.servePointsPlayed++;
    let nextServer = this.currentServer;

    if (this.ruleProfile === 'TABLE_TENNIS_TRAINING') {
      // ITTF §2.13: Serves alternate every 2 points.
      // At deuce (10-10 or more), serves alternate after every 1 point.
      const isDeuce = this.playerScore >= 10 && this.opponentScore >= 10;
      const switchThreshold = isDeuce ? 1 : 2;

      if (this.servePointsPlayed >= switchThreshold) {
        nextServer = this.currentServer === 'player' ? 'opponent' : 'player';
        this.servePointsPlayed = 0;
      }
    } else {
      // Arcade mode: Winner of point serves next
      nextServer = winner === 'player' ? 'player' : 'opponent';
    }

    // Check Match Completion
    const matchFinished = this.checkMatchWon();

    if (matchFinished.finished) {
      this.rallyState = 'MATCH_OVER';
      this.emit('match_completed', {
        playerScore: this.playerScore,
        opponentScore: this.opponentScore,
        winner: matchFinished.winner,
        ruleProfile: this.ruleProfile,
      });
    } else {
      setTimeout(() => {
        if (this.rallyState === 'POINT_END') {
          this.startServe(nextServer);
        }
      }, 1600);
    }
  }

  private checkMatchWon(): { finished: boolean; winner?: 'player' | 'opponent' } {
    if (this.ruleProfile === 'TABLE_TENNIS_TRAINING') {
      // ITTF Statute §2.11: 11 points and 2-point lead required
      if (this.playerScore >= 11 && this.playerScore - this.opponentScore >= 2) {
        return { finished: true, winner: 'player' };
      }
      if (this.opponentScore >= 11 && this.opponentScore - this.playerScore >= 2) {
        return { finished: true, winner: 'opponent' };
      }
      return { finished: false };
    }

    // ARCADE_PONG: First to 7 or 11 points wins immediately
    const ARCADE_TARGET = 7;
    if (this.playerScore >= ARCADE_TARGET) return { finished: true, winner: 'player' };
    if (this.opponentScore >= ARCADE_TARGET) return { finished: true, winner: 'opponent' };
    return { finished: false };
  }

  public resetMatch() {
    this.playerScore = 0;
    this.opponentScore = 0;
    this.rallyCount = 0;
    this.longestRally = 0;
    this.rallyLengths = [];
    this.totalReturns = 0;
    this.successfulReturns = 0;
    this.missedReturns = 0;
    this.servePointsPlayed = 0;
    this.reactionTimes = [];
    this.tableZoneHits = { left: 0, center: 0, right: 0, deep: 0, short: 0 };
    this.startServe('player');
    this.emit('match_started');
  }

  public getReturnSuccessRate(): number | null {
    const eligible = this.successfulReturns + this.missedReturns;
    return calculateReturnSuccessRate(this.successfulReturns, eligible);
  }

  public getMissRate(): number | null {
    const eligible = this.successfulReturns + this.missedReturns;
    return calculateMissRate(this.missedReturns, eligible);
  }

  public getAverageReactionTime(): number | null {
    return calculateAverageReactionTime(this.reactionTimes);
  }

  public getAverageRallyLength(): number | null {
    const completedRallies = this.playerScore + this.opponentScore;
    return calculateAverageRallyLength(this.totalReturns, completedRallies);
  }

  public getMedianRallyLength(): number | null {
    return calculateMedianRallyLength(this.rallyLengths);
  }

  private previousRallyStateBeforePause: RallyState = 'READY';

  public pause(): void {
    if (this.rallyState !== 'PAUSED') {
      this.previousRallyStateBeforePause = this.rallyState;
      this.rallyState = 'PAUSED';
      this.emit('game_paused');
    }
  }

  public resume(): void {
    if (this.rallyState === 'PAUSED') {
      this.rallyState = this.previousRallyStateBeforePause;
      this.emit('game_resumed');
    }
  }

  public getPlayerAssistancePrediction(): {
    active: boolean;
    targetX: number;
    targetY: number;
    targetZ: number;
    timeToArrival: number;
    timingCue: 'EARLY' | 'READY' | 'LATE' | 'NONE';
  } {
    if (this.rallyState !== 'RALLY' || this.ball.vz <= 0) {
      return { active: false, targetX: 0, targetY: 0.25, targetZ: this.playerPaddle.z, timeToArrival: 0, timingCue: 'NONE' };
    }
    const timeToIntercept = (this.playerPaddle.z - this.ball.z) / this.ball.vz;
    if (timeToIntercept <= 0 || timeToIntercept > 2.5) {
      return { active: false, targetX: 0, targetY: 0.25, targetZ: this.playerPaddle.z, timeToArrival: 0, timingCue: 'NONE' };
    }
    const predX = Math.max(
      -this.TABLE_HALF_WIDTH * 1.15,
      Math.min(this.TABLE_HALF_WIDTH * 1.15, this.ball.x + this.ball.vx * timeToIntercept)
    );
    const predY = Math.max(
      0.08,
      Math.min(0.65, this.ball.y + this.ball.vy * timeToIntercept + 0.5 * this.GRAVITY * timeToIntercept * timeToIntercept)
    );

    let timingCue: 'EARLY' | 'READY' | 'LATE' | 'NONE' = 'READY';
    if (timeToIntercept > 0.45) timingCue = 'EARLY';
    else if (timeToIntercept < 0.12) timingCue = 'LATE';

    return {
      active: true,
      targetX: predX,
      targetY: predY,
      targetZ: this.playerPaddle.z,
      timeToArrival: timeToIntercept,
      timingCue,
    };
  }
}


