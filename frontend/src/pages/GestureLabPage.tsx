import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Square, RefreshCw, Download, Sliders, CheckCircle2, AlertTriangle, ShieldCheck, Play, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { GestureVisualizer } from '../components/gesture/GestureVisualizer';
import { DryRunControls } from '../components/gesture/DryRunControls';
import { GestureController } from '../features/gesture/gesture-controller';
import { MediaPipeVisionAdapter } from '../features/gesture/mediapipe-adapter';
import {
  CalibrationBounds,
  DEFAULT_CALIBRATION,
  GestureControllerState,
  TrackingStatus,
} from '../features/gesture/landmark-types';
import { loadCalibration, saveCalibration, resetCalibration } from '../features/gesture/calibration';
import { DryRunScenario, generateScenarioFrames } from '../features/gesture/simulated-landmarks';

export interface GestureLabPageProps {
  onNavigate: (path: string) => void;
}

export const GestureLabPage: React.FC<GestureLabPageProps> = ({ onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const visionAdapterRef = useRef<MediaPipeVisionAdapter | null>(null);
  const controllerRef = useRef<GestureController | null>(null);

  // Calibration state
  const [calibration, setCalibration] = useState<CalibrationBounds>(loadCalibration);

  // Reactive Controller State
  const [controllerState, setControllerState] = useState<GestureControllerState>({
    coordinates: { x: 0, y: 0 },
    rawAnchor: { x: 0.5, y: 0.5 },
    smoothedCoordinates: { x: 0, y: 0 },
    tracking: false,
    status: 'IDLE',
    confidence: 0,
    latencyMs: 0,
    fps: 0,
    timestamp: Date.now(),
    gesture: 'none',
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Dry Run state
  const [activeScenario, setActiveScenario] = useState<DryRunScenario | null>(null);
  const [isDryRunActive, setIsDryRunActive] = useState(false);
  const [dryRunLogs, setDryRunLogs] = useState<string[]>([]);
  const dryRunIntervalRef = useRef<any>(null);

  // Initialize controller
  useEffect(() => {
    controllerRef.current = new GestureController(calibration);
    const unsubscribe = controllerRef.current.subscribe((state) => {
      setControllerState(state);
    });
    return () => {
      unsubscribe();
      if (visionAdapterRef.current) {
        visionAdapterRef.current.stopCamera();
      }
      if (dryRunIntervalRef.current) {
        clearInterval(dryRunIntervalRef.current);
      }
    };
  }, []);

  // Update calibration in controller
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setCalibration(calibration);
    }
  }, [calibration]);

  // Start Real Webcam
  const startCamera = async () => {
    try {
      setCameraError(null);
      stopDryRun();

      if (!visionAdapterRef.current) {
        visionAdapterRef.current = new MediaPipeVisionAdapter();
      }

      if (videoRef.current) {
        await visionAdapterRef.current.startCamera(videoRef.current, ({ landmarks, timestampMs, latencyMs }) => {
          if (controllerRef.current) {
            controllerRef.current.processFrame(landmarks, timestampMs, latencyMs, 'TRACKING');
          }
        });
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('[GestureLab] Camera failed to start:', err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Permission Denied: Camera access was blocked. You can still test all controls using the Synthetic Dry-Run mode below.');
      } else {
        setCameraError(`Camera Error: ${err.message || 'Unable to access video device.'}`);
      }
    }
  };

  // Stop Real Webcam
  const stopCamera = () => {
    if (visionAdapterRef.current) {
      visionAdapterRef.current.stopCamera();
    }
    setIsCameraActive(false);
    if (controllerRef.current) {
      controllerRef.current.reset();
    }
  };

  // Run Synthetic Dry-Run Scenario
  const runDryRunScenario = (scenario: DryRunScenario) => {
    stopCamera();
    setActiveScenario(scenario);
    setIsDryRunActive(true);

    const frames = generateScenarioFrames(scenario, 40);
    let frameIdx = 0;

    const logEntry = `[${new Date().toLocaleTimeString()}] Executing Dry-Run: ${scenario} (${frames.length} synthetic frames)`;
    setDryRunLogs((prev) => [logEntry, ...prev.slice(0, 15)]);

    if (dryRunIntervalRef.current) {
      clearInterval(dryRunIntervalRef.current);
    }

    dryRunIntervalRef.current = setInterval(() => {
      if (frameIdx >= frames.length) {
        clearInterval(dryRunIntervalRef.current);
        setIsDryRunActive(false);
        setDryRunLogs((prev) => [`[${new Date().toLocaleTimeString()}] Completed scenario: ${scenario}`, ...prev.slice(0, 15)]);
        return;
      }

      const frame = frames[frameIdx];
      if (controllerRef.current) {
        controllerRef.current.processFrame(frame.landmarks, frame.timestampMs, 12, 'SIMULATED');
      }
      frameIdx++;
    }, 25);
  };

  const stopDryRun = () => {
    if (dryRunIntervalRef.current) {
      clearInterval(dryRunIntervalRef.current);
      dryRunIntervalRef.current = null;
    }
    setIsDryRunActive(false);
    setActiveScenario(null);
  };

  // Calibration handlers
  const handleSetCenter = () => {
    const raw = controllerState.rawAnchor;
    const updated: CalibrationBounds = {
      ...calibration,
      centerX: raw.x,
      centerY: raw.y,
      isCalibrated: true,
    };
    setCalibration(updated);
    saveCalibration(updated);
  };

  const handleResetCalibration = () => {
    const defaults = resetCalibration();
    setCalibration(defaults);
  };

  // Export Markdown / JSON Test Report
  const exportTestReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      environment: {
        userAgent: navigator.userAgent,
        hardwareConcurrency: navigator.hardwareConcurrency,
        cameraActive: isCameraActive,
      },
      calibration,
      controllerTelemetry: {
        normalizedCoordinates: controllerState.coordinates,
        smoothedCoordinates: controllerState.smoothedCoordinates,
        rawAnchor: controllerState.rawAnchor,
        trackingStatus: controllerState.status,
        confidence: controllerState.confidence,
        latencyMs: controllerState.latencyMs,
        fps: controllerState.fps,
      },
      dryRunLogSummary: dryRunLogs,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pong_ai_gesture_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Hidden video element for MediaPipe processing */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-[3px] border-[#111111]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="mint">Vision Lab</Badge>
            <StatusIndicator
              status={
                controllerState.status === 'SIMULATED'
                  ? 'tracking'
                  : isCameraActive
                  ? 'tracking'
                  : 'idle'
              }
              label={
                controllerState.status === 'SIMULATED'
                  ? 'SIMULATED STREAM'
                  : isCameraActive
                  ? 'CAMERA ACTIVE'
                  : 'STANDBY'
              }
            />
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-[#111111]">
            Gesture Control Lab
          </h1>
          <p className="text-sm sm:text-base text-[#525252] font-medium max-w-2xl">
            Test and calibrate MediaPipe Hand Landmarker tracking, OneEuroFilter smoothing, and run complete synthetic dry-run scenarios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isCameraActive ? (
            <Button variant="mint" size="md" onClick={startCamera}>
              <Camera className="w-4 h-4 mr-1" />
              Start Camera
            </Button>
          ) : (
            <Button variant="white" size="md" onClick={stopCamera}>
              <Square className="w-4 h-4 mr-1" />
              Stop Camera
            </Button>
          )}
        </div>
      </div>

      {/* Error alert if camera blocked */}
      {cameraError && (
        <div className="p-4 bg-[#FF5555]/10 border-[2px] border-[#FF5555] rounded-xl flex items-start gap-3 text-xs text-[#111111]">
          <AlertTriangle className="w-5 h-5 text-[#FF5555] shrink-0 mt-0.5" />
          <div>
            <strong className="font-display font-black uppercase block mb-1">Camera Permission Note</strong>
            {cameraError}
          </div>
        </div>
      )}

      {/* Main Grid: Visualizer + Realtime Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visualizer Frame */}
        <div className="lg:col-span-7 space-y-4">
          <GestureVisualizer
            landmarks={controllerState.landmarks}
            coordinates={controllerState.smoothedCoordinates}
            tracking={controllerState.tracking}
            isSimulated={controllerState.status === 'SIMULATED'}
          />

          {/* Privacy Note */}
          <div className="p-3 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-xl flex items-center gap-2.5 text-xs text-[#525252]">
            <ShieldCheck className="w-4 h-4 text-[#62F5AD] shrink-0" />
            <span>
              <strong>Zero frames leave your device:</strong> Processing runs 100% locally in browser memory via WebAssembly GPU delegates.
            </span>
          </div>
        </div>

        {/* Realtime Diagnostics Bento */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="white" className="space-y-4 p-5">
            <h3 className="font-display font-black text-sm uppercase text-[#111111] pb-2 border-b-[2px] border-[#111111]/20">
              Controller Telemetry
            </h3>

            {/* Coordinates Display */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl text-center">
                <span className="block text-[10px] font-mono text-[#737373] uppercase">Game X [-1, 1]</span>
                <span className="font-mono font-black text-2xl text-[#111111]">
                  {controllerState.smoothedCoordinates.x.toFixed(3)}
                </span>
              </div>
              <div className="p-3 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-xl text-center">
                <span className="block text-[10px] font-mono text-[#737373] uppercase">Game Y [-1, 1]</span>
                <span className="font-mono font-black text-2xl text-[#111111]">
                  {controllerState.smoothedCoordinates.y.toFixed(3)}
                </span>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
              <div className="p-2 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-lg">
                <span className="block text-[9px] text-[#737373] uppercase">Latency</span>
                <span className="font-bold text-[#111111]">{controllerState.latencyMs}ms</span>
              </div>
              <div className="p-2 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-lg">
                <span className="block text-[9px] text-[#737373] uppercase">FPS</span>
                <span className="font-bold text-[#111111]">{controllerState.fps || 60}</span>
              </div>
              <div className="p-2 bg-[#FFFDF6] border-[1.5px] border-[#111111] rounded-lg">
                <span className="block text-[9px] text-[#737373] uppercase">Gesture</span>
                <span className="font-bold text-[#111111] uppercase">{controllerState.gesture}</span>
              </div>
            </div>

            {/* Calibration Controls */}
            <div className="space-y-2 pt-2 border-t-[1.5px] border-[#111111]/20">
              <div className="flex items-center justify-between text-xs font-display font-black uppercase text-[#111111]">
                <span>Calibration Bounds</span>
                <span>{calibration.isCalibrated ? 'CALIBRATED' : 'DEFAULT'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Button variant="white" size="sm" onClick={handleSetCenter} disabled={!controllerState.tracking}>
                  Set Center Anchor
                </Button>
                <Button variant="white" size="sm" onClick={handleResetCalibration}>
                  Reset Calibration
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Synthetic Dry-Run Testing Section */}
      <section className="bg-[#FFFDF6] border-[3px] border-[#111111] rounded-2xl p-6 shadow-neo">
        <DryRunControls
          onRunScenario={runDryRunScenario}
          onExportReport={exportTestReport}
          activeScenario={activeScenario}
          isRunning={isDryRunActive}
        />

        {/* Live Dry-Run Event Log */}
        {dryRunLogs.length > 0 && (
          <div className="mt-4 pt-4 border-t-[2px] border-[#111111]/20 space-y-1 font-mono text-[11px] text-[#525252] max-h-36 overflow-y-auto">
            {dryRunLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#62F5AD] shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
