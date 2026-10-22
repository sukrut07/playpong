import React, { useRef, useEffect } from 'react';
import { HandLandmarks, LANDMARK_INDEX, NormalizedCoordinates } from '../../features/gesture/landmark-types';

export interface GestureVisualizerProps {
  landmarks?: HandLandmarks;
  coordinates: NormalizedCoordinates;
  tracking: boolean;
  isSimulated?: boolean;
}

export const GestureVisualizer: React.FC<GestureVisualizerProps> = ({
  landmarks,
  coordinates,
  tracking,
  isSimulated = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw coordinate grid
    ctx.strokeStyle = '#11111120';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    if (!tracking || !landmarks || landmarks.length === 0) {
      ctx.fillStyle = '#737373';
      ctx.font = 'bold 12px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(
        isSimulated ? 'Select a Dry-Run preset below to test tracking' : 'Start camera or select Dry-Run preset',
        canvas.width / 2,
        canvas.height / 2
      );
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Draw skeletal connections between joints
    const connections = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle
      [5, 9], [9, 10], [10, 11], [11, 12],
      // Ring
      [9, 13], [13, 14], [14, 15], [15, 16],
      // Pinky
      [13, 17], [17, 18], [18, 19], [19, 20],
      // Palm base
      [0, 17],
    ];

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.5;

    for (const [fromIdx, toIdx] of connections) {
      const fromPt = landmarks[fromIdx];
      const toPt = landmarks[toIdx];
      if (!fromPt || !toPt) continue;

      ctx.beginPath();
      ctx.moveTo(fromPt.x * w, fromPt.y * h);
      ctx.lineTo(toPt.x * w, toPt.y * h);
      ctx.stroke();
    }

    // Draw joint dots
    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = i === LANDMARK_INDEX.WRIST || i === LANDMARK_INDEX.MIDDLE_FINGER_MCP ? '#62F5AD' : '#D9FF55';
      ctx.fill();
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw mapped virtual paddle anchor
    // coordinates.x is in [-1, 1]; map to canvas: 0 -> -1, w -> +1
    const paddleX = ((coordinates.x + 1) / 2) * w;
    // coordinates.y is in [-1, 1]; game Y is up (+1), so canvas Y = (1 - (y+1)/2) * h
    const paddleY = (1 - (coordinates.y + 1) / 2) * h;

    ctx.save();
    ctx.shadowColor = '#111111';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#62F5AD';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(paddleX - 25, paddleY - 15, 50, 30, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 9px "Space Grotesk"';
    ctx.textAlign = 'center';
    ctx.fillText('PADDLE', paddleX, paddleY + 3);
    ctx.restore();
  }, [landmarks, coordinates, tracking, isSimulated]);

  return (
    <div className="relative w-full aspect-[4/3] bg-[#FFFDF6] border-[3px] border-[#111111] rounded-2xl shadow-neo overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
