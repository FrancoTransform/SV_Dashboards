'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { PartnerData } from '@/lib/partnerTypes';

interface ChartsProps {
  data: PartnerData[];
}

export function PartnerROICharts({ data }: ChartsProps) {
  const chartData = [...data]
    .sort((a, b) => b.roi_multiple - a.roi_multiple)
    .map((partner) => ({
      name: partner.partner_name,
      roi: partner.roi_multiple,
      commercial_value: partner.total_commercial_value_usd / 1000000,
    }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        ROI Multiple by Partner
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} label={{ value: 'ROI Multiple', angle: -90, position: 'insideLeft', fill: '#fff' }} />
          <Tooltip 
            formatter={(value: number) => `${value.toFixed(2)}x`}
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Bar dataKey="roi" fill="#4dd0e1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InnovationMetricsChart({ data }: ChartsProps) {
  const chartData = [...data].map((partner) => ({
    name: partner.partner_name,
    innovation: partner.avg_innovation_score,
    satisfaction: partner.partner_satisfaction_score / 10, // Scale to 0-10
  }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Innovation & Satisfaction Scores
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} label={{ value: 'Score (0-10)', angle: -90, position: 'insideLeft', fill: '#fff' }} />
          <Tooltip 
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Bar dataKey="innovation" fill="#4dd0e1" name="Innovation Score" />
          <Bar dataKey="satisfaction" fill="#c084fc" name="Satisfaction (scaled)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EngagementTimelineChart({ data }: ChartsProps) {
  const chartData = [...data]
    .sort((a, b) => (b.active_pilots + b.completed_pilots) - (a.active_pilots + a.completed_pilots))
    .map((partner) => ({
      name: partner.partner_name,
      active: partner.active_pilots,
      completed: partner.completed_pilots,
    }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Pilot Engagements by Partner
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} />
          <Tooltip contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }} />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Bar dataKey="active" stackId="a" fill="#4dd0e1" name="Active Pilots" />
          <Bar dataKey="completed" stackId="a" fill="#c084fc" name="Completed Pilots" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

