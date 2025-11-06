'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CompanyData } from '@/lib/types';

interface ChartsProps {
  data: CompanyData[];
}

export function FundingByCompanyChart({ data }: ChartsProps) {
  const chartData = [...data]
    .sort((a, b) => b.follow_on_funding_usd - a.follow_on_funding_usd)
    .map((company) => ({
      name: company.canonical_name,
      funding: company.follow_on_funding_usd / 1000000, // Convert to millions
    }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Follow-on Funding by Company
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} label={{ value: 'Funding ($M)', angle: -90, position: 'insideLeft', fill: '#fff' }} />
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}M`}
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Bar dataKey="funding" fill="#4dd0e1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueGrowthBySectorChart({ data }: ChartsProps) {
  // Group by sector and calculate average revenue growth
  const sectorMap = new Map<string, { total: number; count: number }>();
  
  data.forEach((company) => {
    const existing = sectorMap.get(company.sector) || { total: 0, count: 0 };
    sectorMap.set(company.sector, {
      total: existing.total + company.revenue_growth_pct,
      count: existing.count + 1,
    });
  });

  const chartData = Array.from(sectorMap.entries()).map(([sector, stats]) => ({
    sector,
    avgGrowth: stats.total / stats.count,
  }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Avg Revenue Growth by Sector
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="sector" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} label={{ value: 'Growth (%)', angle: -90, position: 'insideLeft', fill: '#fff' }} />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)}%`}
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Bar dataKey="avgGrowth" fill="#4dd0e1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PilotsAndPartnershipsChart({ data }: ChartsProps) {
  const chartData = [...data]
    .sort((a, b) => (b.pilots_initiated + b.partnerships_signed_count) - (a.pilots_initiated + a.partnerships_signed_count))
    .map((company) => ({
      name: company.canonical_name,
      pilots: company.pilots_initiated,
      partnerships: company.partnerships_signed_count,
    }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Pilots & Partnerships by Company
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} />
          <Tooltip contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }} />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Bar dataKey="pilots" stackId="a" fill="#4dd0e1" name="Pilots" />
          <Bar dataKey="partnerships" stackId="a" fill="#c084fc" name="Partnerships" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

