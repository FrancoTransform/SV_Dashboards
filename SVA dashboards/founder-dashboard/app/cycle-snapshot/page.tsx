'use client';

import { useState } from 'react';
import allData from '@/public/mart_cycle_snapshot.json';
import { CycleSnapshotData } from '@/lib/cycleTypes';
import { formatCycleDate, getCycleStatus, formatCurrency, formatNumber, formatPercentage } from '@/lib/cycleUtils';
import KPITile from '@/components/KPITile';

export default function CycleSnapshotDashboard() {
  const data = allData as CycleSnapshotData[];
  const [selectedCycle, setSelectedCycle] = useState<CycleSnapshotData>(data[0]);

  const status = getCycleStatus(selectedCycle);

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
            <div className="relative group">
              <button className="text-white text-sm font-medium hover:text-cyan-400 transition-colors flex items-center space-x-1">
                <span>Dashboards</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" style={{ background: '#3a4f63', border: '1px solid #4a5f73' }}>
                <a href="/" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors rounded-t-lg">
                  Founder Success Dashboard
                </a>
                <a href="/partner-roi" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Partner ROI Dashboard
                </a>
                <a href="/cycle-snapshot" className="block px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-900 transition-colors font-semibold">
                  Cycle Snapshot
                </a>
                <a href="/portfolio-trends" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Portfolio Trends Tracker
                </a>
                <a href="/operational-health" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors rounded-b-lg">
                  Operational Health Dashboard
                </a>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12" style={{ background: '#3a4f63' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-400 text-sm font-medium mb-2">SemperVirens Venture Capital</p>
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="text-cyan-400">Cycle Snapshot</span>
              </h1>
              <p className="text-xl text-gray-300">
                Key stats and highlights for each cohort
              </p>
            </div>
            <a
              href="/sample-data/cycle-snapshot"
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: '#4dd0e1', color: '#2d3e50' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#26c6da'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#4dd0e1'}
            >
              View Data
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Cycle Selector */}
        <section className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
            Select Cohort
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((cycle) => (
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
                <p className="text-sm text-gray-400">{formatCycleDate(cycle.start_date)} - {formatCycleDate(cycle.end_date)}</p>
                <div className="mt-2">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: getCycleStatus(cycle).color, color: '#ffffff' }}
                  >
                    {getCycleStatus(cycle).label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Cycle Overview */}
        <section className="rounded-lg shadow-lg p-6 border-l-4" style={{ background: '#3a4f63', borderColor: status.color }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{selectedCycle.cycle_name}</h2>
            <span
              className="px-4 py-2 rounded-lg text-sm font-bold"
              style={{ background: status.color, color: '#ffffff' }}
            >
              {status.label}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Duration</p>
              <p className="text-white font-semibold">{formatCycleDate(selectedCycle.start_date)} - {formatCycleDate(selectedCycle.end_date)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Companies</p>
              <p className="text-white font-semibold">{selectedCycle.total_companies}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Founders</p>
              <p className="text-white font-semibold">{selectedCycle.total_founders}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Sectors</p>
              <p className="text-white font-semibold">{selectedCycle.sectors_represented.length}</p>
            </div>
          </div>
        </section>

        {/* KPI Tiles */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPITile
              title="Avg Revenue Growth"
              value={formatPercentage(selectedCycle.avg_revenue_growth_pct)}
            />
            <KPITile
              title="Total Funding Raised"
              value={formatCurrency(selectedCycle.total_funding_raised_usd)}
            />
            <KPITile
              title="Pilots Initiated"
              value={selectedCycle.total_pilots.toString()}
            />
            <KPITile
              title="Partnerships Signed"
              value={selectedCycle.total_partnerships.toString()}
            />
            <KPITile
              title="Founder NPS"
              value={selectedCycle.avg_founder_nps.toString()}
              subtitle="out of 100"
            />
            <KPITile
              title="Job Creation"
              value={selectedCycle.job_creation.toString()}
              subtitle="new jobs"
            />
            <KPITile
              title="Media Mentions"
              value={selectedCycle.media_mentions.toString()}
            />
            <KPITile
              title="Investor Connections"
              value={selectedCycle.investor_connections.toString()}
            />
          </div>
        </section>

        {/* Top Achievements */}
        <section className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Top Achievements</h2>
          <ul className="space-y-3">
            {selectedCycle.top_achievements.map((achievement, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#4dd0e1', color: '#2d3e50' }}>
                  {index + 1}
                </span>
                <p className="text-gray-200">{achievement}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Sectors Represented */}
        <section className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Sectors Represented</h2>
          <div className="flex flex-wrap gap-3">
            {selectedCycle.sectors_represented.map((sector) => (
              <span 
                key={sector}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: '#2d3e50', color: '#4dd0e1', border: '1px solid #4a5f73' }}
              >
                {sector}
              </span>
            ))}
          </div>
        </section>

        {/* Additional Stats */}
        {selectedCycle.graduation_rate_pct !== null && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
              <p className="text-sm text-gray-400 mb-2">Graduation Rate</p>
              <p className="text-3xl font-bold text-cyan-400">{formatPercentage(selectedCycle.graduation_rate_pct)}</p>
            </div>
            {selectedCycle.demo_day_attendance !== null && (
              <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
                <p className="text-sm text-gray-400 mb-2">Demo Day Attendance</p>
                <p className="text-3xl font-bold text-cyan-400">{formatNumber(selectedCycle.demo_day_attendance)}</p>
              </div>
            )}
            <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
              <p className="text-sm text-gray-400 mb-2">Mentor Hours</p>
              <p className="text-3xl font-bold text-cyan-400">{selectedCycle.mentor_hours_total}</p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12" style={{ borderColor: '#4a5f73', background: '#2d3e50' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-400 text-center">
            SemperVirens Accelerator · Cycle Snapshot · 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

