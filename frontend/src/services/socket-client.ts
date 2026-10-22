/**
 * PONG AI — Socket.IO Multiplayer Client
 * Manages multiplayer room lifecycle, connection status, and state synchronization.
 */

import { io, Socket } from 'socket.io-client';
import { MultiplayerRoomState, PlayerRole, RuleProfile } from '@game-engine/types';

export type SocketStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface MultiplayerCallbacks {
  onStatusChange?: (status: SocketStatus) => void;
  onRoomState?: (state: MultiplayerRoomState) => void;
  onGameStart?: (data: any) => void;
  onBallUpdate?: (ball: any) => void;
  onPointScored?: (data: any) => void;
  onGameOver?: (data: any) => void;
}

export class SocketClient {
  private socket: Socket | null = null;
  private status: SocketStatus = 'DISCONNECTED';
  private callbacks: MultiplayerCallbacks = {};
  private currentRoom: string | null = null;
  private currentRole: PlayerRole | null = null;

  constructor(private url?: string) {
    this.url =
      url ||
      (import.meta.env.VITE_SOCKET_URL as string) ||
      (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:3001');
  }

  public setCallbacks(callbacks: MultiplayerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public getStatus(): SocketStatus {
    return this.status;
  }

  public getCurrentRole(): PlayerRole | null {
    return this.currentRole;
  }

  public getCurrentRoom(): string | null {
    return this.currentRoom;
  }

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.status = 'CONNECTING';
    this.callbacks.onStatusChange?.(this.status);

    this.socket = io(this.url!, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.status = 'CONNECTED';
      this.callbacks.onStatusChange?.(this.status);
    });

    this.socket.on('disconnect', () => {
      this.status = 'DISCONNECTED';
      this.callbacks.onStatusChange?.(this.status);
    });

    this.socket.on('connect_error', () => {
      this.status = 'ERROR';
      this.callbacks.onStatusChange?.(this.status);
    });

    this.socket.on('room_state', (state: MultiplayerRoomState) => {
      this.callbacks.onRoomState?.(state);
    });

    this.socket.on('game_start', (data: any) => {
      this.callbacks.onGameStart?.(data);
    });

    this.socket.on('ball_update', (ball: any) => {
      this.callbacks.onBallUpdate?.(ball);
    });

    this.socket.on('point_scored', (data: any) => {
      this.callbacks.onPointScored?.(data);
    });

    this.socket.on('game_over', (data: any) => {
      this.callbacks.onGameOver?.(data);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.status = 'DISCONNECTED';
    this.currentRoom = null;
    this.currentRole = null;
    this.callbacks.onStatusChange?.(this.status);
  }

  public createRoom(ruleProfile: RuleProfile = 'TABLE_TENNIS_TRAINING'): Promise<{ roomCode: string; role: PlayerRole }> {
    const s = this.connect();
    return new Promise((resolve, reject) => {
      s.emit('create_room', { ruleProfile }, (res: { roomCode: string; role: PlayerRole; error?: string }) => {
        if (res.error) {
          reject(new Error(res.error));
        } else {
          this.currentRoom = res.roomCode;
          this.currentRole = res.role;
          resolve(res);
        }
      });
    });
  }

  public joinRoom(roomCode: string): Promise<{ success: boolean; role: PlayerRole }> {
    const s = this.connect();
    return new Promise((resolve, reject) => {
      s.emit('join_room', { roomCode: roomCode.toUpperCase() }, (res: { success: boolean; role: PlayerRole; error?: string }) => {
        if (res.error || !res.success) {
          reject(new Error(res.error || 'Failed to join room'));
        } else {
          this.currentRoom = roomCode.toUpperCase();
          this.currentRole = res.role;
          resolve(res);
        }
      });
    });
  }

  public setReady(ready: boolean): void {
    if (this.socket && this.currentRoom) {
      this.socket.emit('player_ready', { roomCode: this.currentRoom, ready });
    }
  }

  public sendPaddleUpdate(x: number, y: number, swing: boolean = false): void {
    if (this.socket && this.currentRoom) {
      this.socket.emit('paddle_update', {
        roomCode: this.currentRoom,
        x,
        y,
        swing,
      });
    }
  }

  public leaveRoom(): void {
    if (this.socket && this.currentRoom) {
      this.socket.emit('leave_room', { roomCode: this.currentRoom });
      this.currentRoom = null;
      this.currentRole = null;
    }
  }
}

export const socketClient = new SocketClient();
