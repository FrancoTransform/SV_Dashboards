'use client';

import { useState, useMemo } from 'react';
import allData from '@/public/mart_portfolio_trends.json';
import { PortfolioTrendsData } from '@/lib/cycleTypes';
import { getSectorPerformanceRating, getSectorRiskLevel, formatCurrency, formatDecimal } from '@/lib/cycleUtils';
import KPITile from '@/components/KPITile';
import { SectorPerformanceChart, FundingAnalysisChart, SectorRadarChart, ConversionMetricsChart } from '@/components/PortfolioCharts';

export default function PortfolioTrendsDashboard() {
  const data = allData as PortfolioTrendsData[];
  const [selectedSector, setSelectedSector] = useState<PortfolioTrendsData | null>(null);

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const totalCompanies = data.reduce((sum, s) => sum + s.total_companies, 0);
    const totalFunding = data.reduce((sum, s) => sum + s.total_funding_usd, 0);
    const avgSuccessRate = data.reduce((sum, s) => sum + s.success_rate_pct, 0) / data.length;
    const avgRevenueGrowth = data.reduce((sum, s) => sum + s.avg_revenue_growth_pct, 0) / data.length;
    
    return {
      totalCompanies,
      totalFunding,
      avgSuccessRate,
      avgRevenueGrowth,
    };
  }, [data]);

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
                <a href="/cycle-snapshot" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Cycle Snapshot
                </a>
                <a href="/portfolio-trends" className="block px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-900 transition-colors font-semibold">
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
                <span className="text-cyan-400">Portfolio Trends Tracker</span>
              </h1>
              <p className="text-xl text-gray-300">
                Analyzing sector performance and investment opportunities
              </p>
            </div>
            <a
              href="/sample-data/portfolio-trends"
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
        {/* Portfolio Overview KPIs */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Portfolio Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPITile
              title="Total Companies"
              value={aggregateMetrics.totalCompanies.toString()}
            />
            <KPITile
              title="Total Funding"
              value={formatCurrency(aggregateMetrics.totalFunding)}
            />
            <KPITile
              title="Avg Success Rate"
              value={`${formatDecimal(aggregateMetrics.avgSuccessRate, 0)}%`}
            />
            <KPITile
              title="Avg Revenue Growth"
              value={`${formatDecimal(aggregateMetrics.avgRevenueGrowth, 1)}%`}
            />
          </div>
        </section>

        {/* Charts */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Performance Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SectorPerformanceChart data={data} />
            <FundingAnalysisChart data={data} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConversionMetricsChart data={data} />
            <SectorRadarChart data={data} />
          </div>
        </section>

        {/* Sector Cards */}
        <section>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Sector Deep Dive</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((sector) => {
              const performanceRating = getSectorPerformanceRating(sector);
              const riskLevel = getSectorRiskLevel(sector);
              
              return (
                <div
                  key={sector.sector}
                  className="rounded-lg shadow-lg p-6 cursor-pointer transition-all border-2"
                  style={{
                    background: '#3a4f63',
                    borderColor: selectedSector?.sector === sector.sector ? '#4dd0e1' : '#4a5f73',
                  }}
                  onClick={() => setSelectedSector(selectedSector?.sector === sector.sector ? null : sector)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{sector.sector}</h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: riskLevel.color, color: '#ffffff' }}
                    >
                      {riskLevel.level} Risk
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Companies</span>
                      <span className="text-sm font-semibold text-white">{sector.total_companies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Total Funding</span>
                      <span className="text-sm font-semibold text-cyan-400">{formatCurrency(sector.total_funding_usd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Success Rate</span>
                      <span className="text-sm font-semibold text-white">{sector.success_rate_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Performance</span>
                      <span className="text-sm font-semibold text-cyan-400">{performanceRating}</span>
                    </div>
                  </div>

                  {selectedSector?.sector === sector.sector && (
                    <div className="pt-4 border-t space-y-3" style={{ borderColor: '#4a5f73' }}>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Investment Thesis</p>
                        <p className="text-sm text-gray-200">{sector.investment_thesis}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Risk Factors</p>
                        <ul className="text-sm text-gray-200 list-disc list-inside">
                          {sector.risk_factors.map((risk, idx) => (
                            <li key={idx}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Top Performers</p>
                        <div className="flex flex-wrap gap-2">
                          {sector.top_performers.map((company) => (
                            <span 
                              key={company}
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{ background: '#2d3e50', color: '#4dd0e1' }}
                            >
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div>
                          <p className="text-xs text-gray-400">Market</p>
                          <p className="text-sm font-bold text-white">{formatDecimal(sector.market_traction_score, 1)}/10</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Product</p>
                          <p className="text-sm font-bold text-white">{formatDecimal(sector.product_readiness_score, 1)}/10</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Team</p>
                          <p className="text-sm font-bold text-white">{formatDecimal(sector.team_strength_score, 1)}/10</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12" style={{ borderColor: '#4a5f73', background: '#2d3e50' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-400 text-center">
            SemperVirens Accelerator · Portfolio Trends Tracker · 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

