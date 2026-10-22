import React, { useState } from 'react';
import { CalibrationData, isValidCalibration, saveCalibration } from '../../vision/calibration';
import { HandControlState } from '../../../../shared/types';
import { CheckCircle2, Crosshair, RefreshCw, X } from 'lucide-react';

interface CalibrationModalProps {
  currentCalibration: CalibrationData;
  controlState: HandControlState;
  onSave: (data: CalibrationData) => void;
  onClose: () => void;
}

type CalibStep = 'center' | 'left' | 'right' | 'top' | 'bottom' | 'review';

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  currentCalibration,
  controlState,
  onSave,
  onClose,
}) => {
  const [step, setStep] = useState<CalibStep>('center');
  const [draft, setDraft] = useState<CalibrationData>({ ...currentCalibration });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const captureCurrent = () => {
    if (!controlState.rawLandmarks || controlState.rawLandmarks.length === 0) {
      setErrorMsg('No hand detected. Please hold your hand up to the camera.');
      return;
    }
    setErrorMsg(null);

    // Raw wrist & middle knuckle anchor
    const hand = controlState.rawLandmarks;
    const rawX = (hand[0].x + hand[9].x) * 0.5;
    const rawY = (hand[0].y + hand[9].y) * 0.5;
    // Mirrored for user intuition
    const mirroredX = 1.0 - rawX;

    if (step === 'center') {
      setDraft((prev: CalibrationData) => ({ ...prev, centerX: mirroredX, centerY: rawY }));
      setStep('left');
    } else if (step === 'left') {
      setDraft((prev: CalibrationData) => ({ ...prev, minX: Math.max(0.05, mirroredX) }));
      setStep('right');
    } else if (step === 'right') {
      setDraft((prev: CalibrationData) => ({ ...prev, maxX: Math.min(0.95, mirroredX) }));
      setStep('top');
    } else if (step === 'top') {
      setDraft((prev: CalibrationData) => ({ ...prev, minY: Math.max(0.05, rawY) }));
      setStep('bottom');
    } else if (step === 'bottom') {
      setDraft((prev: CalibrationData) => ({ ...prev, maxY: Math.min(0.95, rawY) }));
      setStep('review');
    }
  };

  const handleFinish = () => {
    // Ensure min < max
    const finalData: CalibrationData = {
      minX: Math.min(draft.minX, draft.maxX),
      maxX: Math.max(draft.minX, draft.maxX),
      minY: Math.min(draft.minY, draft.maxY),
      maxY: Math.max(draft.minY, draft.maxY),
      centerX: draft.centerX,
      centerY: draft.centerY,
      isCalibrated: true,
    };

    if (!isValidCalibration(finalData)) {
      setErrorMsg('Calibration window too narrow. Please ensure you move across a comfortable range.');
      return;
    }

    saveCalibration(finalData);
    onSave(finalData);
    onClose();
  };

  const stepInstructions: Record<CalibStep, { title: string; desc: string }> = {
    center: {
      title: 'Step 1: Center Neutral Position',
      desc: 'Hold your hand comfortably in the center of your webcam frame.',
    },
    left: {
      title: 'Step 2: Left Boundary',
      desc: 'Move your hand to your comfortable left reaching boundary.',
    },
    right: {
      title: 'Step 3: Right Boundary',
      desc: 'Move your hand across to your comfortable right reaching boundary.',
    },
    top: {
      title: 'Step 4: High Stroke Reach',
      desc: 'Raise your hand to where you want the highest paddle reach to be.',
    },
    bottom: {
      title: 'Step 5: Low Stroke Reach',
      desc: 'Lower your hand to your lowest table-level stroke position.',
    },
    review: {
      title: 'Calibration Complete!',
      desc: 'Your tracking boundary is ready. Verify and save to continue.',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-md glass-panel-accent p-6 rounded-3xl border border-cyan-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Crosshair className="w-4 h-4" />
          <span>Hand Calibration Assistant</span>
        </div>

        <h3 className="text-xl font-bold font-display text-white">
          {stepInstructions[step].title}
        </h3>
        <p className="text-sm text-slate-300 mt-1 leading-relaxed">
          {stepInstructions[step].desc}
        </p>

        {/* Live Coordinate Display */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-400">
            Current Hand:{' '}
            <span className={controlState.tracking ? 'text-emerald-400' : 'text-amber-400'}>
              {controlState.tracking ? 'Tracked' : 'Searching...'}
            </span>
          </div>
          <div className="text-cyan-300">
            X: {controlState.x.toFixed(2)} | Y: {controlState.y.toFixed(2)}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex space-x-3">
          {step !== 'review' ? (
            <button
              onClick={captureCurrent}
              className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-display text-sm flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Capture Point</span>
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold font-display text-sm flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Save & Apply Calibration</span>
            </button>
          )}

          <button
            onClick={() => {
              setStep('center');
              setErrorMsg(null);
            }}
            className="py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-300 text-sm font-semibold flex items-center justify-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
