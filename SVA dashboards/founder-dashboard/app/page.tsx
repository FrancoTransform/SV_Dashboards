'use client';

import { useState, useMemo } from 'react';
import KPITile from '@/components/KPITile';
import CompanyTable from '@/components/CompanyTable';
import {
  FundingByCompanyChart,
  RevenueGrowthBySectorChart,
  PilotsAndPartnershipsChart,
} from '@/components/Charts';
import { CompanyData } from '@/lib/types';
import {
  computeKPIs,
  computeCohortDelta,
  generateNarrative,
  formatCurrency,
  formatPercentage,
} from '@/lib/dataUtils';
import data from '@/public/mart_founder_success.json';

export default function FounderSuccessDashboard() {
  const allData = data as CompanyData[];

  const [selectedCycles, setSelectedCycles] = useState<string[]>([
    'ACC-2025-Spring',
    'ACC-2025-Fall',
  ]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);

  // Get unique values for filters
  const cycles = useMemo(() => [...new Set(allData.map((d) => d.program_cycle_uid))], []);
  const sectors = useMemo(() => [...new Set(allData.map((d) => d.sector))], []);
  const stages = useMemo(() => [...new Set(allData.map((d) => d.stage))], []);

  // Filter data
  const filteredData = useMemo(() => {
    return allData.filter((row) => {
      const cycleMatch = selectedCycles.length === 0 || selectedCycles.includes(row.program_cycle_uid);
      const sectorMatch = selectedSectors.length === 0 || selectedSectors.includes(row.sector);
      const stageMatch = selectedStages.length === 0 || selectedStages.includes(row.stage);
      return cycleMatch && sectorMatch && stageMatch;
    });
  }, [selectedCycles, selectedSectors, selectedStages]);

  // Compute KPIs
  const kpis = useMemo(() => computeKPIs(filteredData), [filteredData]);

  // Compute cohort delta and narrative
  const { delta, narrative } = useMemo(() => {
    const springData = allData.filter((d) => d.program_cycle_uid === 'ACC-2025-Spring');
    const fallData = allData.filter((d) => d.program_cycle_uid === 'ACC-2025-Fall');
    const delta = computeCohortDelta(springData, fallData);
    const narrative = generateNarrative(delta);
    return { delta, narrative };
  }, []);

  const toggleFilter = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

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
                <a href="/" className="block px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-900 transition-colors rounded-t-lg font-semibold">
                  Founder Success Dashboard
                </a>
                <a href="/partner-roi" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Partner ROI Dashboard
                </a>
                <a href="/cycle-snapshot" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Cycle Snapshot
                </a>
                <a href="/portfolio-trends" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Portfolio Trends Tracker
                </a>
                <a href="/operational-health" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Operational Health Dashboard
                </a>
                <a href="/applications" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors rounded-b-lg">
                  Applications Dashboard
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
                <span className="text-cyan-400">Founder Success Dashboard</span>
              </h1>
              <p className="text-xl text-gray-300">
                Tracking accelerator performance and portfolio company growth
              </p>
            </div>
            <a
              href="/sample-data/founder-success"
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
        {/* Filters */}
        <section className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63', borderColor: '#4a5f73' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cycle Filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                Program Cycle
              </label>
              <div className="space-y-2">
                {cycles.map((cycle) => (
                  <label key={cycle} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCycles.includes(cycle)}
                      onChange={() => toggleFilter(cycle, selectedCycles, setSelectedCycles)}
                      className="rounded border-gray-500 text-cyan-500 focus:ring-cyan-500 bg-gray-700"
                    />
                    <span className="text-sm text-white">{cycle}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sector Filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                Sector
              </label>
              <div className="space-y-2">
                {sectors.map((sector) => (
                  <label key={sector} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSectors.includes(sector)}
                      onChange={() => toggleFilter(sector, selectedSectors, setSelectedSectors)}
                      className="rounded border-gray-500 text-cyan-500 focus:ring-cyan-500 bg-gray-700"
                    />
                    <span className="text-sm text-white">{sector}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                Stage
              </label>
              <div className="space-y-2">
                {stages.map((stage) => (
                  <label key={stage} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStages.includes(stage)}
                      onChange={() => toggleFilter(stage, selectedStages, setSelectedStages)}
                      className="rounded border-gray-500 text-cyan-500 focus:ring-cyan-500 bg-gray-700"
                    />
                    <span className="text-sm text-white">{stage}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* KPI Tiles */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Key Performance Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <KPITile
            title="Avg Rev Growth"
            value={formatPercentage(kpis.avg_revenue_growth_pct)}
          />
          <KPITile
            title="Follow-on Funding"
            value={formatCurrency(kpis.follow_on_funding_usd)}
          />
          <KPITile title="Pilots" value={kpis.pilots_initiated} />
          <KPITile title="Partnerships" value={kpis.partnerships_signed} />
          <KPITile
            title="Founder NPS"
            value={kpis.founder_nps_avg.toFixed(0)}
          />
          <KPITile
            title="Attendance"
            value={formatPercentage(kpis.attendance_avg)}
          />
          <KPITile title="Mentor Hours" value={kpis.mentor_hours_sum} />
          </div>
        </section>

        {/* Narrative Panel */}
        <section className="rounded-lg shadow-lg p-6 border-l-4" style={{ background: '#3a4f63', borderColor: '#4dd0e1' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3">
            Cohort Comparison: Fall vs Spring
          </h2>
          <p className="text-gray-200 leading-relaxed">{narrative}</p>
        </section>

        {/* Charts */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Performance Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FundingByCompanyChart data={filteredData} />
            <RevenueGrowthBySectorChart data={filteredData} />
          </div>
        </section>

        <section>
          <PilotsAndPartnershipsChart data={filteredData} />
        </section>

        {/* Company Table */}
        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide text-cyan-400 mb-4">
            Company Details
          </h2>
          <CompanyTable data={filteredData} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12" style={{ borderColor: '#4a5f73', background: '#2d3e50' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-400 text-center">
            SemperVirens Accelerator · Founder Success Dashboard · 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
