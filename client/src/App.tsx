import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TableTennisEngine } from './game/physics/tableTennisEngine';
import { Scene } from './game/Scene';
import { VisionPipeline } from './vision/handLandmarker';
import { loadCalibration, CalibrationData } from './vision/calibration';
import { HandControlState, Mission, MatchStats, CoachSummaryResponse } from '../../shared/types';
import { GameSettings } from './types';
import { coachApi } from './services/api';
import { saveMatchRecord, loadMatchHistory } from './services/storage';
import { sound } from './services/audio';

import { Scoreboard } from './components/hud/Scoreboard';
import { MissionCard } from './components/hud/MissionCard';
import { WebcamOverlay } from './components/camera/WebcamOverlay';
import { LandingMenu } from './components/menus/LandingMenu';
import { CalibrationModal } from './components/menus/CalibrationModal';
import { MatchSummaryModal } from './components/menus/MatchSummaryModal';
import { AnalyticsDashboard } from './components/menus/AnalyticsDashboard';
import { SettingsModal } from './components/menus/SettingsModal';

import { Sliders, RefreshCw, BarChart2, Pause, Play, Hand, Keyboard as KeyboardIcon } from 'lucide-react';

export const App: React.FC = () => {
  // Engine & Vision singletons
  const [engine] = useState(() => new TableTennisEngine('easy'));
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
    difficulty: 'easy',
    soundEnabled: true,
    soundVolume: 0.5,
    aiCoachingEnabled: true,
    showLandmarks: true,
    keyboardFallback: true,
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

  // Ollama & Gemma 4 Coach state
  const [ollamaStatus, setOllamaStatus] = useState<{ available: boolean; model: string }>({
    available: false,
    model: 'checking...',
  });
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [loadingMission, setLoadingMission] = useState(false);
  const [coachSummary, setCoachSummary] = useState<CoachSummaryResponse | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);

  // Modals & Screen management
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game' | 'summary' | 'analytics'>('menu');
  const previousScreenRef = useRef<'menu' | 'game' | 'summary'>('menu');
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchStats[]>(loadMatchHistory);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  // Check Ollama health on mount
  useEffect(() => {
    coachApi.checkHealth().then((res) => {
      setOllamaStatus(res);
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

  // Handle engine event listeners (Scoring, Returns, Missions)
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
        const stats: MatchStats = {
          matchId: `m_${Date.now()}`,
          startTime: Date.now() - 60000,
          endTime: Date.now(),
          playerScore: engine.playerScore,
          opponentScore: engine.opponentScore,
          totalReturns: engine.totalReturns,
          successfulReturns: engine.successfulReturns,
          returnSuccessRate: engine.getReturnSuccessRate(),
          longestRally: engine.longestRally,
          totalRallies: engine.playerScore + engine.opponentScore,
          averageRallyLength:
            (engine.playerScore + engine.opponentScore > 0)
              ? engine.totalReturns / (engine.playerScore + engine.opponentScore)
              : 0,
          medianRallyLength: engine.longestRally > 0 ? Math.round(engine.longestRally / 2) : 0,
          averageReactionTimeMs: engine.getAverageReactionTime(),
          reactionTimeSamples: [...engine.reactionTimes],
          tableZoneDistribution: { ...engine.tableZoneHits },
          trackingStabilityPercentage: 96.5,
          missionsCompleted: activeMission?.completed ? 1 : 0,
          difficulty: settings.difficulty,
        };

        setMatchStats(stats);
        saveMatchRecord(stats);
        setMatchHistory(loadMatchHistory());
        setCurrentScreen('summary');

        // Request post-match analysis from Gemma 4
        if (settings.aiCoachingEnabled) {
          setLoadingCoach(true);
          coachApi
            .requestSummary(stats)
            .then((res) => {
              setCoachSummary(res.summary);
            })
            .finally(() => {
              setLoadingCoach(false);
            });
        }
      }
    };

    engine.addEventListener(handleGameEvent);
    return () => engine.removeEventListener(handleGameEvent);
  }, [engine, activeMission, settings.difficulty, settings.aiCoachingEnabled]);

  // Start webcam tracking
  const handleStartWebcam = async () => {
    try {
      if (!visionRef.current) {
        visionRef.current = new VisionPipeline(calibration);
      }

      visionRef.current.setOnControl((ctrl: HandControlState) => {
        setControlState(ctrl);
        if (ctrl.tracking) {
          // Apply sensitivity factor
          playerInputRef.current.x = Math.max(-1.0, Math.min(1.0, ctrl.x * settings.sensitivity));
          playerInputRef.current.y = Math.max(-1.0, Math.min(1.0, ctrl.y * settings.sensitivity));

          // Swing trigger on gesture
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
      alert('Camera access could not be established. You can continue using Keyboard/Mouse fallback!');
      startMatch();
    }
  };

  const handleStartKeyboard = () => {
    startMatch();
  };

  const startMatch = () => {
    engine.resetMatch();
    fetchNewMission();
    setCurrentScreen('game');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070b19] select-none font-sans">
      {/* 3D WebGL Canvas Scene */}
      <Scene engine={engine} playerInputRef={playerInputRef} />

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
              onClick={() => setShowCalibrationModal(true)}
              className="p-3 rounded-xl glass-panel hover:bg-slate-800 text-cyan-400 border border-slate-700/60"
              title="Calibration"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 border border-slate-700/60"
              title="Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                previousScreenRef.current = 'game';
                setCurrentScreen('analytics');
              }}
              className="p-3 rounded-xl glass-panel hover:bg-slate-800 text-orange-400 border border-slate-700/60"
              title="Analytics"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>

          {/* Control hints pill */}
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 glass-panel px-4 py-1.5 rounded-full flex items-center space-x-3 text-xs text-slate-300">
            <div className="flex items-center space-x-1 text-cyan-400 font-medium">
              <Hand className="w-3.5 h-3.5" />
              <span>Webcam Hand</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
              <KeyboardIcon className="w-3.5 h-3.5" />
              <span>[WASD / Arrows] Move • [Space] Serve</span>
            </div>
          </div>
        </>
      )}

      {/* Camera Landmark Overlay */}
      {isWebcamActive && (
        <WebcamOverlay
          videoRef={videoRef}
          controlState={controlState}
          calibration={calibration}
          onRecalibrate={() => setShowCalibrationModal(true)}
        />
      )}

      {/* Modals & Screens */}
      {currentScreen === 'menu' && (
        <LandingMenu
          onStartWebcam={handleStartWebcam}
          onStartKeyboard={handleStartKeyboard}
          onOpenAnalytics={() => {
            previousScreenRef.current = 'menu';
            setCurrentScreen('analytics');
          }}
          onOpenSettings={() => setShowSettingsModal(true)}
          ollamaStatus={ollamaStatus}
          isWebcamActive={isWebcamActive}
        />
      )}

      {currentScreen === 'summary' && matchStats && (
        <MatchSummaryModal
          stats={matchStats}
          coachSummary={coachSummary}
          loadingCoach={loadingCoach}
          onPlayAgain={startMatch}
          onViewAnalytics={() => {
            previousScreenRef.current = 'summary';
            setCurrentScreen('analytics');
          }}
          onHome={() => setCurrentScreen('menu')}
        />
      )}

      {currentScreen === 'analytics' && (
        <AnalyticsDashboard
          history={matchHistory}
          onClose={() => setCurrentScreen(previousScreenRef.current)}
        />
      )}

      {showCalibrationModal && (
        <CalibrationModal
          currentCalibration={calibration}
          controlState={controlState}
          onSave={(newCalib) => {
            setCalibration(newCalib);
            if (visionRef.current) {
              visionRef.current.setCalibration(newCalib);
            }
          }}
          onClose={() => setShowCalibrationModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            engine.setDifficulty(newSettings.difficulty);
          }}
          onClose={() => setShowSettingsModal(false)}
          onOpenCalibration={() => setShowCalibrationModal(true)}
        />
      )}
    </div>
  );
};
