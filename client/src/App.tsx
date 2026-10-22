import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { TableTennisEngine } from './game/physics/tableTennisEngine';
import { Scene } from './game/Scene';
import { VisionPipeline } from './vision/handLandmarker';
import { loadCalibration, CalibrationData } from './vision/calibration';
import {
  HandControlState,
  Mission,
  MatchStats,
  CoachingReport,
  CoachSummaryResponse,
  RuleProfile,
  GameDifficulty,
  PlayerRole,
} from '../../shared/types';
import {
  return_success_rate,
  miss_rate,
  average_rally_length,
  calculateAverageReactionTime,
} from '../../shared/metrics';
import { GameSettings } from './types';
import { coachApi } from './services/api';
import { saveMatchRecord, loadMatchHistory } from './services/storage';
import { sound } from './services/audio';

import { Scoreboard } from './components/hud/Scoreboard';
import { MissionCard } from './components/hud/MissionCard';
import { WebcamOverlay } from './components/camera/WebcamOverlay';
import { LandingMenu } from './components/menus/LandingMenu';
import { MatchSummaryModal } from './components/menus/MatchSummaryModal';
import { SettingsModal } from './components/menus/SettingsModal';
import { MultiplayerModal } from './components/menus/MultiplayerModal';

import { RulesExplorerView } from './components/views/RulesExplorerView';
import { ArchitectureExplorerView } from './components/views/ArchitectureExplorerView';
import { GestureLabView } from './components/views/GestureLabView';
import { AnalyticsStudioView } from './components/views/AnalyticsStudioView';
import { AIOrchestratorView } from './components/views/AIOrchestratorView';

import {
  Sliders,
  RefreshCw,
  BarChart2,
  BookOpen,
  Network,
  Home,
  Hand,
  Keyboard as KeyboardIcon,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Cpu,
} from 'lucide-react';

export type ScreenType =
  | 'menu'
  | 'game'
  | 'summary'
  | 'rules'
  | 'architecture'
  | 'gesture_lab'
  | 'analytics'
  | 'multiplayer'
  | 'orchestrator';

