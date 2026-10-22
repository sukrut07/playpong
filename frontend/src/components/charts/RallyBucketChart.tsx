import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface RallyBucketData {
  bucket: string;
  count: number;
}

export interface RallyBucketChartProps {
  rallyLengths: number[];
}

export const RallyBucketChart: React.FC<RallyBucketChartProps> = ({ rallyLengths }) => {
  const buckets: RallyBucketData[] = [
    { bucket: '1-2', count: 0 },
    { bucket: '3-4', count: 0 },
    { bucket: '5-6', count: 0 },
    { bucket: '7-9', count: 0 },
    { bucket: '10+', count: 0 },
  ];

  for (const len of rallyLengths) {
    if (len <= 2) buckets[0].count++;
    else if (len <= 4) buckets[1].count++;
    else if (len <= 6) buckets[2].count++;
    else if (len <= 9) buckets[3].count++;
    else buckets[4].count++;
  }

  const COLORS = ['#FFFFFF', '#D9FF55', '#62F5AD', '#BDA5FF', '#FFB380'];

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="text-[10px] text-[#737373] flex items-center justify-between">
        <span>Rally Length Distribution</span>
        <span className="text-[#111111] font-bold">Total Rallies: {rallyLengths.length}</span>
      </div>

      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#11111120" />
            <XAxis
              dataKey="bucket"
              stroke="#111111"
              tick={{ fill: '#737373', fontSize: 10 }}
              tickLine={{ stroke: '#111111' }}
              label={{ value: 'Returns per Rally', position: 'insideBottom', offset: -2, fill: '#737373', fontSize: 9 }}
            />
            <YAxis
              stroke="#111111"
              tick={{ fill: '#737373', fontSize: 10 }}
              tickLine={{ stroke: '#111111' }}
              allowDecimals={false}
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
              formatter={(val: any) => [`${val} rallies`, 'Frequency']}
            />
            <Bar dataKey="count" stroke="#111111" strokeWidth={2} radius={[4, 4, 0, 0]}>
              {buckets.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
