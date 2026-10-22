import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export interface RallyChartProps {
  data: Array<{ index: number; length: number }>;
}

export const RallyChart: React.FC<RallyChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center border-[2px] border-dashed border-[#111111]/30 rounded-xl text-xs font-mono text-[#737373]">
        No rally telemetry recorded yet
      </div>
    );
  }

  return (
    <div className="w-full h-56 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#11111115" vertical={false} />
          <XAxis
            dataKey="index"
            tick={{ fill: '#111111', fontSize: 10, fontFamily: 'Space Grotesk', fontWeight: 'bold' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#111111', fontSize: 10, fontFamily: 'Space Grotesk' }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#FFFFFF] border-[2px] border-[#111111] p-2 rounded-lg shadow-neo-sm font-mono text-xs">
                    <div className="font-bold text-[#111111]">Rally #{payload[0].payload.index}</div>
                    <div className="text-[#525252]">Returns: {payload[0].value}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="length" fill="#62F5AD" stroke="#111111" strokeWidth={2} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