export const App: React.FC = () => {
  // Engine & Vision singletons
  const [engine] = useState(() => new TableTennisEngine('medium', 'TABLE_TENNIS_TRAINING'));
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const visionRef = useRef<VisionPipeline | null>(null);

  // Player input reference consumed by Three.js per-frame loop (Zero React re-render lag)
  const playerInputRef = useRef<{ x: number; y: number; swing: boolean }>({
    x: 0,
    y: 0,
    swing: false,
  });

  // Settings & Calibration
  const [settings, setSettings] = useState<GameSettings>({
    sensitivity: 1.0,
    smoothingFactor: 0.5,
    difficulty: 'medium',
    ruleProfile: 'TABLE_TENNIS_TRAINING',
    aiProvider: 'gemini',
    soundEnabled: true,
    soundVolume: 0.5,
    aiCoachingEnabled: true,
    showLandmarks: true,
    keyboardFallback: true,
    reducedMotion: false,
    playerAssistance: false,
  });

  const [calibration, setCalibration] = useState<CalibrationData>(loadCalibration);

  // Hand control reactive state (for overlay UI)
  const [controlState, setControlState] = useState<HandControlState>({
    x: 0,
    y: 0,
    confidence: 0,
    timestamp: Date.now(),
    tracking: false,
    gesture: 'none',
  });

  // Gameplay HUD states
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [rallyCount, setRallyCount] = useState(0);
  const [longestRally, setLongestRally] = useState(0);
  const [rallyState, setRallyState] = useState(engine.rallyState);
  const [isPaused, setIsPaused] = useState(false);
  const [controllerMode, setControllerMode] = useState<'gesture' | 'keyboard'>('keyboard');

  // Gemma 4 Provider & Health state
  const [aiStatus, setAiStatus] = useState<{
    available: boolean;
    provider: 'gemini' | 'ollama' | 'fallback';
    model: string;
    hasKey?: boolean;
    error?: string;
  }>({
    available: false,
    provider: 'gemini',
    model: 'gemma-4-26b-a4b-it',
  });

  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [loadingMission, setLoadingMission] = useState(false);
  const [coachSummary, setCoachSummary] = useState<CoachSummaryResponse | null>(null);
  const [coachingReport, setCoachingReport] = useState<CoachingReport | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);

  // Screen Management
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('menu');
  const previousScreenRef = useRef<ScreenType>('menu');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Match History
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchStats[]>(loadMatchHistory);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  // Multiplayer state
  const [multiplayerSocket, setMultiplayerSocket] = useState<Socket | null>(null);
  const [multiplayerRoom, setMultiplayerRoom] = useState<string | null>(null);
  const [multiplayerRole, setMultiplayerRole] = useState<PlayerRole | null>(null);

  const navigateTo = (screen: ScreenType) => {
    previousScreenRef.current = currentScreen;
    setCurrentScreen(screen);
  };

  // Check Provider health on mount and update status
  useEffect(() => {
    coachApi.checkHealth().then((res) => {
      setAiStatus(res);
      setSettings((prev) => ({ ...prev, aiProvider: res.provider }));
    });
  }, []);

  // Request mission when starting match
  const fetchNewMission = useCallback(
    async (stats?: Partial<MatchStats>) => {
      if (!settings.aiCoachingEnabled) return;
      setLoadingMission(true);
      try {
        const res = await coachApi.requestMission(stats, settings.difficulty);
        setActiveMission(res.mission);
      } finally {
        setLoadingMission(false);
      }
    },
    [settings.aiCoachingEnabled, settings.difficulty]
  );

  // Keyboard navigation fallback
  useEffect(() => {
    const keysPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.add(e.code);

      if (e.code === 'Space') {
        e.preventDefault();
        if (engine.rallyState === 'SERVE') {
          engine.triggerPlayerServe();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animId: number;
    const keyboardLoop = () => {
      if (currentScreen === 'game' && !isPaused) {
        let dx = 0;
        let dy = 0;

        if (keysPressed.has('ArrowLeft') || keysPressed.has('KeyA')) dx -= 0.05;
        if (keysPressed.has('ArrowRight') || keysPressed.has('KeyD')) dx += 0.05;
        if (keysPressed.has('ArrowUp') || keysPressed.has('KeyW')) dy += 0.05;
        if (keysPressed.has('ArrowDown') || keysPressed.has('KeyS')) dy -= 0.05;

        // If keyboard keys are used, override playerInputRef
        if (dx !== 0 || dy !== 0) {
          playerInputRef.current.x = Math.max(-1.0, Math.min(1.0, playerInputRef.current.x + dx));
          playerInputRef.current.y = Math.max(-1.0, Math.min(1.0, playerInputRef.current.y + dy));
        }
      }
      animId = requestAnimationFrame(keyboardLoop);
    };

    animId = requestAnimationFrame(keyboardLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [engine, currentScreen, isPaused]);

  // Handle engine event listeners (Scoring, Returns, Missions, Match End)
  useEffect(() => {
    const handleGameEvent = (event: { type: string; detail?: any }) => {
      setRallyState(engine.rallyState);
      setPlayerScore(engine.playerScore);
      setOpponentScore(engine.opponentScore);
      setRallyCount(engine.rallyCount);
      setLongestRally(engine.longestRally);

      // Mission progress evaluation
      if (activeMission && !activeMission.completed) {
        if (event.type === 'ball_hit_player') {
          if (activeMission.mission_type === 'consecutive_returns') {
            const nextVal = engine.rallyCount;
            const completed = nextVal >= activeMission.target_value;
            setActiveMission((prev) =>
              prev ? { ...prev, current_value: nextVal, completed } : null
            );
            if (completed) sound.playMissionComplete();
          } else if (activeMission.mission_type === 'total_returns') {
            const nextVal = engine.successfulReturns;
            const completed = nextVal >= activeMission.target_value;
            setActiveMission((prev) =>
              prev ? { ...prev, current_value: nextVal, completed } : null
            );
            if (completed) sound.playMissionComplete();
          } else if (activeMission.mission_type === 'rally_length') {
            const nextVal = engine.rallyCount;
            const completed = nextVal >= activeMission.target_value;
            setActiveMission((prev) =>
              prev ? { ...prev, current_value: nextVal, completed } : null
            );
            if (completed) sound.playMissionComplete();
          }
        } else if (event.type === 'point_won_opponent') {
          // Reset consecutive returns mission progress on miss
          if (activeMission.mission_type === 'consecutive_returns' && !activeMission.completed) {
            setActiveMission((prev) => (prev ? { ...prev, current_value: 0 } : null));
          }
        }
      }

      // Match Completion
      if (event.type === 'match_completed') {
        const eligible = engine.totalReturns;
        const success = engine.successfulReturns;
        const missed = Math.max(0, eligible - success);
        const totalPoints = engine.playerScore + engine.opponentScore;

        const stats: MatchStats = {
          matchId: `m_${Date.now()}`,
          startTime: Date.now() - 60000,
          endTime: Date.now(),
          ruleProfile: settings.ruleProfile,
          playerScore: engine.playerScore,
          opponentScore: engine.opponentScore,
          totalReturns: engine.totalReturns,
          successfulReturns: success,
          missedReturns: missed,
          eligibleReturnAttempts: eligible,
          returnSuccessRate: return_success_rate(success, eligible),
          missRate: miss_rate(missed, eligible),
          longestRally: engine.longestRally,
          totalRallies: totalPoints,
          averageRallyLength: average_rally_length(engine.totalReturns, totalPoints),
          medianRallyLength: engine.longestRally > 0 ? Math.round(engine.longestRally / 2) : 0,
          averageReactionTimeMs: calculateAverageReactionTime(engine.reactionTimes),
          reactionTimeSamples: [...engine.reactionTimes],
          tableZoneDistribution: { ...engine.tableZoneHits },
          trackingStabilityPercentage: 96.5,
          trackingAvailabilityPercentage: 98.2,
          missionsCompleted: activeMission?.completed ? 1 : 0,
          difficulty: settings.difficulty,
          controllerMode,
          assisted: settings.playerAssistance,
        };

        setMatchStats(stats);
        saveMatchRecord(stats);
        setMatchHistory(loadMatchHistory());
        setCurrentScreen('summary');

        // Request post-match analysis from Gemma 4
        if (settings.aiCoachingEnabled) {
          setLoadingCoach(true);
          Promise.all([
            coachApi.requestCoachingReport(stats).catch(() => null),
            coachApi.requestSummary(stats).catch(() => null),
          ])
            .then(([fullReport, legacySummary]) => {
              if (fullReport) setCoachingReport(fullReport);
              if (legacySummary) setCoachSummary(legacySummary.summary);
            })
            .finally(() => {
              setLoadingCoach(false);
            });
        }
      }
    };

    engine.addEventListener(handleGameEvent);
    return () => engine.removeEventListener(handleGameEvent);
  }, [engine, activeMission, settings.difficulty, settings.ruleProfile, settings.aiCoachingEnabled, controllerMode]);

  // Start webcam tracking
  const handleStartWebcam = async (ruleProfile: RuleProfile, difficulty: GameDifficulty) => {
    try {
      setSettings((prev) => ({ ...prev, ruleProfile, difficulty }));
      engine.setRuleProfile(ruleProfile);
      engine.setDifficulty(difficulty);
      setControllerMode('gesture');

      if (!visionRef.current) {
        visionRef.current = new VisionPipeline(calibration);
      }

      visionRef.current.setOnControl((ctrl: HandControlState) => {
        setControlState(ctrl);
        if (ctrl.tracking) {
          playerInputRef.current.x = Math.max(-1.0, Math.min(1.0, ctrl.x * settings.sensitivity));
          playerInputRef.current.y = Math.max(-1.0, Math.min(1.0, ctrl.y * settings.sensitivity));

          if (ctrl.gesture === 'swing' && engine.rallyState === 'SERVE') {
            engine.triggerPlayerServe();
          }
        }
      });

      if (videoRef.current) {
        await visionRef.current.startCamera(videoRef.current);
        setIsWebcamActive(true);
      }

      startMatch();
    } catch (err) {
      console.error('Failed to start webcam:', err);
      alert('Camera access could not be established. You can continue using Keyboard fallback!');
      startMatch();
    }
  };

  const handleStartKeyboard = (ruleProfile: RuleProfile, difficulty: GameDifficulty) => {
    setSettings((prev) => ({ ...prev, ruleProfile, difficulty }));
    engine.setRuleProfile(ruleProfile);
    engine.setDifficulty(difficulty);
    setControllerMode('keyboard');
    startMatch();
  };

  const startMatch = () => {
    engine.resetMatch();
    fetchNewMission();
    setCurrentScreen('game');
  };

  const handleStartMultiplayerMatch = (socket: Socket, roomCode: string, role: PlayerRole) => {
    setMultiplayerSocket(socket);
    setMultiplayerRoom(roomCode);
    setMultiplayerRole(role);
    startMatch();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070b19] select-none font-sans">
      {/* 3D WebGL Canvas Scene */}
      <Scene
        engine={engine}
        playerInputRef={playerInputRef}
        playerAssistanceEnabled={settings.playerAssistance}
      />

      {/* Hidden Video element for MediaPipe input */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />

      {/* Active In-Game HUD */}
      {currentScreen === 'game' && (
        <>
          <Scoreboard
            playerScore={playerScore}
            opponentScore={opponentScore}
            rallyCount={rallyCount}
            longestRally={longestRally}
            difficulty={settings.difficulty}
            rallyState={rallyState}
          />

          <MissionCard mission={activeMission} loading={loadingMission} />

          {/* Quick HUD Navigation Bar Bottom-Right */}
          <div className="fixed bottom-4 right-4 z-40 flex items-center space-x-2">
            <button
              onClick={() => {
                if (engine.rallyState !== 'PAUSED') {
                  engine.pause();
                  setIsPaused(true);
                } else {
                  engine.resume();
                  setIsPaused(false);
                }
              }}
              className="neo-btn neo-btn-white p-2.5 text-xs font-mono uppercase"
              title={isPaused ? 'Resume Game' : 'Pause Game'}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-amber-600" />}
            </button>

            <button
              onClick={() => engine.resetMatch()}
              className="neo-btn neo-btn-white p-2.5 text-xs font-mono uppercase"
              title="Restart Match"
            >
              <RotateCcw className="w-4 h-4 text-blue-600" />
            </button>

            {/* Phase 6: Player Assistance Toggle */}
            <button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  playerAssistance: !prev.playerAssistance,
                }))
              }
              className={`neo-btn p-2.5 text-xs font-mono uppercase ${
                settings.playerAssistance ? 'neo-btn-lime' : 'neo-btn-white'
              }`}
              title={
                settings.playerAssistance
                  ? 'Player Assistance: ON (3D Target & Cue)'
                  : 'Player Assistance: OFF'
              }
            >
              <Sparkles className="w-4 h-4 text-purple-700" />
            </button>

            <button
              onClick={() => navigateTo('rules')}
              className="neo-btn neo-btn-lavender p-2.5 text-xs font-mono uppercase"
              title="Rules Explorer"
            >
              <BookOpen className="w-4 h-4 text-purple-700" />
            </button>

            <button
              onClick={() => navigateTo('gesture_lab')}
              className="neo-btn neo-btn-lime p-2.5 text-xs font-mono uppercase"
              title="Gesture Lab & Calibration"
            >
              <RefreshCw className="w-4 h-4 text-[#121212]" />
            </button>

            <button
              onClick={() => navigateTo('analytics')}
              className="neo-btn neo-btn-white p-2.5 text-xs font-mono uppercase"
              title="Analytics Studio"
            >
              <BarChart2 className="w-4 h-4 text-orange-600" />
            </button>

            <button
              onClick={() => navigateTo('orchestrator')}
              className="neo-btn neo-btn-lavender p-2.5 text-xs font-mono uppercase"
              title="AI Orchestrator & Coach"
            >
              <Cpu className="w-4 h-4 text-purple-700" />
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="neo-btn neo-btn-white p-2.5 text-xs font-mono uppercase"
              title="Settings"
            >
              <Sliders className="w-4 h-4 text-gray-800" />
            </button>

            <button
              onClick={() => navigateTo('menu')}
              className="neo-btn neo-btn-white p-2.5 text-xs font-mono uppercase"
              title="Exit to Menu"
            >
              <Home className="w-4 h-4 text-gray-800" />
            </button>
          </div>

          {/* Control hints pill */}
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-white border-[2px] border-[#121212] shadow-[3px_3px_0px_#121212] px-4 py-1.5 flex items-center space-x-3 text-xs font-mono font-bold text-[#121212]">
            <div className="flex items-center space-x-1 text-purple-700">
              <Hand className="w-3.5 h-3.5" />
              <span>{isWebcamActive ? 'Webcam Active' : 'Keyboard Active'}</span>
            </div>
            <span className="text-gray-400">|</span>
            <div className="flex items-center space-x-1 text-gray-700 text-[11px]">
              <KeyboardIcon className="w-3.5 h-3.5" />
              <span>[WASD] Move · [Space] Serve</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="neo-badge bg-[#E4DCFF] text-[9px] py-0 px-1.5">
              {settings.ruleProfile === 'TABLE_TENNIS_TRAINING' ? 'ITTF 2026' : 'Arcade Pong'}
            </span>
            {settings.playerAssistance && (
              <span className="neo-badge bg-[#CCFF00] text-[#121212] text-[9px] py-0 px-1.5">
                Assist ON
              </span>
            )}
          </div>
        </>
      )}

      {/* Camera Landmark Overlay */}
      {isWebcamActive && currentScreen === 'game' && (
        <WebcamOverlay
          videoRef={videoRef}
          controlState={controlState}
          calibration={calibration}
          onRecalibrate={() => navigateTo('gesture_lab')}
        />
      )}

      {/* Main Landing Menu */}
      {currentScreen === 'menu' && (
        <LandingMenu
          onStartWebcam={handleStartWebcam}
          onStartKeyboard={handleStartKeyboard}
          onOpenMultiplayer={() => navigateTo('multiplayer')}
          onOpenGestureLab={() => navigateTo('gesture_lab')}
          onOpenAnalytics={() => navigateTo('analytics')}
          onOpenRules={() => navigateTo('rules')}
          onOpenArchitecture={() => navigateTo('architecture')}
          onOpenOrchestrator={() => navigateTo('orchestrator')}
          onOpenSettings={() => setShowSettingsModal(true)}
          aiStatus={aiStatus}
          isWebcamActive={isWebcamActive}
        />
      )}

      {/* Post-match Gemma 4 Coaching Summary */}
      {currentScreen === 'summary' && matchStats && (
        <MatchSummaryModal
          stats={matchStats}
          coachSummary={coachSummary}
          coachingReport={coachingReport}
          loadingCoach={loadingCoach}
          onPlayAgain={startMatch}
          onViewAnalytics={() => navigateTo('analytics')}
          onHome={() => navigateTo('menu')}
        />
      )}

      {/* Rules Explorer View (ITTF Statutes 2026 & Arcade Pong) */}
      {currentScreen === 'rules' && (
        <RulesExplorerView onBack={() => navigateTo(previousScreenRef.current || 'menu')} />
      )}

      {/* Architecture Explorer View (Graphify Knowledge Graph) */}
      {currentScreen === 'architecture' && (
        <ArchitectureExplorerView onBack={() => navigateTo(previousScreenRef.current || 'menu')} />
      )}

      {/* Gesture Lab View (MediaPipe, OneEuroFilter, Classifier) */}
      {currentScreen === 'gesture_lab' && (
        <GestureLabView
          currentCalibration={calibration}
          onSaveCalibration={(newCalib) => {
            setCalibration(newCalib);
            if (visionRef.current) {
              visionRef.current.setCalibration(newCalib);
            }
          }}
          onBack={() => navigateTo(previousScreenRef.current || 'menu')}
        />
      )}

      {/* Analytics Studio View (Recharts, Histograms, Benchmarks) */}
      {currentScreen === 'analytics' && (
        <AnalyticsStudioView
          history={matchHistory}
          onBack={() => navigateTo(previousScreenRef.current || 'menu')}
        />
      )}

      {/* AI Orchestrator & Local Gemma 4 Coach */}
      {currentScreen === 'orchestrator' && (
        <AIOrchestratorView onBack={() => navigateTo(previousScreenRef.current || 'menu')} />
      )}

      {/* Multiplayer Room Lobby */}
      {currentScreen === 'multiplayer' && (
        <MultiplayerModal
          onClose={() => navigateTo('menu')}
          onStartMultiplayerMatch={handleStartMultiplayerMatch}
        />
      )}

      {/* Settings & Configuration Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            engine.setDifficulty(newSettings.difficulty);
            engine.setRuleProfile(newSettings.ruleProfile);
          }}
          onClose={() => setShowSettingsModal(false)}
          onOpenCalibration={() => {
            setShowSettingsModal(false);
            navigateTo('gesture_lab');
          }}
          onOpenGestureLab={() => {
            setShowSettingsModal(false);
            navigateTo('gesture_lab');
          }}
        />
      )}
    </div>
  );
};
export default App;
