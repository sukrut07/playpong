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

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
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

      ctx.strokeStyle = '#CCFF00';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.setLineDash([]);

      if (landmarks && landmarks.length >= 21) {
        // Draw bones
        ctx.strokeStyle = '#CCFF00';
        ctx.lineWidth = 2;
        for (const [start, end] of CONNECTIONS) {
          const p1 = landmarks[start];
          const p2 = landmarks[end];
          const x1 = (1 - p1.x) * canvas.width;
          const y1 = p1.y * canvas.height;
          const x2 = (1 - p2.x) * canvas.width;
          const y2 = p2.y * canvas.height;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Draw joints
        for (let i = 0; i < landmarks.length; i++) {
          const pt = landmarks[i];
          const x = (1 - pt.x) * canvas.width;
          const y = pt.y * canvas.height;

          ctx.fillStyle = i === 0 ? '#FF6B4A' : '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, i === 0 ? 4 : 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw paddle anchor
        const anchorX = (1 - (landmarks[0].x + landmarks[9].x) * 0.5) * canvas.width;
        const anchorY = (landmarks[0].y + landmarks[9].y) * 0.5 * canvas.height;

        ctx.strokeStyle = '#FF6B4A';
        ctx.fillStyle = '#CCFF00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(anchorX, anchorY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [controlState, calibration, isCalibrating]);

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 transition-all duration-200 select-none ${
        minimized ? 'w-40 h-11' : 'w-60 h-48'
      } neo-box bg-[#121212] overflow-hidden flex flex-col`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-white border-b-[2px] border-[#121212] text-xs font-mono">
        <div className="flex items-center space-x-1.5 font-bold">
          <Camera className="w-3.5 h-3.5 text-[#121212]" />
          <span className="uppercase text-[11px]">MediaPipe PIP</span>
        </div>
        <div className="flex items-center space-x-2">
          {controlState.tracking ? (
            <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] border border-black animate-pulse" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A] border border-black" />
          )}
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-gray-600 hover:text-black"
          >
            {minimized ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Video & Landmark Canvas */}
      {!minimized && (
        <div className="relative flex-1 bg-black overflow-hidden">
          <video
            ref={videoRef as any}
            className="w-full h-full object-cover transform -scale-x-100 opacity-60"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            width={240}
            height={160}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] font-mono font-bold text-white">
            <span className={controlState.tracking ? 'text-[#CCFF00]' : 'text-[#FF6B4A]'}>
              {controlState.tracking ? `HAND (${controlState.gesture.toUpperCase()})` : 'SHOW HAND'}
            </span>
            {onRecalibrate && (
              <button
                onClick={onRecalibrate}
                className="text-[#CCFF00] hover:underline"
              >
                RECALIBRATE
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
