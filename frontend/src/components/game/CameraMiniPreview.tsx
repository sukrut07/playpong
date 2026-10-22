import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, ChevronDown, ChevronUp, Eye, EyeOff, ShieldCheck, Activity } from 'lucide-react';
import { HandLandmarks, LANDMARK_INDEX, NormalizedCoordinates } from '../../features/gesture/landmark-types';

export interface CameraMiniPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarks?: HandLandmarks;
  coordinates: NormalizedCoordinates;
  tracking: boolean;
  latencyMs?: number;
  fps?: number;
  controllerMode: 'gesture' | 'keyboard';
  onStopCamera: () => void;
  onStartCamera: () => void;
}

export const CameraMiniPreview: React.FC<CameraMiniPreviewProps> = ({
  videoRef,
  landmarks,
  coordinates,
  tracking,
  latencyMs = 16,
  fps = 60,
  controllerMode,
  onStopCamera,
  onStartCamera,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw 21-joint landmark skeleton over canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!tracking || !landmarks || landmarks.length === 0) {
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Standard MediaPipe hand skeletal connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [5, 9], [9, 10], [10, 11], [11, 12],   // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [0, 17],                               // Palm Base
    ];

    // Bone lines (High contrast green over camera)
    ctx.strokeStyle = '#62F5AD';
    ctx.lineWidth = 2;

    for (const [fromIdx, toIdx] of connections) {
      const fromPt = landmarks[fromIdx];
      const toPt = landmarks[toIdx];
      if (!fromPt || !toPt) continue;

      ctx.beginPath();
      ctx.moveTo(fromPt.x * w, fromPt.y * h);
      ctx.lineTo(toPt.x * w, toPt.y * h);
      ctx.stroke();
    }

    // Joint landmarks
    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = (i === LANDMARK_INDEX.WRIST || i === LANDMARK_INDEX.MIDDLE_FINGER_MCP)
        ? '#D9FF55'
        : '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Highlight Palm Center Anchor in vibrant yellow
    const wrist = landmarks[LANDMARK_INDEX.WRIST];
    const mcp = landmarks[LANDMARK_INDEX.MIDDLE_FINGER_MCP];
    if (wrist && mcp) {
      const palmX = ((wrist.x + mcp.x) / 2) * w;
      const palmY = ((wrist.y + mcp.y) / 2) * h;
      ctx.beginPath();
      ctx.arc(palmX, palmY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#D9FF55';
      ctx.fill();
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [landmarks, tracking]);

  if (controllerMode !== 'gesture') {
    return (
      <div className="absolute bottom-4 right-4 z-30">
        <button
          onClick={onStartCamera}
          className="px-3.5 py-2 bg-[#FFFDF6] border-[2px] border-[#111111] rounded-xl shadow-neo font-display font-black text-xs uppercase flex items-center gap-2 hover:bg-[#62F5AD] transition-all"
        >
          <Camera className="w-4 h-4 text-[#111111]" />
          Enable Hand Tracking
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-30 font-mono text-xs select-none">
      <div className="bg-[#FFFDF6] border-[2.5px] border-[#111111] rounded-2xl shadow-neo overflow-hidden transition-all duration-200">
        {/* Header Bar */}
        <div className="px-3 py-1.5 bg-[#111111] text-[#FFFFFF] flex items-center justify-between gap-2 border-b-[2px] border-[#111111]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                tracking ? 'bg-[#62F5AD] animate-pulse' : 'bg-[#FF5555]'
              }`}
            />
            <span className="font-display font-black text-[11px] uppercase tracking-wider text-[#FFFDF6]">
              {tracking ? 'TRACKING' : 'SEARCHING HAND'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand camera' : 'Collapse camera'}
              className="p-1 hover:bg-[#333333] rounded transition-colors"
            >
              {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onStopCamera}
              title="Stop camera (Switch to Keyboard)"
              className="p-1 hover:bg-[#FF5555] rounded transition-colors"
            >
              <CameraOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Preview Body */}
        {!collapsed && (
          <div className="p-2 space-y-2">
            {/* Mirrored Camera View with Overlay */}
            <div className="relative w-48 h-36 bg-[#000000] border-[1.5px] border-[#111111] rounded-xl overflow-hidden">
              <video
                ref={videoRef as any}
                className="w-full h-full object-cover -scale-x-100"
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                width={192}
                height={144}
                className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100"
              />

              {!tracking && (
                <div className="absolute inset-0 bg-[#000000]/70 flex flex-col items-center justify-center text-center p-2 text-[10px] text-[#FFFFFF]">
                  <Activity className="w-5 h-5 text-[#D9FF55] mb-1 animate-pulse" />
                  <span>Hold hand facing camera</span>
                </div>
              )}
            </div>

            {/* Coordinates & Telemetry */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-[#FFFFFF] border-[1px] border-[#111111] p-1.5 rounded-lg">
              <div>
                <span className="text-[#737373] block uppercase text-[9px]">Paddle X</span>
                <span className="font-bold text-[#111111]">
                  {coordinates.x >= 0 ? `+${coordinates.x.toFixed(2)}` : coordinates.x.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#737373] block uppercase text-[9px]">Paddle Y</span>
                <span className="font-bold text-[#111111]">
                  {coordinates.y >= 0 ? `+${coordinates.y.toFixed(2)}` : coordinates.y.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#737373] block uppercase text-[9px]">Latency</span>
                <span className="font-bold text-[#111111]">{Math.round(latencyMs)}ms</span>
              </div>
              <div>
                <span className="text-[#737373] block uppercase text-[9px]">Filter</span>
                <span className="font-bold text-[#111111]">1€ + EMA</span>
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="flex items-center gap-1 text-[9px] text-[#525252] font-semibold pt-0.5">
              <ShieldCheck className="w-3 h-3 text-[#62F5AD] shrink-0" />
              <span>On-device · Zero frames uploaded</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
