// =====================================================================
// PONG AI — Server-Authoritative Multiplayer Engine (Socket.IO)
// =====================================================================

import { Server as SocketIOServer, Socket } from 'socket.io';
import { MultiplayerRoomState, PlayerRole, PaddleUpdatePayload, RuleProfile } from '../../../shared/types.js';

interface RoomSession {
  roomCode: string;
  state: MultiplayerRoomState;
  sockets: {
    player1?: string;
    player2?: string;
    spectators: string[];
  };
  paddles: {
    player1: { x: number; y: number };
    player2: { x: number; y: number };
  };
  ball: {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
  };
  intervalId?: NodeJS.Timeout;
}

const rooms = new Map<string, RoomSession>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

export function setupMultiplayerHandlers(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    console.log(`[Multiplayer] Client connected: ${socket.id}`);

    // Create a new room
    socket.on('create_room', ({ ruleProfile }: { ruleProfile?: RuleProfile }, callback) => {
      const roomCode = generateRoomCode();
      const session: RoomSession = {
        roomCode,
        state: {
          roomCode,
          player1Ready: false,
          player2Ready: false,
          player1Connected: true,
          player2Connected: false,
          status: 'waiting',
          player1Score: 0,
          player2Score: 0,
          rallyCount: 0,
          server: 'player1',
          ruleProfile: ruleProfile || 'TABLE_TENNIS_TRAINING',
        },
        sockets: {
          player1: socket.id,
          spectators: [],
        },
        paddles: {
          player1: { x: 0, y: 0.25 },
          player2: { x: 0, y: 0.25 },
        },
        ball: {
          x: 0,
          y: 0.35,
          z: 1.2,
          vx: 0,
          vy: 0,
          vz: 0,
        },
      };

      rooms.set(roomCode, session);
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.role = 'player1';

      console.log(`[Multiplayer] Room created: ${roomCode} by ${socket.id}`);
      callback?.({ success: true, roomCode, role: 'player1', state: session.state });
    });

    // Join an existing room
    socket.on('join_room', ({ roomCode }: { roomCode: string }, callback) => {
      const upperCode = roomCode.trim().toUpperCase();
      const session = rooms.get(upperCode);

      if (!session) {
        return callback?.({ success: false, error: 'Room code not found' });
      }

      let assignedRole: PlayerRole = 'spectator';

      if (!session.sockets.player1) {
        session.sockets.player1 = socket.id;
        session.state.player1Connected = true;
        assignedRole = 'player1';
      } else if (!session.sockets.player2) {
        session.sockets.player2 = socket.id;
        session.state.player2Connected = true;
        assignedRole = 'player2';
      } else {
        session.sockets.spectators.push(socket.id);
        assignedRole = 'spectator';
      }

      socket.join(upperCode);
      socket.data.roomCode = upperCode;
      socket.data.role = assignedRole;

      io.to(upperCode).emit('room_state_update', session.state);
      console.log(`[Multiplayer] ${socket.id} joined ${upperCode} as ${assignedRole}`);
      callback?.({ success: true, roomCode: upperCode, role: assignedRole, state: session.state });
    });

    // Player readiness toggle
    socket.on('toggle_ready', ({ ready }: { ready: boolean }) => {
      const roomCode = socket.data.roomCode;
      const role = socket.data.role as PlayerRole;
      const session = rooms.get(roomCode);
      if (!session) return;

      if (role === 'player1') session.state.player1Ready = ready;
      if (role === 'player2') session.state.player2Ready = ready;

      // If both ready, start match
      if (session.state.player1Ready && session.state.player2Ready && session.state.status !== 'in_game') {
        session.state.status = 'in_game';
        session.state.player1Score = 0;
        session.state.player2Score = 0;
        session.state.rallyCount = 0;
        startServerAuthoritativeSimulation(io, session);
      }

      io.to(roomCode).emit('room_state_update', session.state);
    });

    // Paddle position update from client
    socket.on('paddle_update', (payload: PaddleUpdatePayload) => {
      const session = rooms.get(payload.roomCode);
      if (!session || session.state.status !== 'in_game') return;

      if (payload.role === 'player1') {
        session.paddles.player1.x = Math.max(-1.5, Math.min(1.5, payload.x));
        session.paddles.player1.y = Math.max(0.08, Math.min(0.68, payload.y));
      } else if (payload.role === 'player2') {
        session.paddles.player2.x = Math.max(-1.5, Math.min(1.5, payload.x));
        session.paddles.player2.y = Math.max(0.08, Math.min(0.68, payload.y));
      }

      // Broadcast to other players in room
      socket.to(payload.roomCode).emit('opponent_paddle_update', {
        role: payload.role,
        x: payload.x,
        y: payload.y,
        timestamp: payload.timestamp,
      });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      const roomCode = socket.data.roomCode;
      if (!roomCode) return;
      const session = rooms.get(roomCode);
      if (!session) return;

      if (session.sockets.player1 === socket.id) {
        session.sockets.player1 = undefined;
        session.state.player1Connected = false;
        session.state.player1Ready = false;
      } else if (session.sockets.player2 === socket.id) {
        session.sockets.player2 = undefined;
        session.state.player2Connected = false;
        session.state.player2Ready = false;
      }

      if (!session.sockets.player1 && !session.sockets.player2) {
        // Clean up empty room
        if (session.intervalId) clearInterval(session.intervalId);
        rooms.delete(roomCode);
        console.log(`[Multiplayer] Room purged: ${roomCode}`);
      } else {
        io.to(roomCode).emit('room_state_update', session.state);
      }
    });
  });
}

