import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}

interface FocusRadarChartProps {
  data: RadarData[];
  pillarColor?: string; // e.g., var(--color-pillar-health)
}

export default function FocusRadarChart({ data, pillarColor = "#10B981" }: FocusRadarChartProps) {
  return (
    <div className="w-full h-64 bg-surface-primary/30 backdrop-blur-sm rounded-3xl p-4 border border-border-subtle/50">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="90%" data={data}>
          <PolarGrid 
            stroke="var(--color-border-subtle)" 
            strokeOpacity={0.5}
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontWeight: 500 }}
          />
          <Radar
            name="Focus"
            dataKey="A"
            stroke={pillarColor}
            strokeWidth={2}
            fill={pillarColor}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
