import { RallyState, GameDifficulty, TableZoneDistribution } from '../../../../shared/types';
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
  // Table dimensions (meters)
  public readonly TABLE_HALF_LENGTH = 1.37; // Total length = 2.74m
  public readonly TABLE_HALF_WIDTH = 0.7625; // Total width = 1.525m
  public readonly NET_HEIGHT = 0.1525;
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
    radius: 0.02, // 40mm diameter ping pong ball
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

  // State Machine
  public rallyState: RallyState = 'READY';
  public playerScore: number = 0;
  public opponentScore: number = 0;
  public rallyCount: number = 0;
  public longestRally: number = 0;
  public totalReturns: number = 0;
  public successfulReturns: number = 0;
  public difficulty: GameDifficulty = 'easy';

  // Rally diagnostics & rules
  private lastHitter: 'player' | 'opponent' | 'none' = 'none';
  private bounceCountSinceHit: number = 0;
  private lastBounceSide: 'player' | 'opponent' | 'none' = 'none';
  private lastHitTime: number = 0;
  private lastBounceTime: number = 0;
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

  constructor(difficulty: GameDifficulty = 'easy') {
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: GameDifficulty) {
    this.difficulty = diff;
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
      this.ball.vx = (Math.random() - 0.5) * 0.8;
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
    this.ball.vx = (this.playerPaddle.x + (Math.random() - 0.5) * 0.2) * 1.5;
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
    // Clamp delta time to avoid large physics steps
    const step = Math.min(0.033, dt);

    // Update Player Paddle position from hand/keyboard input
    // Input is [-1, 1], map to table bounds with reach
    const targetX = playerInputX * (this.TABLE_HALF_WIDTH * 1.2);
    const targetY = 0.08 + Math.max(0, playerInputY + 1.0) * 0.3; // Height from table: 0.08m to 0.68m
    const targetZ = 1.55;

    this.playerPaddle.vx = (targetX - this.playerPaddle.x) / step;
    this.playerPaddle.vy = (targetY - this.playerPaddle.y) / step;
    this.playerPaddle.x = targetX;
    this.playerPaddle.y = targetY;
    this.playerPaddle.z = targetZ;

    // Update Opponent AI Paddle
    this.updateOpponentAI(step);

    // In SERVE state with player serving, hold ball near paddle
    if (this.rallyState === 'SERVE') {
      this.ball.x = this.playerPaddle.x;
      this.ball.y = this.playerPaddle.y + 0.05;
      this.ball.z = this.playerPaddle.z - 0.15;
      return;
    }

    if (this.rallyState !== 'RALLY') return;

    // Sub-stepping continuous collision physics (4 substeps per frame)
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
    // Air resistance and gravity
    const airDrag = 0.05;
    this.ball.vx -= this.ball.vx * airDrag * dt;
    this.ball.vy += this.GRAVITY * dt;
    this.ball.vz -= this.ball.vz * airDrag * dt;

    // Integrate position
    const nextX = this.ball.x + this.ball.vx * dt;
    const nextY = this.ball.y + this.ball.vy * dt;
    const nextZ = this.ball.z + this.ball.vz * dt;

    // Check Continuous Collision with Net
    // Net is at z = 0, y from 0 to NET_HEIGHT, x from -TABLE_HALF_WIDTH to +TABLE_HALF_WIDTH
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
        // Hit net!
        this.ball.vz = -this.ball.vz * 0.3;
        this.ball.vy = Math.max(0.5, this.ball.vy * 0.4);
        sound.playNet();
        this.emit('ball_hit_net');
      }
    }

    // Check Table Collision (Y = TABLE_Y)
    if (this.ball.y >= this.TABLE_Y && nextY <= this.TABLE_Y) {
      // Check if within table boundaries
      if (
        Math.abs(nextX) <= this.TABLE_HALF_WIDTH &&
        Math.abs(nextZ) <= this.TABLE_HALF_LENGTH
      ) {
        // Valid table bounce
        this.ball.y = this.TABLE_Y + this.ball.radius;
        this.ball.vy = -this.ball.vy * 0.88; // Restitution
        this.bounceCountSinceHit++;
        this.lastBounceTime = Date.now();
        sound.playBounce();

        const side = nextZ > 0 ? 'player' : 'opponent';
        this.lastBounceSide = side;

        // Record zone hit for player return
        if (side === 'opponent' && this.lastHitter === 'player') {
          this.recordTableZone(nextX, nextZ);
        }

        this.emit('ball_bounce_table', { side, x: nextX, z: nextZ });

        // Rules check on table bounce
        if (this.bounceCountSinceHit > 1) {
          // Ball bounced twice on the same side without paddle hit
          if (side === 'opponent') {
            // Player wins point (opponent failed to return)
            this.endPoint('player', 'Opponent double bounce');
            return;
          } else {
            // Opponent wins point (player failed to return)
            this.endPoint('opponent', 'Player double bounce');
            return;
          }
        }
      } else {
        // Hit floor or missed table completely
        if (this.lastHitter === 'player') {
          if (this.bounceCountSinceHit === 0) {
            // Player hit out of bounds directly
            this.endPoint('opponent', 'Player hit out of bounds');
          } else if (this.lastBounceSide === 'opponent') {
            // Bounced on opponent table then landed on floor -> Player scores!
            this.endPoint('player', 'Opponent missed return');
          } else {
            this.endPoint('opponent', 'Ball out');
          }
        } else if (this.lastHitter === 'opponent') {
          if (this.bounceCountSinceHit === 0) {
            // Opponent hit out of bounds directly
            this.endPoint('player', 'Opponent hit out of bounds');
          } else if (this.lastBounceSide === 'player') {
            // Bounced on player table then floor -> Opponent scores!
            this.endPoint('opponent', 'Player missed return');
          } else {
            this.endPoint('player', 'Ball out');
          }
        }
        return;
      }
    }

    // Check Player Paddle Collision
    // Paddle at Z = 1.55, moving forward towards -Z
    const now = Date.now();
    if (
      this.ball.vz > 0 &&
      nextZ >= this.playerPaddle.z - 0.08 &&
      this.ball.z <= this.playerPaddle.z + 0.08 &&
      now - this.lastHitTime > 180
    ) {
      const dx = nextX - this.playerPaddle.x;
      const dy = nextY - this.playerPaddle.y;

      if (
        Math.abs(dx) <= this.playerPaddle.width * 0.8 &&
        Math.abs(dy) <= this.playerPaddle.height * 0.8
      ) {
        // Player hit ball!
        this.lastHitTime = now;
        this.lastHitter = 'player';
        this.bounceCountSinceHit = 0;
        this.totalReturns++;
        this.successfulReturns++;
        this.rallyCount++;
        if (this.rallyCount > this.longestRally) {
          this.longestRally = this.rallyCount;
        }

        // Measure reaction time if coming from opponent
        if (this.opponentHitTime > 0) {
          const reactionTime = now - this.opponentHitTime;
          this.reactionTimes.push(reactionTime);
          this.opponentHitTime = 0;
        }

        // Return velocity with paddle deflection & swing push
        const horizontalDeflection = dx / (this.playerPaddle.width * 0.5);
        this.ball.vx = horizontalDeflection * 2.2 + this.playerPaddle.vx * 0.3;
        this.ball.vy = Math.max(1.8, 2.2 + (this.playerPaddle.vy > 0 ? this.playerPaddle.vy * 0.2 : 0));
        // Speed up return based on difficulty
        const baseSpeed = this.difficulty === 'hard' ? -5.8 : this.difficulty === 'medium' ? -5.0 : -4.3;
        this.ball.vz = baseSpeed;

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
    // Paddle at Z = -1.55, ball traveling towards -Z
    if (
      this.ball.vz < 0 &&
      nextZ <= this.opponentPaddle.z + 0.08 &&
      this.ball.z >= this.opponentPaddle.z - 0.08 &&
      now - this.lastHitTime > 180
    ) {
      const dx = nextX - this.opponentPaddle.x;
      const dy = nextY - this.opponentPaddle.y;

      if (
        Math.abs(dx) <= this.opponentPaddle.width * 0.85 &&
        Math.abs(dy) <= this.opponentPaddle.height * 0.85
      ) {
        // Opponent returned ball!
        this.lastHitTime = now;
        this.lastHitter = 'opponent';
        this.bounceCountSinceHit = 0;
        this.opponentHitTime = now;

        const deflection = dx / (this.opponentPaddle.width * 0.5);
        this.ball.vx = -deflection * 1.8;
        this.ball.vy = 2.0 + Math.random() * 0.4;
        const returnZSpeed = this.difficulty === 'hard' ? 5.5 : this.difficulty === 'medium' ? 4.7 : 4.0;
        this.ball.vz = returnZSpeed;

        sound.playHit(0.85);
        this.emit('ball_hit_opponent', { x: nextX, y: nextY });
      }
    }

    // Out of bounds emergency check (fallen off or traveled too far behind)
    if (nextY < -0.6 || Math.abs(nextZ) > 2.5 || Math.abs(nextX) > 2.0) {
      if (this.lastHitter === 'player') {
        this.endPoint(this.lastBounceSide === 'opponent' ? 'player' : 'opponent', 'Out of bounds');
      } else {
        this.endPoint(this.lastBounceSide === 'player' ? 'opponent' : 'player', 'Out of bounds');
      }
      return;
    }

    // Advance position
    this.ball.x = nextX;
    this.ball.y = nextY;
    this.ball.z = nextZ;
  }

  private updateOpponentAI(dt: number) {
    // Only track ball if moving towards opponent
    let targetX = 0;
    let targetY = 0.25;

    if (this.ball.vz < 0) {
      // Predict interception point at z = -1.55
      const timeToIntercept = (this.opponentPaddle.z - this.ball.z) / this.ball.vz;
      if (timeToIntercept > 0 && timeToIntercept < 2.0) {
        targetX = this.ball.x + this.ball.vx * timeToIntercept;
        targetY = Math.max(0.08, this.ball.y + this.ball.vy * timeToIntercept + 0.5 * this.GRAVITY * timeToIntercept * timeToIntercept);
      }
    }

    // Difficulty tuning for opponent speed and imperfection
    let maxSpeed = 2.8; // easy m/s
    let noise = 0.08;
    if (this.difficulty === 'medium') {
      maxSpeed = 4.2;
      noise = 0.04;
    } else if (this.difficulty === 'hard') {
      maxSpeed = 6.2;
      noise = 0.01;
    }

    // Clamp target within realistic reach
    targetX = Math.max(-this.TABLE_HALF_WIDTH * 1.1, Math.min(this.TABLE_HALF_WIDTH * 1.1, targetX + (Math.random() - 0.5) * noise));
    targetY = Math.max(0.1, Math.min(0.5, targetY));

    // Smooth movement towards target
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

    // Check match completion (First to 7 or 11)
    const WINNING_SCORE = 7;
    if (this.playerScore >= WINNING_SCORE || this.opponentScore >= WINNING_SCORE) {
      this.rallyState = 'MATCH_OVER';
      this.emit('match_completed', {
        playerScore: this.playerScore,
        opponentScore: this.opponentScore,
        winner: this.playerScore > this.opponentScore ? 'player' : 'opponent',
      });
    } else {
      // Auto queue next serve after brief pause
      setTimeout(() => {
        if (this.rallyState === 'POINT_END') {
          this.startServe(winner === 'player' ? 'player' : 'opponent');
        }
      }, 1600);
    }
  }

  public resetMatch() {
    this.playerScore = 0;
    this.opponentScore = 0;
    this.rallyCount = 0;
    this.totalReturns = 0;
    this.successfulReturns = 0;
    this.reactionTimes = [];
    this.tableZoneHits = { left: 0, center: 0, right: 0, deep: 0, short: 0 };
    this.startServe('player');
    this.emit('match_started');
  }

  public getReturnSuccessRate(): number {
    if (this.totalReturns === 0) return 100;
    return Math.min(100, (this.successfulReturns / this.totalReturns) * 100);
  }

  public getAverageReactionTime(): number {
    if (this.reactionTimes.length === 0) return 0;
    const sum = this.reactionTimes.reduce((a, b) => a + b, 0);
    return sum / this.reactionTimes.length;
  }
}
