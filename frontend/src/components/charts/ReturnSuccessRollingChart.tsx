import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export interface ReturnSuccessPoint {
  attempt: number;
  rate: number; // 0 to 100
}

export interface ReturnSuccessRollingChartProps {
  data: ReturnSuccessPoint[];
  windowSize?: number;
}

export const ReturnSuccessRollingChart: React.FC<ReturnSuccessRollingChartProps> = ({
  data,
  windowSize = 5,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs font-mono text-[#737373]">
        No return attempt series recorded.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="text-[10px] text-[#737373] flex items-center justify-between">
        <span>Metric: Rolling {windowSize}-Attempt Return Rate</span>
        <span className="text-[#111111] font-bold">ITTF Training Baseline: 75%</span>
      </div>

      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#11111120" />
            <XAxis
              dataKey="attempt"
              stroke="#111111"
              tick={{ fill: '#737373', fontSize: 10 }}
              tickLine={{ stroke: '#111111' }}
              label={{ value: 'Attempt #', position: 'insideBottomRight', offset: -4, fill: '#737373', fontSize: 10 }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#111111"
              tick={{ fill: '#737373', fontSize: 10 }}
              tickLine={{ stroke: '#111111' }}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFDF6',
                border: '2px solid #111111',
                borderRadius: '8px',
                boxShadow: '3px 3px 0px #111111',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
              formatter={(val: any) => [`${val}%`, `Rolling Return Rate`]}
            />
            <ReferenceLine y={75} stroke="#62F5AD" strokeWidth={2} strokeDasharray="3 3" label={{ value: '75% Target', fill: '#111111', fontSize: 9, position: 'insideTopLeft' }} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#111111"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#D9FF55', stroke: '#111111', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: '#62F5AD', stroke: '#111111', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
