import React, { useRef, useEffect } from 'react';
import { HandControlState } from '../../../../shared/types';
import { CalibrationData } from '../../vision/calibration';
import { Camera, Eye, EyeOff } from 'lucide-react';

interface WebcamOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  controlState: HandControlState;
  calibration: CalibrationData;
  isCalibrating?: boolean;
  onRecalibrate?: () => void;
}

// MediaPipe 21 hand skeleton joint connections
const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17], // Knuckles
];

export const WebcamOverlay: React.FC<WebcamOverlayProps> = ({
  videoRef,
  controlState,
  calibration,
  isCalibrating = false,
  onRecalibrate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [minimized, setMinimized] = React.useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const landmarks = controlState.rawLandmarks;

      // Draw calibration rectangle
      const boxX = (1 - calibration.maxX) * canvas.width;
      const boxW = (calibration.maxX - calibration.minX) * canvas.width;
      const boxY = calibration.minY * canvas.height;
      const boxH = (calibration.maxY - calibration.minY) * canvas.height;

      ctx.strokeStyle = isCalibrating ? 'rgba(255, 94, 54, 0.8)' : 'rgba(0, 242, 254, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.setLineDash([]);

      if (landmarks && landmarks.length >= 21) {
        // Draw skeletal bones
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        for (const [start, end] of CONNECTIONS) {
          const p1 = landmarks[start];
          const p2 = landmarks[end];
          // Mirror X
          const x1 = (1 - p1.x) * canvas.width;
          const y1 = p1.y * canvas.height;
          const x2 = (1 - p2.x) * canvas.width;
          const y2 = p2.y * canvas.height;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Draw joint landmarks
        for (let i = 0; i < landmarks.length; i++) {
          const pt = landmarks[i];
          const x = (1 - pt.x) * canvas.width;
          const y = pt.y * canvas.height;

          ctx.fillStyle = i === 0 ? '#ff5e36' : i === 8 || i === 12 ? '#fadb14' : '#00f2fe';
          ctx.beginPath();
          ctx.arc(x, y, i === 0 ? 5 : 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw paddle center anchor indicator
        const anchorX = (1 - (landmarks[0].x + landmarks[9].x) * 0.5) * canvas.width;
        const anchorY = (landmarks[0].y + landmarks[9].y) * 0.5 * canvas.height;

        ctx.strokeStyle = '#ff5e36';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(anchorX, anchorY, 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [controlState, calibration, isCalibrating]);

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 transition-all duration-300 ${
        minimized ? 'w-36 h-12' : 'w-56 h-44'
      } rounded-xl overflow-hidden glass-panel flex flex-col`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border-b border-slate-700/50 text-xs">
        <div className="flex items-center space-x-1.5">
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">Vision Tracker</span>
        </div>
        <div className="flex items-center space-x-2">
          {controlState.tracking ? (
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          )}
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-slate-400 hover:text-slate-200"
            title={minimized ? 'Expand Camera' : 'Minimize Camera'}
          >
            {minimized ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Video & Landmark Canvas */}
      {!minimized && (
        <div className="relative flex-1 bg-black/80 overflow-hidden">
          <video
            ref={videoRef as any}
            className="w-full h-full object-cover transform -scale-x-100 opacity-60"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            width={224}
            height={140}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Tracking Status Pill */}
          <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300">
            <span className={controlState.tracking ? 'text-cyan-300 font-mono' : 'text-amber-400 font-mono'}>
              {controlState.tracking ? `Hand (${controlState.gesture.toUpperCase()})` : 'Show hand to camera'}
            </span>
            {onRecalibrate && (
              <button
                onClick={onRecalibrate}
                className="text-[10px] text-cyan-400 hover:text-cyan-200 underline"
              >
                Calibrate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
