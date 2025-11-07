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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { PortfolioTrendsData } from '@/lib/cycleTypes';

interface ChartsProps {
  data: PortfolioTrendsData[];
}

export function SectorPerformanceChart({ data }: ChartsProps) {
  const chartData = [...data]
    .sort((a, b) => b.success_rate_pct - a.success_rate_pct)
    .map((sector) => ({
      name: sector.sector,
      success_rate: sector.success_rate_pct,
      revenue_growth: sector.avg_revenue_growth_pct,
    }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Sector Performance
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} label={{ value: 'Percentage', angle: -90, position: 'insideLeft', fill: '#fff' }} />
          <Tooltip 
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Bar dataKey="success_rate" fill="#4dd0e1" name="Success Rate %" />
          <Bar dataKey="revenue_growth" fill="#c084fc" name="Avg Revenue Growth %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FundingAnalysisChart({ data }: ChartsProps) {
  const chartData = [...data]
    .sort((a, b) => b.total_funding_usd - a.total_funding_usd)
    .map((sector) => ({
      name: sector.sector,
      funding: sector.total_funding_usd / 1000000,
      valuation: sector.avg_valuation_usd / 1000000,
    }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Funding & Valuation by Sector
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} label={{ value: 'Millions ($)', angle: -90, position: 'insideLeft', fill: '#fff' }} />
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}M`}
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Bar dataKey="funding" fill="#4dd0e1" name="Total Funding" />
          <Bar dataKey="valuation" fill="#c084fc" name="Avg Valuation" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SectorRadarChart({ data }: ChartsProps) {
  const chartData = data.map((sector) => ({
    sector: sector.sector,
    'Market Traction': sector.market_traction_score,
    'Product Readiness': sector.product_readiness_score,
    'Team Strength': sector.team_strength_score,
  }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Sector Strength Analysis
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#4a5f73" />
          <PolarAngleAxis dataKey="sector" tick={{ fill: '#fff', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#fff' }} />
          <Radar name="Market Traction" dataKey="Market Traction" stroke="#4dd0e1" fill="#4dd0e1" fillOpacity={0.3} />
          <Radar name="Product Readiness" dataKey="Product Readiness" stroke="#c084fc" fill="#c084fc" fillOpacity={0.3} />
          <Radar name="Team Strength" dataKey="Team Strength" stroke="#ffd93d" fill="#ffd93d" fillOpacity={0.3} />
          <Legend wrapperStyle={{ color: '#fff' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConversionMetricsChart({ data }: ChartsProps) {
  const chartData = [...data]
    .map((sector) => ({
      name: sector.sector,
      pilot_conversion: sector.pilot_conversion_rate_pct,
      partnership_rate: sector.partnership_rate_pct,
    }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Conversion Metrics by Sector
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} label={{ value: 'Percentage', angle: -90, position: 'insideLeft', fill: '#fff' }} />
          <Tooltip 
            formatter={(value: number) => `${value}%`}
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Bar dataKey="pilot_conversion" fill="#4dd0e1" name="Pilot Conversion %" />
          <Bar dataKey="partnership_rate" fill="#c084fc" name="Partnership Rate %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

