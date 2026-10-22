import React from 'react';
import { Play, Download, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DryRunScenario } from '../../features/gesture/simulated-landmarks';
import { Button } from '../ui/Button';

export interface DryRunControlsProps {
  onRunScenario: (scenario: DryRunScenario) => void;
  onExportReport: () => void;
  activeScenario: DryRunScenario | null;
  isRunning: boolean;
}

export const DryRunControls: React.FC<DryRunControlsProps> = ({
  onRunScenario,
  onExportReport,
  activeScenario,
  isRunning,
}) => {
  const scenarios: Array<{ id: DryRunScenario; title: string; desc: string; badge: string }> = [
    {
      id: 'CENTER_HOLD',
      title: 'A. Center Smoke Test',
      desc: 'Feeds neutral center hand. Confirms normalized bounds and finite coordinates.',
      badge: 'Baseline',
    },
    {
      id: 'LEFT_SWEEP',
      title: 'B. Left Lateral Sweep',
      desc: 'Simulates left movement across calibrated frame. Verifies screen-mirrored paddle tracking.',
      badge: 'Directional',
    },
    {
      id: 'RIGHT_SWEEP',
      title: 'C. Right Lateral Sweep',
      desc: 'Simulates right movement across frame. Verifies positive boundary deflection.',
      badge: 'Directional',
    },
    {
      id: 'VERTICAL_BOUNCE',
      title: 'D. Vertical Range Test',
      desc: 'Oscillates hand vertically to test court elevation and net clearance limits.',
      badge: 'Elevation',
    },
    {
      id: 'NOISY_TREMOR',
      title: 'E. Jitter & Smoothing Test',
      desc: 'Injects high-frequency noise tremor to verify 1€ Filter dampening.',
      badge: 'Filtering',
    },
    {
      id: 'TRACKING_LOSS_RECOVERY',
      title: 'F. Tracking Loss & Hold',
      desc: 'Drops hand for 10 frames then recovers. Verifies coordinate hold without jumping.',
      badge: 'Resilience',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#111111]">
        <div>
          <h3 className="font-display font-black text-lg uppercase text-[#111111]">
            Synthetic Dry-Run Test Suite
          </h3>
          <p className="text-xs text-[#525252] font-medium">
            Automated verification without webcam hardware or browser camera permissions.
          </p>
        </div>
        <Button variant="white" size="sm" onClick={onExportReport}>
          <Download className="w-4 h-4 mr-1" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map((sc) => {
          const isActive = activeScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => !isRunning && onRunScenario(sc.id)}
              className={`p-3.5 border-[2px] border-[#111111] rounded-xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#D9FF55] shadow-neo translate-x-0.5 translate-y-0.5'
                  : 'bg-[#FFFFFF] hover:bg-[#FFFDF6] shadow-neo-sm hover:shadow-neo'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-black text-xs uppercase text-[#111111]">
                  {sc.title}
                </span>
                <span className="px-1.5 py-0.5 bg-[#FFFDF6] border-[1px] border-[#111111] rounded font-mono text-[9px] font-bold">
                  {sc.badge}
                </span>
              </div>
              <p className="text-[11px] text-[#525252] leading-snug mb-3">
                {sc.desc}
              </p>
              <div className="flex items-center justify-between pt-1 border-t-[1px] border-[#111111]/20">
                <span className="text-[10px] font-mono font-bold text-[#111111]">
                  {isActive ? '● RUNNING' : 'CLICK TO RUN'}
                </span>
                <Play className={`w-3.5 h-3.5 ${isActive ? 'text-[#111111] fill-current animate-pulse' : 'text-[#737373]'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
