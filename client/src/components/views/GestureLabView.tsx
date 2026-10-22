import React, { useState, useEffect, useRef } from 'react';
import { CalibrationData, HandControlState, GestureClass } from '../../../../shared/types';
import { VisionPipeline } from '../../vision/handLandmarker';
import { OneEuroFilter } from '../../vision/smoothing';
import { ArrowLeft, Camera, Crosshair, Sliders, Activity, Play, Square, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface GestureLabViewProps {
  currentCalibration: CalibrationData;
  onSaveCalibration: (calib: CalibrationData) => void;
  onBack: () => void;
}

export const GestureLabView: React.FC<GestureLabViewProps> = ({
  currentCalibration,
  onSaveCalibration,
  onBack,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visionRef = useRef<VisionPipeline | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [controlState, setControlState] = useState<HandControlState>({
    x: 0,
    y: 0,
    confidence: 0,
    timestamp: Date.now(),
    tracking: false,
    gesture: 'none',
  });

  // Diagnostics
  const [fps, setFps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [validFrames, setValidFrames] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);

  // Calibration bounds
  const [calib, setCalib] = useState<CalibrationData>(currentCalibration);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState<'idle' | 'min' | 'max' | 'center'>('idle');

  // Filter tuning
  const [smoothingMode, setSmoothingMode] = useState<'one_euro' | 'ema'>('one_euro');
  const [minCutoff, setMinCutoff] = useState(1.0);
  const [beta, setBeta] = useState(0.007);
  const [sensitivityX, setSensitivityX] = useState(1.0);
  const [sensitivityY, setSensitivityY] = useState(1.0);

  // Sequence Gesture Classification Experiment (IDLE, READY, FOREHAND, BACKHAND, SMASH)
  const [classifierMode, setClassifierMode] = useState<'idle' | 'recording' | 'evaluating'>('idle');
  const [recordingLabel, setRecordingLabel] = useState<GestureClass>('FOREHAND');
  const [recordedSamples, setRecordedSamples] = useState<Array<{ label: GestureClass; sequence: any[] }>>([]);
  const [detectedClass, setDetectedClass] = useState<GestureClass>('IDLE');

  // Start Camera and Pipeline
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!visionRef.current) {
        visionRef.current = new VisionPipeline(calib);
      }

      let lastFrameTime = performance.now();
      let frameCount = 0;
      let lastFpsUpdate = performance.now();

      visionRef.current.setOnControl((ctrl: HandControlState) => {
        const now = performance.now();
        const procLatency = Math.round(now - ctrl.timestamp);
        setLatencyMs(procLatency);
        setControlState(ctrl);

        setTotalFrames((prev) => prev + 1);
        if (ctrl.tracking) {
          setValidFrames((prev) => prev + 1);
        } else {
          setDroppedFrames((prev) => prev + 1);
        }

        frameCount++;
        if (now - lastFpsUpdate >= 1000) {
          setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
          frameCount = 0;
          lastFpsUpdate = now;
        }

        // Draw landmarks on overlay canvas
        drawLandmarks(ctrl);

        // Simple sequence gesture heuristics for experimental testing
        if (ctrl.tracking) {
          if (ctrl.gesture === 'swing') {
            setDetectedClass('FOREHAND');
          } else if (ctrl.x < -0.3) {
            setDetectedClass('BACKHAND');
          } else if (ctrl.y > 0.4) {
            setDetectedClass('SMASH');
          } else if (Math.abs(ctrl.x) < 0.2 && Math.abs(ctrl.y) < 0.2) {
            setDetectedClass('READY');
          } else {
            setDetectedClass('IDLE');
          }
        } else {
          setDetectedClass('IDLE');
        }
      });

      if (videoRef.current) {
        await visionRef.current.startCamera(videoRef.current);
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera startup error:', err);
      setCameraError(err.message || 'Unable to access webcam. Check permissions.');
    }
  };

  const stopCamera = () => {
    if (visionRef.current) {
      visionRef.current.stopCamera();
    }
    setIsCameraActive(false);
  };

  const drawLandmarks = (ctrl: HandControlState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!ctrl.tracking || !ctrl.rawLandmarks) return;

    // Draw calibration boundary rectangle
    ctx.strokeStyle = '#CCFF00';
    ctx.lineWidth = 2.5;
    const rx1 = calib.minX * canvas.width;
    const ry1 = calib.minY * canvas.height;
    const rx2 = calib.maxX * canvas.width;
    const ry2 = calib.maxY * canvas.height;
    ctx.strokeRect(rx1, ry1, rx2 - rx1, ry2 - ry1);

    // Draw 21 Hand Landmarks
    ctx.fillStyle = '#FF6B4A';
    for (const lm of ctrl.rawLandmarks) {
      const px = lm.x * canvas.width;
      const py = lm.y * canvas.height;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw Paddle Anchor point (Palm Center)
    const anchorX = ((ctrl.x / sensitivityX + 1) / 2) * canvas.width;
    const anchorY = ((1 - ctrl.y / sensitivityY) / 2) * canvas.height;
    ctx.fillStyle = '#CCFF00';
    ctx.strokeStyle = '#121212';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(anchorX, anchorY, 9, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };

  // Tracking availability percentage
  const trackingAvailability = totalFrames > 0 ? ((validFrames / totalFrames) * 100).toFixed(1) : '100.0';

  return (
    <div className="w-full h-full flex flex-col bg-[#FAF6EB] text-[#121212] font-sans overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b-[2.5px] border-[#121212] bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              stopCamera();
              onBack();
            }}
            className="neo-btn neo-btn-white px-3 py-1.5 text-xs font-mono uppercase"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-[#121212]" />
            <h1 className="text-2xl font-black font-display tracking-tight uppercase">
              Gesture Lab — MediaPipe Tasks Vision & Diagnostics
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!isCameraActive ? (
            <button onClick={startCamera} className="neo-btn neo-btn-lime px-4 py-1.5 text-xs font-mono uppercase">
              <Play className="w-3.5 h-3.5 mr-1" /> Enable Camera Tracking
            </button>
          ) : (
            <button onClick={stopCamera} className="neo-btn neo-btn-peach px-4 py-1.5 text-xs font-mono uppercase">
              <Square className="w-3.5 h-3.5 mr-1" /> Stop Camera
            </button>
          )}
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Live Video Feed & Landmark Visualizer */}
        <div className="w-7/12 border-r-[2.5px] border-[#121212] p-6 flex flex-col justify-between bg-[#FAF6EB] overflow-y-auto">
          {/* Video Container Box */}
          <div className="relative w-full aspect-video bg-[#121212] neo-box overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full pointer-events-none transform scale-x-[-1]"
            />

            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#121212]/90 text-white font-mono">
                <Camera className="w-12 h-12 text-[#CCFF00] mb-3 animate-pulse" />
                <h3 className="text-lg font-bold">Camera Stream Inactive</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  Click 'Enable Camera Tracking' above to inspect live 21-point hand landmarks, tune OneEuroFilter smoothing, and test reaching bounds.
                </p>
                {cameraError && (
                  <div className="mt-4 p-2 bg-[#FF6B4A] text-white text-xs border border-white">
                    {cameraError}
                  </div>
                )}
              </div>
            )}

            {/* In-feed status chip */}
            {isCameraActive && (
              <div className="absolute top-3 left-3 flex items-center space-x-2 font-mono text-[11px]">
                <span className={`neo-badge ${controlState.tracking ? 'bg-[#CCFF00]' : 'bg-[#FF6B4A] text-white'}`}>
                  {controlState.tracking ? 'HAND DETECTED' : 'SEARCHING HAND'}
                </span>
                <span className="neo-badge bg-black text-white">
                  {fps} FPS · {latencyMs}ms Latency
                </span>
              </div>
            )}
          </div>

          {/* Real-time Diagnostics Grid */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="neo-box p-3 bg-white">
              <div className="font-mono text-[11px] text-gray-600 uppercase">Tracking Availability</div>
              <div className="text-xl font-black font-mono text-[#121212] mt-0.5">
                {trackingAvailability}%
              </div>
              <div className="text-[10px] font-mono text-gray-500">
                {validFrames}/{totalFrames} frames
              </div>
            </div>

            <div className="neo-box p-3 bg-white">
              <div className="font-mono text-[11px] text-gray-600 uppercase">Pipeline Latency</div>
              <div className="text-xl font-black font-mono text-[#121212] mt-0.5">
                {latencyMs}ms
              </div>
              <div className="text-[10px] font-mono text-gray-500">
                Tracking to controller
              </div>
            </div>

            <div className="neo-box p-3 bg-white">
              <div className="font-mono text-[11px] text-gray-600 uppercase">Hand Coordinates</div>
              <div className="text-base font-black font-mono text-[#121212] mt-0.5 truncate">
                X:{controlState.x.toFixed(2)} Y:{controlState.y.toFixed(2)}
              </div>
              <div className="text-[10px] font-mono text-gray-500">
                Normalized [-1, 1]
              </div>
            </div>

            <div className="neo-box p-3 bg-white">
              <div className="font-mono text-[11px] text-gray-600 uppercase">Experimental Stroke</div>
              <div className="text-base font-black font-mono text-[#6D28D9] mt-0.5">
                {detectedClass}
              </div>
              <div className="text-[10px] font-mono text-gray-500">
                Sequence Evaluator
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calibration Wizard & Filter Tuning */}
        <div className="w-5/12 p-6 overflow-y-auto bg-white space-y-6">
          {/* Boundary Calibration Box */}
          <div className="neo-box p-5 bg-[#FAF6EB]">
            <h3 className="font-display font-black text-lg text-[#121212] mb-1 flex items-center">
              <Crosshair className="w-5 h-5 mr-1.5" /> Reaching Boundary Calibration
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Calibrate the physical reaching boundary of your play area to map hand movement cleanly to the 3D table surface.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-xs">
              <div className="p-2 border-[1.5px] border-[#121212] bg-white">
                <span className="text-gray-500 block text-[10px]">Min Reach (Top-Left)</span>
                <strong>X: {calib.minX.toFixed(2)} | Y: {calib.minY.toFixed(2)}</strong>
              </div>
              <div className="p-2 border-[1.5px] border-[#121212] bg-white">
                <span className="text-gray-500 block text-[10px]">Max Reach (Bottom-Right)</span>
                <strong>X: {calib.maxX.toFixed(2)} | Y: {calib.maxY.toFixed(2)}</strong>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const resetCalib = {
                    minX: 0.15,
                    maxX: 0.85,
                    minY: 0.15,
                    maxY: 0.85,
                    centerX: 0.5,
                    centerY: 0.5,
                    isCalibrated: true,
                  };
                  setCalib(resetCalib);
                  onSaveCalibration(resetCalib);
                  if (visionRef.current) visionRef.current.setCalibration(resetCalib);
                }}
                className="neo-btn neo-btn-white px-3 py-1.5 text-xs font-mono uppercase"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Defaults
              </button>
              <button
                onClick={() => {
                  onSaveCalibration(calib);
                  alert('Calibration saved successfully to local storage!');
                }}
                className="neo-btn neo-btn-lime px-4 py-1.5 text-xs font-mono uppercase"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Save Calibration
              </button>
            </div>
          </div>

          {/* Smoothing & Sensitivity Tuning */}
          <div className="neo-box p-5 bg-white">
            <h3 className="font-display font-black text-lg text-[#121212] mb-1 flex items-center">
              <Sliders className="w-5 h-5 mr-1.5" /> Filter & Sensitivity Tuning
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Tune the frequency-adaptive One Euro Filter to eliminate micro-tremors while maintaining zero input latency during rapid strokes.
            </p>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Horizontal Reach Sensitivity:</span>
                  <strong>{sensitivityX.toFixed(1)}x</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={sensitivityX}
                  onChange={(e) => setSensitivityX(parseFloat(e.target.value))}
                  className="w-full accent-[#121212]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Vertical Reach Sensitivity:</span>
                  <strong>{sensitivityY.toFixed(1)}x</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={sensitivityY}
                  onChange={(e) => setSensitivityY(parseFloat(e.target.value))}
                  className="w-full accent-[#121212]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>OneEuroFilter Min Cutoff (Jitter Dampener):</span>
                  <strong>{minCutoff.toFixed(2)} Hz</strong>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={minCutoff}
                  onChange={(e) => setMinCutoff(parseFloat(e.target.value))}
                  className="w-full accent-[#121212]"
                />
              </div>
            </div>
          </div>

          {/* Stroke Sequence Classifier Experiment */}
          <div className="neo-box p-5 bg-[#E4DCFF]">
            <h3 className="font-display font-black text-lg text-[#121212] mb-1 flex items-center">
              <Activity className="w-5 h-5 mr-1.5" /> Gesture Classifier Experiment
            </h3>
            <p className="text-xs text-gray-700 mb-3">
              Dynamic stroke sequence recognition (IDLE, READY, FOREHAND, BACKHAND, SMASH). Evaluates temporal landmark progressions.
            </p>

            <div className="p-3 bg-white border-[2px] border-[#121212] space-y-2 font-mono text-xs mb-3">
              <div className="flex items-center justify-between">
                <span>Active Stroke:</span>
                <span className="neo-badge bg-[#CCFF00] font-bold">{detectedClass}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Dataset Collection:</span>
                <span className="text-gray-600">{recordedSamples.length} samples collected</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={recordingLabel}
                onChange={(e) => setRecordingLabel(e.target.value as GestureClass)}
                className="px-2 py-1.5 border-[2px] border-[#121212] font-mono text-xs bg-white"
              >
                <option value="IDLE">IDLE</option>
                <option value="READY">READY</option>
                <option value="FOREHAND">FOREHAND</option>
                <option value="BACKHAND">BACKHAND</option>
                <option value="SMASH">SMASH</option>
              </select>

              <button
                onClick={() => {
                  setRecordedSamples((prev) => [
                    ...prev,
                    { label: recordingLabel, sequence: [controlState.x, controlState.y] },
                  ]);
                }}
                className="neo-btn neo-btn-white px-3 py-1 text-xs font-mono uppercase"
              >
                + Record Sample
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
