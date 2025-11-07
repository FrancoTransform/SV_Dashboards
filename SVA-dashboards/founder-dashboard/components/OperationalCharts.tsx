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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { OperationalHealthData } from '@/lib/cycleTypes';

interface ChartsProps {
  data: OperationalHealthData[];
}

export function BudgetUtilizationChart({ data }: ChartsProps) {
  const chartData = data.map((cycle) => ({
    name: cycle.cycle_name.replace(' Cohort', ''),
    allocated: cycle.budget_allocated_usd / 1000,
    spent: cycle.budget_spent_usd / 1000,
    utilization: cycle.budget_utilization_pct,
  }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Budget Utilization by Cycle
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} label={{ value: 'Thousands ($)', angle: -90, position: 'insideLeft', fill: '#fff' }} />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'utilization') return `${value}%`;
              return `$${value}K`;
            }}
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Bar dataKey="allocated" fill="#c084fc" name="Allocated" />
          <Bar dataKey="spent" fill="#4dd0e1" name="Spent" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EfficiencyTrendsChart({ data }: ChartsProps) {
  const chartData = data.map((cycle) => ({
    name: cycle.cycle_name.replace(' Cohort', ''),
    efficiency: cycle.operational_efficiency_score,
    session_completion: cycle.session_completion_rate_pct,
    attendance: cycle.avg_attendance_rate_pct,
  }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Efficiency Trends
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} />
          <Tooltip 
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Line type="monotone" dataKey="efficiency" stroke="#4dd0e1" strokeWidth={2} name="Efficiency Score" />
          <Line type="monotone" dataKey="session_completion" stroke="#c084fc" strokeWidth={2} name="Session Completion %" />
          <Line type="monotone" dataKey="attendance" stroke="#ffd93d" strokeWidth={2} name="Attendance %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MentorUtilizationChart({ data }: ChartsProps) {
  const chartData = data.map((cycle) => ({
    name: cycle.cycle_name.replace(' Cohort', ''),
    total_hours: cycle.total_mentor_hours,
    avg_per_company: cycle.avg_mentor_hours_per_company,
    utilization: cycle.mentor_utilization_rate_pct,
  }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        Mentor Utilization
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} />
          <Tooltip 
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Bar dataKey="total_hours" fill="#4dd0e1" name="Total Hours" />
          <Bar dataKey="utilization" fill="#c084fc" name="Utilization %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ROIComparisonChart({ data }: ChartsProps) {
  const chartData = data.map((cycle) => ({
    name: cycle.cycle_name.replace(' Cohort', ''),
    roi: cycle.roi_on_investment,
    cost_per_outcome: cycle.cost_per_outcome_usd / 1000,
  }));

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
      <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400 mb-4">
        ROI Comparison
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#fff' }} />
          <YAxis tick={{ fontSize: 12, fill: '#fff' }} />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'roi') return `${value.toFixed(1)}x`;
              return `$${value.toFixed(0)}K`;
            }}
            contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Bar dataKey="roi" fill="#4dd0e1" name="ROI Multiple" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

