import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface ScoreTimelinePoint {
  rally: number;
  playerScore: number;
  opponentScore: number;
  pointWinner?: 'player' | 'opponent';
}

export interface ScoreTimelineChartProps {
  data: ScoreTimelinePoint[];
}

export const ScoreTimelineChart: React.FC<ScoreTimelineChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs font-mono text-[#737373]">
        No score timeline points recorded for this match.
      </div>
    );
  }

  return (
    <div className="w-full h-56 font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#11111120" />
          <XAxis
            dataKey="rally"
            stroke="#111111"
            tick={{ fill: '#737373', fontSize: 10 }}
            tickLine={{ stroke: '#111111' }}
            label={{ value: 'Rally #', position: 'insideBottomRight', offset: -4, fill: '#737373', fontSize: 10 }}
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
            formatter={(value: any, name: any) => [
              value,
              name === 'playerScore' ? 'Player (Human)' : 'Opponent (AI)',
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
            formatter={(val) => (val === 'playerScore' ? 'Player Score' : 'Opponent Score')}
          />
          <Line
            type="stepAfter"
            dataKey="playerScore"
            stroke="#111111"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#62F5AD', stroke: '#111111', strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: '#62F5AD', stroke: '#111111', strokeWidth: 2 }}
          />
          <Line
            type="stepAfter"
            dataKey="opponentScore"
            stroke="#737373"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={{ r: 3, fill: '#BDA5FF', stroke: '#111111', strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: '#BDA5FF', stroke: '#111111', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
