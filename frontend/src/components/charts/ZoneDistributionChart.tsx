import React from 'react';
import { TableZoneDistribution } from '@game-engine/types';

export interface ZoneDistributionChartProps {
  distribution: TableZoneDistribution;
}

export const ZoneDistributionChart: React.FC<ZoneDistributionChartProps> = ({ distribution }) => {
  const total = (distribution.left || 0) + (distribution.center || 0) + (distribution.right || 0);

  const leftPct = total > 0 ? Math.round(((distribution.left || 0) / total) * 100) : 0;
  const centerPct = total > 0 ? Math.round(((distribution.center || 0) / total) * 100) : 0;
  const rightPct = total > 0 ? Math.round(((distribution.right || 0) / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 2D Table Heatmap representation */}
      <div className="relative w-full aspect-[2/1] bg-[#0f382a] border-[3px] border-[#111111] rounded-xl overflow-hidden p-2 flex flex-col justify-between shadow-neo-sm">
        {/* Net line in center */}
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/70 -translate-x-1/2 border-r-[1px] border-dashed border-white/50" />

        {/* Zones overlay */}
        <div className="grid grid-cols-3 h-full gap-1 z-10">
          {/* Left Zone */}
          <div className="flex flex-col items-center justify-center p-2 rounded bg-white/10 border border-white/20 text-white">
            <span className="font-display font-extrabold text-xs uppercase tracking-wider">Left</span>
            <span className="font-mono font-black text-lg text-[#D9FF55]">{leftPct}%</span>
            <span className="text-[10px] text-white/70 font-mono">({distribution.left} hits)</span>
          </div>

          {/* Center Zone */}
          <div className="flex flex-col items-center justify-center p-2 rounded bg-white/20 border border-white/30 text-white">
            <span className="font-display font-extrabold text-xs uppercase tracking-wider">Center</span>
            <span className="font-mono font-black text-lg text-[#62F5AD]">{centerPct}%</span>
            <span className="text-[10px] text-white/70 font-mono">({distribution.center} hits)</span>
          </div>

          {/* Right Zone */}
          <div className="flex flex-col items-center justify-center p-2 rounded bg-white/10 border border-white/20 text-white">
            <span className="font-display font-extrabold text-xs uppercase tracking-wider">Right</span>
            <span className="font-mono font-black text-lg text-[#BDA5FF]">{rightPct}%</span>
            <span className="text-[10px] text-white/70 font-mono">({distribution.right} hits)</span>
          </div>
        </div>
      </div>

      {/* Depth metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-lg flex items-center justify-between">
          <span className="font-bold text-[#525252]">Deep Baseline:</span>
          <span className="font-black text-[#111111]">{distribution.deep || 0} balls</span>
        </div>
        <div className="p-2.5 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-lg flex items-center justify-between">
          <span className="font-bold text-[#525252]">Short Net Drops:</span>
          <span className="font-black text-[#111111]">{distribution.short || 0} balls</span>
        </div>
      </div>
    </div>
  );
};