function startServerAuthoritativeSimulation(io: SocketIOServer, session: RoomSession): void {
  // 60Hz server tick
  const dt = 0.016;

  // Serve initial ball
  session.ball = {
    x: 0,
    y: 0.35,
    z: session.state.server === 'player1' ? 1.3 : -1.3,
    vx: (Math.random() - 0.5) * 0.5,
    vy: 2.2,
    vz: session.state.server === 'player1' ? -4.5 : 4.5,
  };

  io.to(session.roomCode).emit('match_started', session.state);

  if (session.intervalId) clearInterval(session.intervalId);

  session.intervalId = setInterval(() => {
    // Air drag & gravity
    session.ball.vy += -9.81 * dt;
    session.ball.x += session.ball.vx * dt;
    session.ball.y += session.ball.vy * dt;
    session.ball.z += session.ball.vz * dt;

    // Table bounce check (y = 0, length = 2.74, width = 1.525)
    if (session.ball.y <= 0 && session.ball.vy < 0) {
      if (Math.abs(session.ball.x) <= 0.7625 && Math.abs(session.ball.z) <= 1.37) {
        session.ball.y = 0.001;
        session.ball.vy = -session.ball.vy * 0.88;
        io.to(session.roomCode).emit('ball_bounced', { x: session.ball.x, z: session.ball.z });
      }
    }

    // Player 1 paddle check (Z = 1.55)
    if (session.ball.vz > 0 && session.ball.z >= 1.50 && session.ball.z <= 1.60) {
      const dx = session.ball.x - session.paddles.player1.x;
      const dy = session.ball.y - session.paddles.player1.y;
      if (Math.abs(dx) <= 0.22 && Math.abs(dy) <= 0.22) {
        session.ball.vz = -4.8;
        session.ball.vx = (dx / 0.15) * 2.0;
        session.ball.vy = 2.2;
        session.state.rallyCount++;
        io.to(session.roomCode).emit('paddle_hit', { player: 'player1', rallyCount: session.state.rallyCount });
      }
    }

    // Player 2 paddle check (Z = -1.55)
    if (session.ball.vz < 0 && session.ball.z <= -1.50 && session.ball.z >= -1.60) {
      const dx = session.ball.x - session.paddles.player2.x;
      const dy = session.ball.y - session.paddles.player2.y;
      if (Math.abs(dx) <= 0.22 && Math.abs(dy) <= 0.22) {
        session.ball.vz = 4.8;
        session.ball.vx = -(dx / 0.15) * 2.0;
        session.ball.vy = 2.2;
        session.state.rallyCount++;
        io.to(session.roomCode).emit('paddle_hit', { player: 'player2', rallyCount: session.state.rallyCount });
      }
    }

    // Out of bounds / point score check
    if (session.ball.y < -0.5 || Math.abs(session.ball.z) > 2.2) {
      const winner = session.ball.z > 0 ? 'player2' : 'player1';
      if (winner === 'player1') session.state.player1Score++;
      else session.state.player2Score++;

      session.state.rallyCount = 0;

      // Check win condition (ITTF 11 pts with 2 pt lead)
      const p1 = session.state.player1Score;
      const p2 = session.state.player2Score;
      if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2) {
        session.state.status = 'finished';
        clearInterval(session.intervalId);
        io.to(session.roomCode).emit('match_finished', {
          winner: p1 > p2 ? 'player1' : 'player2',
          p1Score: p1,
          p2Score: p2,
        });
        return;
      }

      // Reset serve
      session.state.server = session.state.server === 'player1' ? 'player2' : 'player1';
      session.ball = {
        x: 0,
        y: 0.35,
        z: session.state.server === 'player1' ? 1.3 : -1.3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 2.2,
        vz: session.state.server === 'player1' ? -4.5 : 4.5,
      };

      io.to(session.roomCode).emit('point_scored', {
        player1Score: p1,
        player2Score: p2,
        server: session.state.server,
      });
    }

    // Broadcast authoritative snapshot to room at 30Hz
    io.to(session.roomCode).emit('sim_snapshot', {
      ball: session.ball,
      p1Score: session.state.player1Score,
      p2Score: session.state.player2Score,
      rallyCount: session.state.rallyCount,
    });
  }, 1000 / 60);
}
