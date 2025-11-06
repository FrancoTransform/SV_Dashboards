'use client';

import { useState, useMemo } from 'react';
import allData from '@/public/mart_partner_roi.json';
import { PartnerData } from '@/lib/partnerTypes';
import { computePartnerKPIs, generatePartnerNarrative, formatCurrency, formatDecimal } from '@/lib/partnerUtils';
import KPITile from '@/components/KPITile';
import PartnerTable from '@/components/PartnerTable';
import { PartnerROICharts, InnovationMetricsChart, EngagementTimelineChart } from '@/components/PartnerCharts';

export default function PartnerROIDashboard() {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const data = allData as PartnerData[];

  // Extract unique values for filters
  const industries = useMemo(() => Array.from(new Set(data.map(d => d.industry))), []);
  const tiers = useMemo(() => Array.from(new Set(data.map(d => d.partnership_tier))), []);
  const sizes = useMemo(() => Array.from(new Set(data.map(d => d.company_size))), []);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const industryMatch = selectedIndustries.length === 0 || selectedIndustries.includes(row.industry);
      const tierMatch = selectedTiers.length === 0 || selectedTiers.includes(row.partnership_tier);
      const sizeMatch = selectedSizes.length === 0 || selectedSizes.includes(row.company_size);
      return industryMatch && tierMatch && sizeMatch;
    });
  }, [selectedIndustries, selectedTiers, selectedSizes]);

  const kpis = useMemo(() => computePartnerKPIs(filteredData), [filteredData]);
  const narrative = useMemo(() => generatePartnerNarrative(filteredData), [filteredData]);

  const toggleFilter = (value: string, selected: string[], setter: (val: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter(v => v !== value));
    } else {
      setter([...selected, value]);
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
                <a href="/" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors rounded-t-lg">
                  Founder Success Dashboard
                </a>
                <a href="/partner-roi" className="block px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-900 transition-colors font-semibold">
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
                <span className="text-cyan-400">Partner ROI Dashboard</span>
              </h1>
              <p className="text-xl text-gray-300">
                Measuring commercial value and innovation impact for corporate partners
              </p>
            </div>
            <a
              href="/sample-data/partner-roi"
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
            {/* Industry Filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                Industry
              </label>
              <div className="space-y-2">
                {industries.map((industry) => (
                  <label key={industry} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIndustries.includes(industry)}
                      onChange={() => toggleFilter(industry, selectedIndustries, setSelectedIndustries)}
                      className="rounded border-gray-500 text-cyan-500 focus:ring-cyan-500 bg-gray-700"
                    />
                    <span className="text-sm text-white">{industry}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tier Filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                Partnership Tier
              </label>
              <div className="space-y-2">
                {tiers.map((tier) => (
                  <label key={tier} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTiers.includes(tier)}
                      onChange={() => toggleFilter(tier, selectedTiers, setSelectedTiers)}
                      className="rounded border-gray-500 text-cyan-500 focus:ring-cyan-500 bg-gray-700"
                    />
                    <span className="text-sm text-white">{tier}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                Company Size
              </label>
              <div className="space-y-2">
                {sizes.map((size) => (
                  <label key={size} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
                      className="rounded border-gray-500 text-cyan-500 focus:ring-cyan-500 bg-gray-700"
                    />
                    <span className="text-sm text-white">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* KPI Tiles */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPITile
              title="Total Commercial Value"
              value={formatCurrency(kpis.total_commercial_value)}
            />
            <KPITile
              title="Avg ROI Multiple"
              value={`${formatDecimal(kpis.avg_roi_multiple, 2)}x`}
            />
            <KPITile
              title="Active Pilots"
              value={kpis.total_active_pilots.toString()}
            />
            <KPITile
              title="Completed Pilots"
              value={kpis.total_completed_pilots.toString()}
            />
            <KPITile
              title="Avg Cost Savings"
              value={formatCurrency(kpis.avg_cost_savings)}
            />
            <KPITile
              title="Innovation Score"
              value={formatDecimal(kpis.avg_innovation_score, 1)}
              subtitle="out of 10"
            />
            <KPITile
              title="Partner Satisfaction"
              value={formatDecimal(kpis.avg_satisfaction_score, 0)}
              subtitle="out of 100"
            />
            <KPITile
              title="Time to Pilot"
              value={formatDecimal(kpis.avg_time_to_pilot, 0)}
              subtitle="days"
            />
          </div>
        </section>

        {/* Narrative Panel */}
        <section className="rounded-lg shadow-lg p-6 border-l-4" style={{ background: '#3a4f63', borderColor: '#4dd0e1' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3">
            Partner Value Summary
          </h2>
          <p className="text-gray-200 leading-relaxed">{narrative}</p>
        </section>

        {/* Charts */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Value Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PartnerROICharts data={filteredData} />
            <InnovationMetricsChart data={filteredData} />
          </div>
        </section>

        <section>
          <EngagementTimelineChart data={filteredData} />
        </section>

        {/* Partner Table */}
        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide text-cyan-400 mb-4">
            Partner Details
          </h2>
          <PartnerTable data={filteredData} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12" style={{ borderColor: '#4a5f73', background: '#2d3e50' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-400 text-center">
            SemperVirens Accelerator · Partner ROI Dashboard · 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

