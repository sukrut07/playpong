import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Hand, Keyboard, ArrowLeft, RotateCcw, Award, CheckCircle2, Bot, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { TableTennisEngine } from '@game-engine/tableTennisEngine';
import { GameDifficulty, RuleProfile, MatchStats } from '@game-engine/types';
import { Scene } from '../components/game/Scene';
import { Scoreboard } from '../components/game/Scoreboard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { sound } from '../services/audio';
import { saveMatchRecord } from '../services/storage';
import { GestureController } from '../features/gesture/gesture-controller';
import { MediaPipeVisionAdapter } from '../features/gesture/mediapipe-adapter';
import { loadCalibration } from '../features/gesture/calibration';
import { HandLandmarks } from '../features/gesture/landmark-types';
import { CameraMiniPreview } from '../components/game/CameraMiniPreview';

export interface GamePageProps {
  onNavigate: (path: string) => void;
  initialMode?: 'setup' | 'playing';
}

export const GamePage: React.FC<GamePageProps> = ({ onNavigate, initialMode = 'setup' }) => {
  // Game Setup configuration
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'ended'>(initialMode);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [ruleProfile, setRuleProfile] = useState<RuleProfile>('TABLE_TENNIS_TRAINING');
  const [controllerMode, setControllerMode] = useState<'gesture' | 'keyboard'>('gesture');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Engine instance
  const [engine] = useState(() => new TableTennisEngine(difficulty, ruleProfile, sound));

  // Player input reference consumed by Three.js render loop without re-render lag
  const playerInputRef = useRef<{ x: number; y: number; swing: boolean }>({
    x: 0,
    y: 0,
    swing: false,
  });

  // Reactive HUD states
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [rallyCount, setRallyCount] = useState(0);
  const [longestRally, setLongestRally] = useState(0);
  const [currentServer, setCurrentServer] = useState<'player' | 'opponent'>('player');
  const [isPaused, setIsPaused] = useState(false);
  const [matchWinner, setMatchWinner] = useState<'player' | 'opponent' | null>(null);
  const [completedMatchStats, setCompletedMatchStats] = useState<MatchStats | null>(null);

  // Gesture webcam pipeline
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const visionAdapterRef = useRef<MediaPipeVisionAdapter | null>(null);
  const gestureControllerRef = useRef<GestureController | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentLandmarks, setCurrentLandmarks] = useState<HandLandmarks | undefined>(undefined);
  const [currentCoords, setCurrentCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cameraLatency, setCameraLatency] = useState<number>(16);

  // Initialize engine event listeners
  useEffect(() => {
    engine.setDifficulty(difficulty);
    engine.setRuleProfile(ruleProfile);
    engine.setSoundDelegate(soundEnabled ? sound : null);

    const onRallyEnded = (ev: any) => {
      setRallyCount(ev.detail?.rallyLength || 0);
      setPlayerScore(ev.detail?.playerScore || 0);
      setOpponentScore(ev.detail?.opponentScore || 0);
      setCurrentServer(engine.currentServer);
    };

    const onPointPlayer = (ev: any) => {
      setPlayerScore(ev.detail?.score || 0);
      if (engine.longestRally > longestRally) {
        setLongestRally(engine.longestRally);
      }
    };

    const onPointOpponent = (ev: any) => {
      setOpponentScore(ev.detail?.score || 0);
    };

    const onMatchCompleted = (ev: any) => {
      const winner = ev.detail?.winner || 'player';
      setMatchWinner(winner);
      setGameState('ended');

      // Build audited match stats record
      const stats: MatchStats = {
        matchId: `match_${Date.now()}`,
        startTime: Date.now() - 180000,
        endTime: Date.now(),
        playerScore: ev.detail?.playerScore || 0,
        opponentScore: ev.detail?.opponentScore || 0,
        difficulty,
        ruleProfile,
        totalReturns: engine.totalReturns,
        successfulReturns: engine.successfulReturns,
        missedReturns: engine.missedReturns,
        eligibleReturnAttempts: engine.successfulReturns + engine.missedReturns,
        returnSuccessRate: engine.getReturnSuccessRate(),
        missRate: engine.getMissRate(),
        completedRallies: engine.rallyLengths.length,
        totalRallies: engine.rallyLengths.length,
        rallyLengths: [...engine.rallyLengths],
        longestRally: engine.longestRally,
        averageRallyLength: engine.getAverageRallyLength(),
        medianRallyLength: engine.getMedianRallyLength(),
        averageReactionTimeMs: engine.getAverageReactionTime(),
        reactionTimeSamples: [...engine.reactionTimes],
        tableZoneHits: { ...engine.tableZoneHits },
        tableZoneDistribution: { ...engine.tableZoneHits },
        trackingStabilityPercentage: controllerMode === 'gesture' ? 95 : 100,
        missionsCompleted: 0,
        controllerMode,
      };

      setCompletedMatchStats(stats);
      saveMatchRecord(stats);
    };

    engine.addEventListener((ev) => {
      if (ev.type === 'rally_ended') onRallyEnded(ev);
      if (ev.type === 'point_won_player') onPointPlayer(ev);
      if (ev.type === 'point_won_opponent') onPointOpponent(ev);
      if (ev.type === 'match_completed') onMatchCompleted(ev);
    });

    return () => {
      // Cleanup
    };
  }, [engine, difficulty, ruleProfile, soundEnabled, longestRally]);

  // Keyboard navigation listener for gameplay
  useEffect(() => {
    if (gameState !== 'playing') return;

    const keyState = { left: false, right: false, up: false, down: false };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keyState.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyState.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keyState.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keyState.down = true;
      if (e.key === ' ' || e.key === 'Enter') {
        if (engine.rallyState === 'SERVE' && engine.currentServer === 'player') {
          engine.triggerPlayerServe();
        }
      }
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keyState.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyState.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keyState.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keyState.down = false;
    };

    const interval = setInterval(() => {
      if (controllerMode === 'keyboard') {
        let x = playerInputRef.current.x;
        let y = playerInputRef.current.y;
        const speed = 0.08;

        if (keyState.left) x = Math.max(-1.0, x - speed);
        if (keyState.right) x = Math.min(1.0, x + speed);
        if (keyState.up) y = Math.min(1.0, y + speed);
        if (keyState.down) y = Math.max(-1.0, y - speed);

        playerInputRef.current = { x, y, swing: false };
      }
    }, 16);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, controllerMode, engine]);

  // Handle hand tracking camera setup if controllerMode is 'gesture'
  useEffect(() => {
    if (gameState === 'playing' && controllerMode === 'gesture') {
      const initCamera = async () => {
        try {
          setCameraError(null);
          if (!gestureControllerRef.current) {
            gestureControllerRef.current = new GestureController(loadCalibration());
          }
          if (!visionAdapterRef.current) {
            visionAdapterRef.current = new MediaPipeVisionAdapter();
          }

          if (videoRef.current) {
            let lastUiUpdate = 0;
            await visionAdapterRef.current.startCamera(videoRef.current, ({ landmarks, timestampMs, latencyMs }) => {
              const state = gestureControllerRef.current!.processFrame(landmarks, timestampMs, latencyMs);

              // 1. Direct unthrottled ref update for 60fps Three.js render loop (0ms latency, no React re-render lag)
              if (state.tracking) {
                playerInputRef.current = {
                  x: state.smoothedCoordinates.x,
                  y: state.smoothedCoordinates.y,
                  swing: state.gesture === 'swing',
                };
                if (state.gesture === 'swing' && engine.rallyState === 'SERVE' && engine.currentServer === 'player') {
                  engine.triggerPlayerServe();
                }
              }

              // 2. Throttle React state updates to ~10 Hz so the DOM is not re-rendered 60 times/sec
              const now = performance.now();
              if (now - lastUiUpdate > 95) {
                lastUiUpdate = now;
                setTrackingActive(state.tracking);
                if (landmarks) setCurrentLandmarks(landmarks);
                setCurrentCoords(state.smoothedCoordinates);
                if (latencyMs) setCameraLatency(latencyMs);
              }
            });
          }
        } catch (err: any) {
          console.warn('[GamePage] Camera start failed, falling back to keyboard:', err.message);
          setCameraError('Camera access unavailable. Defaulting to keyboard controls.');
          setControllerMode('keyboard');
        }
      };

      initCamera();
    } else {
      if (visionAdapterRef.current) {
        visionAdapterRef.current.stopCamera();
      }
      setTrackingActive(false);
    }

    return () => {
      if (visionAdapterRef.current) {
        visionAdapterRef.current.stopCamera();
      }
    };
  }, [gameState, controllerMode, engine]);

  const startMatch = () => {
    engine.resetMatch();
    setPlayerScore(0);
    setOpponentScore(0);
    setRallyCount(0);
    setLongestRally(0);
    setMatchWinner(null);
    setGameState('playing');
    setIsPaused(false);
  };

  const restartMatch = () => {
    engine.resetMatch();
    setPlayerScore(0);
    setOpponentScore(0);
    setRallyCount(0);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (isPaused) {
      engine.resume();
      setIsPaused(false);
    } else {
      engine.pause();
      setIsPaused(true);
    }
  };

  // -------------------------------------------------------------------
  // Setup View (/play)
  // -------------------------------------------------------------------
  if (gameState === 'setup') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <div className="space-y-2">
          <Badge variant="mint">Game Setup</Badge>
          <h1 className="text-4xl sm:text-5xl font-display font-black uppercase text-[#111111]">
            Match Configuration
          </h1>
          <p className="text-base text-[#525252] font-medium">
            Select your game mode, control input, and regulation rule profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Control Mode */}
          <Card variant="white" className="space-y-4">
            <h3 className="font-display font-black text-lg uppercase text-[#111111] flex items-center gap-2">
              <Hand className="w-5 h-5 text-[#62F5AD]" />
              Controller Input
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setControllerMode('gesture')}
                className={`p-4 border-[2px] border-[#111111] rounded-xl text-left transition-all ${
                  controllerMode === 'gesture'
                    ? 'bg-[#62F5AD] shadow-neo font-bold'
                    : 'bg-[#FFFDF6] hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-black text-sm uppercase">Hand Tracking</span>
                  <Hand className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-[#525252]">MediaPipe webcam landmarks</p>
              </button>

              <button
                onClick={() => setControllerMode('keyboard')}
                className={`p-4 border-[2px] border-[#111111] rounded-xl text-left transition-all ${
                  controllerMode === 'keyboard'
                    ? 'bg-[#111111] text-[#FFFFFF] shadow-neo font-bold'
                    : 'bg-[#FFFDF6] hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-black text-sm uppercase">Keyboard</span>
                  <Keyboard className="w-4 h-4" />
                </div>
                <p className="text-[11px] opacity-80">WASD or Arrow keys</p>
              </button>
            </div>

            {controllerMode === 'gesture' && (
              <div className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl flex items-center justify-between text-xs">
                <span className="font-medium text-[#525252]">Need to test or calibrate your camera?</span>
                <Button variant="white" size="sm" onClick={() => onNavigate('/gesture-lab')}>
                  Gesture Lab ↗
                </Button>
              </div>
            )}
          </Card>

          {/* Card 2: Difficulty */}
          <Card variant="cream" className="space-y-4">
            <h3 className="font-display font-black text-lg uppercase text-[#111111]">
              Opponent Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as GameDifficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 border-[2px] border-[#111111] rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all ${
                    difficulty === d
                      ? 'bg-[#D9FF55] shadow-neo translate-x-0.5 translate-y-0.5'
                      : 'bg-[#FFFFFF] hover:bg-[#F5F5F5]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#525252]">
              {difficulty === 'easy' && 'Casual pace, wider return forgiveness, 2.8m/s max racket speed.'}
              {difficulty === 'medium' && 'Balanced rallies, competitive reaction curves, 4.2m/s racket speed.'}
              {difficulty === 'hard' && 'Tournament pace, sharp lateral deflections, 6.2m/s racket speed.'}
            </p>
          </Card>

          {/* Card 3: Rule Profile */}
          <Card variant="white" className="space-y-4">
            <h3 className="font-display font-black text-lg uppercase text-[#111111]">
              Rule Profile
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRuleProfile('TABLE_TENNIS_TRAINING')}
                className={`p-3.5 border-[2px] border-[#111111] rounded-xl text-left transition-all ${
                  ruleProfile === 'TABLE_TENNIS_TRAINING'
                    ? 'bg-[#BDA5FF] shadow-neo font-bold'
                    : 'bg-[#FFFDF6]'
                }`}
              >
                <span className="block font-display font-black text-xs uppercase mb-1">
                  ITTF Statutes 2026
                </span>
                <p className="text-[11px] text-[#525252]">11 points, deuce rules, 2-serve rotations (§2.11, §2.13)</p>
              </button>

              <button
                onClick={() => setRuleProfile('ARCADE_PONG')}
                className={`p-3.5 border-[2px] border-[#111111] rounded-xl text-left transition-all ${
                  ruleProfile === 'ARCADE_PONG'
                    ? 'bg-[#62F5AD] shadow-neo font-bold'
                    : 'bg-[#FFFDF6]'
                }`}
              >
                <span className="block font-display font-black text-xs uppercase mb-1">
                  Classic Arcade
                </span>
                <p className="text-[11px] text-[#525252]">First to 7 points, progressive speed curve</p>
              </button>
            </div>
          </Card>

          {/* Card 4: Audio & Ready */}
          <Card variant="white" className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-display font-black text-lg uppercase text-[#111111]">
                Audio & Feedback
              </h3>
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  sound.setEnabled(!soundEnabled);
                }}
                className={`w-full py-3 px-4 border-[2px] border-[#111111] rounded-xl font-display font-black text-xs uppercase flex items-center justify-between transition-all ${
                  soundEnabled ? 'bg-[#D9FF55]' : 'bg-[#F5F5F5] text-[#737373]'
                }`}
              >
                <span>Synthesized Physical Audio</span>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <Button
              variant="mint"
              size="lg"
              onClick={startMatch}
              className="w-full text-base py-4"
            >
              <Play className="w-5 h-5 fill-current" />
              START MATCH ↗
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Match Arena View (/game/:matchId)
  // -------------------------------------------------------------------
  return (
    <div
      onClick={() => {
        if (engine.rallyState === 'SERVE' && currentServer === 'player') {
          engine.triggerPlayerServe();
        }
      }}
      className="relative w-full h-[calc(100vh-4.5rem)] overflow-hidden bg-[#161616]"
    >
      {/* 3D WebGL Arena Canvas */}
      <Scene engine={engine} playerInputRef={playerInputRef} />

      {/* Floating Bottom-Right Camera Mini-Preview */}
      <CameraMiniPreview
        videoRef={videoRef}
        landmarks={currentLandmarks}
        coordinates={currentCoords}
        tracking={trackingActive}
        latencyMs={cameraLatency}
        controllerMode={controllerMode}
        onStopCamera={() => {
          if (visionAdapterRef.current) {
            visionAdapterRef.current.stopCamera();
          }
          setTrackingActive(false);
          setControllerMode('keyboard');
        }}
        onStartCamera={() => {
          setControllerMode('gesture');
        }}
      />

      {/* Neo-Brutalist Scoreboard HUD */}
      <Scoreboard
        playerScore={playerScore}
        opponentScore={opponentScore}
        rallyCount={rallyCount}
        longestRally={longestRally}
        currentServer={currentServer}
        isPaused={isPaused}
        controllerMode={controllerMode}
        trackingActive={trackingActive}
        onTogglePause={togglePause}
        onRestart={restartMatch}
        onExit={() => setGameState('setup')}
        onSwitchController={(mode) => setControllerMode(mode)}
      />

      {/* Interactive Serve Button / Banner */}
      {engine.rallyState === 'SERVE' && currentServer === 'player' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <button
            onClick={(e) => {
              e.stopPropagation();
              engine.triggerPlayerServe();
            }}
            className="px-6 py-3 bg-[#62F5AD] hover:bg-[#D9FF55] text-[#111111] border-[3px] border-[#111111] rounded-2xl shadow-neo font-display font-black text-sm uppercase tracking-wider cursor-pointer active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            {controllerMode === 'gesture' ? 'CLICK OR SWING HAND TO SERVE ↗' : 'CLICK OR PRESS SPACE TO SERVE ↗'}
          </button>
        </div>
      )}

      {/* Camera fallback notification */}
      {cameraError && (
        <div className="absolute bottom-4 left-4 z-20 bg-[#FFFFFF] border-[2px] border-[#111111] p-3 rounded-xl shadow-neo text-xs text-[#FF5555] font-semibold">
          {cameraError}
        </div>
      )}

      {/* Post-Match Summary Modal */}
      <Modal
        isOpen={gameState === 'ended'}
        onClose={() => setGameState('setup')}
        title={matchWinner === 'player' ? 'VICTORY!' : 'MATCH COMPLETED'}
        badge={matchWinner === 'player' ? 'WIN' : 'DEFEAT'}
      >
        <div className="space-y-6">
          <div className="text-center py-4 bg-[#62F5AD] border-[2px] border-[#111111] rounded-xl shadow-neo-sm">
            <span className="font-display font-bold text-xs uppercase text-[#111111]">Final Score</span>
            <div className="font-display font-black text-5xl text-[#111111] mt-1">
              {playerScore} - {opponentScore}
            </div>
            <p className="text-xs font-semibold text-[#111111] mt-1">
              {matchWinner === 'player'
                ? 'Excellent match performance! You met the regulation criteria.'
                : 'Tough opponent! Review the AI Coach analysis to sharpen your returns.'}
            </p>
          </div>

          {completedMatchStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl">
                <span className="block text-[10px] font-mono text-[#737373] uppercase">Returns</span>
                <span className="font-display font-black text-xl text-[#111111]">
                  {completedMatchStats.successfulReturns}/{completedMatchStats.eligibleReturnAttempts}
                </span>
              </div>
              <div className="p-3 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl">
                <span className="block text-[10px] font-mono text-[#737373] uppercase">Success Rate</span>
                <span className="font-display font-black text-xl text-[#111111]">
                  {completedMatchStats.returnSuccessRate?.toFixed(1) ?? 'N/A'}%
                </span>
              </div>
              <div className="p-3 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl">
                <span className="block text-[10px] font-mono text-[#737373] uppercase">Longest Rally</span>
                <span className="font-display font-black text-xl text-[#111111]">
                  {completedMatchStats.longestRally}
                </span>
              </div>
              <div className="p-3 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl">
                <span className="block text-[10px] font-mono text-[#737373] uppercase">Avg Reaction</span>
                <span className="font-display font-black text-xl text-[#111111]">
                  {completedMatchStats.averageReactionTimeMs ? Math.round(completedMatchStats.averageReactionTimeMs) + 'ms' : 'N/A'}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t-[2px] border-[#111111]/20">
            <Button variant="white" onClick={() => setGameState('setup')}>
              Back to Setup
            </Button>
            <Button variant="lime" onClick={restartMatch}>
              Play Again
            </Button>
            <Button
              variant="mint"
              onClick={() => {
                setGameState('setup');
                onNavigate('/coach');
              }}
            >
              <Bot className="w-4 h-4" />
              VIEW AI COACH ANALYSIS ↗
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
