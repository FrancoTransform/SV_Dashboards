'use client';

import { useState, useMemo } from 'react';
import allData from '@/public/mart_operational_health.json';
import { OperationalHealthData } from '@/lib/cycleTypes';
import { getEfficiencyRating, getBudgetStatus, formatCurrency, formatDecimal, formatPercentage } from '@/lib/cycleUtils';
import KPITile from '@/components/KPITile';
import { BudgetUtilizationChart, EfficiencyTrendsChart, MentorUtilizationChart, ROIComparisonChart } from '@/components/OperationalCharts';

export default function OperationalHealthDashboard() {
  const data = allData as OperationalHealthData[];
  const [selectedCycle, setSelectedCycle] = useState<OperationalHealthData>(data[0]);

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const avgEfficiency = data.reduce((sum, c) => sum + c.operational_efficiency_score, 0) / data.length;
    const avgBudgetUtil = data.reduce((sum, c) => sum + c.budget_utilization_pct, 0) / data.length;
    const avgROI = data.reduce((sum, c) => sum + c.roi_on_investment, 0) / data.length;
    const totalMentorHours = data.reduce((sum, c) => sum + c.total_mentor_hours, 0);
    
    return {
      avgEfficiency,
      avgBudgetUtil,
      avgROI,
      totalMentorHours,
    };
  }, [data]);

  const efficiencyRating = getEfficiencyRating(selectedCycle.operational_efficiency_score);
  const budgetStatus = getBudgetStatus(selectedCycle.budget_utilization_pct);

  return (
    <div className="min-h-screen" style={{ background: '#2d3e50' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#4a5f73' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/SemperVirens-white-logo.avif" 
              alt="SemperVirens" 
              className="h-8"
            />
          </div>
          <nav className="flex items-center space-x-6">
            <a
              href="/"
              className="text-white text-sm font-medium hover:text-cyan-400 transition-colors"
            >
              ← Back to Home
            </a>
            <a
              href="/sample-data/operational-health"
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: '#4dd0e1', color: '#2d3e50' }}
            >
              View Data
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12" style={{ background: '#3a4f63' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div>
            <p className="text-cyan-400 text-sm font-medium mb-2">SemperVirens Venture Capital</p>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-cyan-400">Operational Health Dashboard</span>
            </h1>
            <p className="text-xl text-gray-300">
              Monitoring efficiency and resource utilization across cycles
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Aggregate KPIs */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Overall Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPITile
              title="Avg Efficiency Score"
              value={formatDecimal(aggregateMetrics.avgEfficiency, 1)}
              subtitle="out of 10"
            />
            <KPITile
              title="Avg Budget Utilization"
              value={formatPercentage(aggregateMetrics.avgBudgetUtil)}
            />
            <KPITile
              title="Avg ROI"
              value={`${formatDecimal(aggregateMetrics.avgROI, 1)}x`}
            />
            <KPITile
              title="Total Mentor Hours"
              value={aggregateMetrics.totalMentorHours.toString()}
            />
          </div>
        </section>

        {/* Cycle Selector */}
        <section className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
            Select Cycle for Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((cycle) => {
              const rating = getEfficiencyRating(cycle.operational_efficiency_score);
              return (
                <button
                  key={cycle.program_cycle_uid}
                  onClick={() => setSelectedCycle(cycle)}
                  className="p-4 rounded-lg border-2 transition-all text-left"
                  style={{
                    background: selectedCycle.program_cycle_uid === cycle.program_cycle_uid ? '#2d3e50' : 'transparent',
                    borderColor: selectedCycle.program_cycle_uid === cycle.program_cycle_uid ? '#4dd0e1' : '#4a5f73',
                  }}
                >
                  <h3 className="text-lg font-bold text-white mb-1">{cycle.cycle_name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-400">Efficiency</span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: rating.color, color: '#ffffff' }}
                    >
                      {rating.rating}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Cycle Details */}
        <section className="rounded-lg shadow-lg p-6 border-l-4" style={{ background: '#3a4f63', borderColor: efficiencyRating.color }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{selectedCycle.cycle_name}</h2>
            <div className="flex items-center space-x-3">
              <span
                className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: efficiencyRating.color, color: '#ffffff' }}
              >
                {efficiencyRating.rating}
              </span>
              <span
                className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: budgetStatus.color, color: '#ffffff' }}
              >
                {budgetStatus.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Efficiency Score</p>
              <p className="text-2xl font-bold text-cyan-400">{formatDecimal(selectedCycle.operational_efficiency_score, 1)}/10</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Budget Utilization</p>
              <p className="text-2xl font-bold text-cyan-400">{formatPercentage(selectedCycle.budget_utilization_pct)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">ROI</p>
              <p className="text-2xl font-bold text-cyan-400">{formatDecimal(selectedCycle.roi_on_investment, 1)}x</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Cost per Company</p>
              <p className="text-2xl font-bold text-cyan-400">{formatCurrency(selectedCycle.cost_per_company_usd)}</p>
            </div>
          </div>
        </section>

        {/* Detailed Metrics */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Detailed Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Budget Metrics */}
            <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">Budget</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Allocated</span>
                  <span className="text-sm font-semibold text-white">{formatCurrency(selectedCycle.budget_allocated_usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Spent</span>
                  <span className="text-sm font-semibold text-white">{formatCurrency(selectedCycle.budget_spent_usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Remaining</span>
                  <span className="text-sm font-semibold text-cyan-400">
                    {formatCurrency(selectedCycle.budget_allocated_usd - selectedCycle.budget_spent_usd)}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Metrics */}
            <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">Sessions</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Planned</span>
                  <span className="text-sm font-semibold text-white">{selectedCycle.total_sessions_planned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Completed</span>
                  <span className="text-sm font-semibold text-white">{selectedCycle.total_sessions_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Completion Rate</span>
                  <span className="text-sm font-semibold text-cyan-400">{formatPercentage(selectedCycle.session_completion_rate_pct)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Avg Attendance</span>
                  <span className="text-sm font-semibold text-cyan-400">{formatPercentage(selectedCycle.avg_attendance_rate_pct)}</span>
                </div>
              </div>
            </div>

            {/* Mentor Metrics */}
            <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">Mentorship</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Hours</span>
                  <span className="text-sm font-semibold text-white">{selectedCycle.total_mentor_hours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Avg per Company</span>
                  <span className="text-sm font-semibold text-white">{formatDecimal(selectedCycle.avg_mentor_hours_per_company, 1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Utilization Rate</span>
                  <span className="text-sm font-semibold text-cyan-400">{formatPercentage(selectedCycle.mentor_utilization_rate_pct)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Trend Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <BudgetUtilizationChart data={data} />
            <EfficiencyTrendsChart data={data} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MentorUtilizationChart data={data} />
            <ROIComparisonChart data={data} />
          </div>
        </section>

        {/* Recruitment Metrics */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Recruitment & Sourcing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">Application Volume</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Applications</span>
                  <span className="text-sm font-semibold text-white">{selectedCycle.application_volume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Accepted</span>
                  <span className="text-sm font-semibold text-white">{selectedCycle.applications_accepted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Acceptance Rate</span>
                  <span className="text-sm font-semibold text-cyan-400">{formatPercentage(selectedCycle.acceptance_rate_pct)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
              <p className="text-sm text-gray-400 mb-2">Source Quality Score</p>
              <p className="text-3xl font-bold text-cyan-400">{formatDecimal(selectedCycle.source_quality_score, 1)}/10</p>
            </div>

            <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">Brand Reach</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Media Mentions</span>
                  <span className="text-sm font-semibold text-white">{selectedCycle.media_mentions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Co-Marketing</span>
                  <span className="text-sm font-semibold text-white">{selectedCycle.co_marketing_outputs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Press Releases</span>
                  <span className="text-sm font-semibold text-white">{selectedCycle.press_releases}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">Follow-on Readiness</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Commercial</span>
                  <span className="text-sm font-semibold text-white">{formatDecimal(selectedCycle.commercial_validation_score, 1)}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Capital Efficiency</span>
                  <span className="text-sm font-semibold text-white">{formatDecimal(selectedCycle.capital_efficiency_score, 1)}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Market Position</span>
                  <span className="text-sm font-semibold text-white">{formatDecimal(selectedCycle.market_positioning_score, 1)}/10</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
            <p className="text-sm text-gray-400 mb-2">Platform Uptime</p>
            <p className="text-3xl font-bold text-cyan-400">{formatPercentage(selectedCycle.platform_uptime_pct)}</p>
          </div>
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
            <p className="text-sm text-gray-400 mb-2">Support Resolution Time</p>
            <p className="text-3xl font-bold text-cyan-400">{formatDecimal(selectedCycle.support_ticket_resolution_time_hours, 1)}h</p>
          </div>
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
            <p className="text-sm text-gray-400 mb-2">Curriculum Completion</p>
            <p className="text-3xl font-bold text-cyan-400">{formatPercentage(selectedCycle.curriculum_completion_rate_pct)}</p>
          </div>
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
            <p className="text-sm text-gray-400 mb-2">Milestone Achievement</p>
            <p className="text-3xl font-bold text-cyan-400">{formatPercentage(selectedCycle.milestone_achievement_rate_pct)}</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12" style={{ borderColor: '#4a5f73', background: '#2d3e50' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-400 text-center">
            SemperVirens Accelerator · Operational Health Dashboard · 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

