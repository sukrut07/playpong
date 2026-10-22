import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { MultiplayerRoomState, PlayerRole, RuleProfile } from '../../../../shared/types';
import { Users, X, Play, Copy, Check, ArrowRight, Shield } from 'lucide-react';

interface MultiplayerModalProps {
  onClose: () => void;
  onStartMultiplayerMatch: (socket: Socket, roomCode: string, role: PlayerRole) => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  onClose,
  onStartMultiplayerMatch,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [createdRoomState, setCreatedRoomState] = useState<MultiplayerRoomState | null>(null);
  const [assignedRole, setAssignedRole] = useState<PlayerRole | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:3001');
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      console.log('[MultiplayerClient] Connected to server:', s.id);
    });

    s.on('room_state_update', (state: MultiplayerRoomState) => {
      setCreatedRoomState(state);
    });

    s.on('match_started', (state: MultiplayerRoomState) => {
      if (assignedRole && state.roomCode) {
        onStartMultiplayerMatch(s, state.roomCode, assignedRole);
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [assignedRole, onStartMultiplayerMatch]);

  const handleCreateRoom = () => {
    if (!socket) return;
    setError(null);
    socket.emit('create_room', { ruleProfile: 'TABLE_TENNIS_TRAINING' }, (res: any) => {
      if (res.success) {
        setCreatedRoomState(res.state);
        setAssignedRole(res.role);
      } else {
        setError(res.error || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !roomCodeInput.trim()) return;
    setError(null);
    socket.emit('join_room', { roomCode: roomCodeInput }, (res: any) => {
      if (res.success) {
        setCreatedRoomState(res.state);
        setAssignedRole(res.role);
      } else {
        setError(res.error || 'Failed to join room. Verify code.');
      }
    });
  };

  const handleToggleReady = () => {
    if (!socket || !createdRoomState) return;
    const next = !isReady;
    setIsReady(next);
    socket.emit('toggle_ready', { ready: next });
  };

  const handleCopyCode = () => {
    if (createdRoomState?.roomCode) {
      navigator.clipboard.writeText(createdRoomState.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans select-none">
      <div className="relative w-full max-w-lg bg-[#FAF6EB] border-[3px] border-[#121212] shadow-[8px_8px_0px_#121212] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b-[2.5px] border-[#121212] bg-[#E4DCFF] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#6D28D9]" />
            <h2 className="text-xl font-black font-display uppercase tracking-tight text-[#121212]">
              Player vs Player (Online Multiplayer)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-[#FF6B4A] text-white font-mono text-xs border border-[#121212]">
              {error}
            </div>
          )}

          {!createdRoomState ? (
            <div className="space-y-6">
              {/* Option 1: Create Room */}
              <div className="neo-box p-5 bg-white space-y-3">
                <h3 className="font-display font-black text-base text-[#121212]">
                  Host a New Game Room
                </h3>
                <p className="text-xs text-gray-600">
                  Generate a 4-letter room code and invite a friend to play with server-authoritative scoring.
                </p>
                <button
                  onClick={handleCreateRoom}
                  className="w-full neo-btn neo-btn-lime py-2.5 text-xs font-mono uppercase font-bold"
                >
                  Create Match Room
                </button>
              </div>

              {/* Option 2: Join Existing Room */}
              <div className="neo-box p-5 bg-white space-y-3">
                <h3 className="font-display font-black text-base text-[#121212]">
                  Join Match With Room Code
                </h3>
                <form onSubmit={handleJoinRoom} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. PONG"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border-[2px] border-[#121212] font-mono text-sm uppercase text-center font-bold tracking-widest bg-[#FAF6EB]"
                  />
                  <button
                    type="submit"
                    className="neo-btn neo-btn-white px-5 py-2 text-xs font-mono uppercase font-bold"
                  >
                    Join
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Room Lobby State */
            <div className="space-y-5">
              <div className="neo-box p-5 bg-white text-center space-y-2">
                <span className="text-[11px] font-mono uppercase text-gray-500">
                  Share Room Code With Opponent
                </span>
                <div className="flex items-center justify-center space-x-3">
                  <span className="font-mono text-4xl font-black tracking-widest text-[#121212] bg-[#FAF6EB] px-4 py-1.5 border-[2px] border-[#121212]">
                    {createdRoomState.roomCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="neo-btn neo-btn-white p-2.5 text-xs font-mono"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Players Status Box */}
              <div className="neo-box p-4 bg-[#FAF6EB] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2 bg-white border border-[#121212]">
                  <span>Player 1 (Host):</span>
                  <span className={`neo-badge ${createdRoomState.player1Ready ? 'bg-[#CCFF00]' : 'bg-gray-200'}`}>
                    {createdRoomState.player1Ready ? 'READY' : 'WAITING'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-white border border-[#121212]">
                  <span>Player 2:</span>
                  <span className={`neo-badge ${createdRoomState.player2Connected ? (createdRoomState.player2Ready ? 'bg-[#CCFF00]' : 'bg-[#FFD027]') : 'bg-gray-200'}`}>
                    {!createdRoomState.player2Connected ? 'NOT CONNECTED' : (createdRoomState.player2Ready ? 'READY' : 'JOINED')}
                  </span>
                </div>
              </div>

              {/* Ready Button */}
              <button
                onClick={handleToggleReady}
                className={`w-full neo-btn py-3 text-sm font-mono uppercase font-bold transition-all ${
                  isReady ? 'neo-btn-peach' : 'neo-btn-lime'
                }`}
              >
                {isReady ? 'Cancel Ready' : 'I am Ready!'}
              </button>

              <div className="text-[11px] font-mono text-center text-gray-500">
                Match will launch automatically when both players toggle Ready.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
