'use client';

import { useState, useMemo } from 'react';
import founderData from '@/public/mart_founder_success.json';
import partnerData from '@/public/mart_partner_roi.json';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Info tooltip component
function InfoTooltip({ text }: { text: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="text-gray-400 hover:text-cyan-400 transition-colors"
        aria-label="Information"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>
      {isVisible && (
        <div
          className="absolute z-50 w-64 p-3 rounded-lg shadow-xl text-sm left-6 top-0"
          style={{ background: '#1a2332', border: '1px solid #4dd0e1' }}
        >
          <p className="text-gray-200">{text}</p>
        </div>
      )}
    </div>
  );
}

interface CompanyData {
  program_cycle_uid: string;
  company_uid: string;
  canonical_name: string;
  sector: string;
  stage: string;
  follow_on_funding_usd: number;
  partnerships_signed_count: number;
  revenue_growth_pct: number;
}

interface PartnerData {
  partner_uid: string;
  partner_name: string;
  industry: string;
  participation_type: string[];
  investments_made: number;
}

export default function InvestmentPortfolioDashboard() {
  const companies = founderData as CompanyData[];
  const partners = partnerData as PartnerData[];

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalFunding = companies.reduce((sum, c) => sum + c.follow_on_funding_usd, 0);
    const fundedCompanies = companies.filter(c => c.follow_on_funding_usd > 0);
    const avgFunding = fundedCompanies.length > 0 ? totalFunding / fundedCompanies.length : 0;
    const maxFunding = Math.max(...companies.map(c => c.follow_on_funding_usd));
    const minFunding = Math.min(...fundedCompanies.map(c => c.follow_on_funding_usd));
    
    // Assume target is 150% of current total
    const targetFunding = totalFunding * 1.5;
    const deploymentPct = (totalFunding / targetFunding) * 100;

    return {
      totalFunding,
      targetFunding,
      deploymentPct,
      totalCompanies: companies.length,
      fundedCompanies: fundedCompanies.length,
      avgFunding,
      maxFunding,
      minFunding,
      latestFunding: fundedCompanies.sort((a, b) => b.follow_on_funding_usd - a.follow_on_funding_usd)[0]
    };
  }, [companies]);

  // Sector distribution
  const sectorData = useMemo(() => {
    const sectorCounts: { [key: string]: number } = {};
    companies.forEach(c => {
      sectorCounts[c.sector] = (sectorCounts[c.sector] || 0) + 1;
    });
    return Object.entries(sectorCounts)
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count);
  }, [companies]);

  // Investments by cycle (quarter)
  const cycleData = useMemo(() => {
    const cycleCounts: { [key: string]: number } = {};
    companies.forEach(c => {
      cycleCounts[c.program_cycle_uid] = (cycleCounts[c.program_cycle_uid] || 0) + 1;
    });
    return Object.entries(cycleCounts)
      .map(([cycle, count]) => ({ cycle, count }))
      .sort((a, b) => a.cycle.localeCompare(b.cycle));
  }, [companies]);

  // Latest transactions
  const latestTransactions = useMemo(() => {
    return companies
      .filter(c => c.follow_on_funding_usd > 0)
      .sort((a, b) => b.follow_on_funding_usd - a.follow_on_funding_usd)
      .slice(0, 5);
  }, [companies]);

  // Corporate investors
  const corporateInvestors = useMemo(() => {
    return partners.filter(p => 
      p.participation_type.includes('Investor') && p.investments_made > 0
    );
  }, [partners]);

  // Current vs Previous companies
  const currentCompanies = companies.filter(c => c.program_cycle_uid.includes('2025'));
  const previousCompanies = companies.filter(c => c.program_cycle_uid.includes('2024'));

  const COLORS = ['#4dd0e1', '#81e6d9', '#63b3ed', '#7f9cf5', '#a78bfa', '#c084fc', '#f687b3', '#fc8181'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
            <a
              href="/"
              className="text-white text-sm font-medium hover:text-cyan-400 transition-colors"
            >
              ← Back to Home
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="border-b" style={{ borderColor: '#4a5f73', background: '#3a4f63' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Investment Portfolio Dashboard</h1>
          <p className="text-gray-300 text-lg">Track portfolio company funding and investment metrics</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Deployment Progress */}
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63', borderColor: '#4a5f73', border: '1px solid' }}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Follow-on Funding Deployed / Target</h3>
              <InfoTooltip text="Data Source: Follow-on funding amounts from 'GTM & Corp Dev Intros PY8.xlsx'. Target is calculated as 150% of current total deployment." />
            </div>
            <div className="space-y-3">
              <p className="text-3xl font-bold text-white">
                {formatCurrency(metrics.totalFunding)} / {formatCurrency(metrics.targetFunding)}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.deploymentPct}%`, background: '#4dd0e1' }}
                />
              </div>
              <p className="text-sm text-gray-400">{metrics.deploymentPct.toFixed(1)}% deployed</p>
            </div>
          </div>

          {/* Portfolio Companies */}
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63', borderColor: '#4a5f73', border: '1px solid' }}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Portfolio Companies</h3>
              <InfoTooltip text="Data Source: Company count from 'GTM & Corp Dev Intros PY8.xlsx'. Shows total portfolio companies and those with follow-on funding." />
            </div>
            <div className="space-y-3">
              <p className="text-3xl font-bold text-white">{metrics.totalCompanies}</p>
              <p className="text-sm text-cyan-400">{metrics.fundedCompanies} with follow-on funding</p>
            </div>
          </div>

          {/* Average Check */}
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63', borderColor: '#4a5f73', border: '1px solid' }}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Average Follow-on Check</h3>
              <InfoTooltip text="Data Source: Calculated from follow-on funding amounts in 'GTM & Corp Dev Intros PY8.xlsx'. Shows average, largest, and smallest funding amounts." />
            </div>
            <div className="space-y-3">
              <p className="text-3xl font-bold text-white">{formatCurrency(metrics.avgFunding)}</p>
              <div className="flex justify-between text-sm">
                <span className="text-cyan-400">Largest: {formatCurrency(metrics.maxFunding)}</span>
                <span className="text-cyan-400">Smallest: {formatCurrency(metrics.minFunding)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Latest Transactions */}
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63', borderColor: '#4a5f73', border: '1px solid' }}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-white">Latest Follow-on Funding</h3>
              <InfoTooltip text="Data Source: Top 5 companies by follow-on funding amount from 'GTM & Corp Dev Intros PY8.xlsx'." />
            </div>
            <div className="space-y-3">
              {latestTransactions.map((company, idx) => (
                <div key={company.company_uid} className="flex items-center justify-between p-3 rounded" style={{ background: '#2d3e50' }}>
                  <div>
                    <p className="text-white font-medium">{company.canonical_name}</p>
                    <p className="text-sm text-gray-400">{company.sector} • {company.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-semibold">{formatCurrency(company.follow_on_funding_usd)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Distribution */}
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63', borderColor: '#4a5f73', border: '1px solid' }}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-white">Portfolio by Sector</h3>
              <InfoTooltip text="Data Source: Company sectors from 'GTM & Corp Dev Intros PY8.xlsx'. Shows distribution of portfolio companies across different industry sectors." />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  dataKey="count"
                  nameKey="sector"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.sector}: ${entry.count}`}
                  labelLine={false}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Investments by Cycle */}
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63', borderColor: '#4a5f73', border: '1px solid' }}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-white">Companies by Cohort</h3>
              <InfoTooltip text="Data Source: Program cycle assignments from 'GTM & Corp Dev Intros PY8.xlsx'. Shows number of companies in each accelerator cohort." />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cycleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
                <XAxis dataKey="cycle" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#4dd0e1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Sectors */}
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63', borderColor: '#4a5f73', border: '1px solid' }}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-white">Top Sectors</h3>
              <InfoTooltip text="Data Source: Top 6 sectors by company count from 'GTM & Corp Dev Intros PY8.xlsx'." />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sectorData.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <YAxis dataKey="sector" type="category" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} width={100} />
                <Tooltip
                  contentStyle={{ background: '#2d3e50', border: '1px solid #4a5f73', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#4dd0e1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Corporate Investors */}
          <div className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63', borderColor: '#4a5f73', border: '1px solid' }}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-white">Corporate Investors</h3>
              <InfoTooltip text="Data Source: Corporate partners with 'Investor' participation type from 'GTM & Corp Dev Intros PY8.xlsx'." />
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {corporateInvestors.map((partner) => (
                <div key={partner.partner_uid} className="p-3 rounded" style={{ background: '#2d3e50' }}>
                  <p className="text-white font-medium">{partner.partner_name}</p>
                  <p className="text-sm text-gray-400">{partner.industry}</p>
                  <p className="text-xs text-cyan-400 mt-1">{partner.investments_made} investment{partner.investments_made > 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Companies */}
        <div className="rounded-lg shadow-lg p-6 mb-8" style={{ background: '#3a4f63', borderColor: '#4a5f73', border: '1px solid' }}>
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-semibold text-white">Portfolio Companies</h3>
            <InfoTooltip text="Data Source: All portfolio companies from 'GTM & Corp Dev Intros PY8.xlsx', grouped by cohort year (2024 vs 2025)." />
          </div>

          {/* Current Companies */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-cyan-400 mb-4">Current Cohorts (2025)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {currentCompanies.map((company) => (
                <div
                  key={company.company_uid}
                  className="p-4 rounded text-center transition-all duration-200 hover:scale-105"
                  style={{ background: '#2d3e50', border: '1px solid #4a5f73' }}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl" style={{ background: '#4dd0e1', color: '#2d3e50' }}>
                    {company.canonical_name.charAt(0)}
                  </div>
                  <p className="text-white font-medium text-sm">{company.canonical_name}</p>
                  <p className="text-xs text-gray-400 mt-1">{company.sector}</p>
                  {company.follow_on_funding_usd > 0 && (
                    <p className="text-xs text-cyan-400 mt-1">{formatCurrency(company.follow_on_funding_usd)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Previous Companies */}
          <div>
            <h4 className="text-md font-semibold text-cyan-400 mb-4">Previous Cohorts (2024)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {previousCompanies.map((company) => (
                <div
                  key={company.company_uid}
                  className="p-4 rounded text-center transition-all duration-200 hover:scale-105"
                  style={{ background: '#2d3e50', border: '1px solid #4a5f73' }}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl" style={{ background: '#4dd0e1', color: '#2d3e50' }}>
                    {company.canonical_name.charAt(0)}
                  </div>
                  <p className="text-white font-medium text-sm">{company.canonical_name}</p>
                  <p className="text-xs text-gray-400 mt-1">{company.sector}</p>
                  {company.follow_on_funding_usd > 0 && (
                    <p className="text-xs text-cyan-400 mt-1">{formatCurrency(company.follow_on_funding_usd)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

