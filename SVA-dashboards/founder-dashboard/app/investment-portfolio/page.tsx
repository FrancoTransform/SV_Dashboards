'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartaData } from '@/lib/useCartaData';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type FundKey = 'fundI' | 'fundII' | 'fundIII' | 'gofI' | 'gofII';

// Helper functions (outside component to avoid recreating on each render)
const parseNumeric = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const formatCurrency = (value: number) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(0)}`;
};

const excelDateToJS = (excelDate: number) => {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date;
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Colors for charts
const LOCATION_COLORS = ['#1082ee', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

function DashboardContent() {
  const { data, analytics, loading, error, isLiveData, lastUpdated, dataNote, refetch } = useCartaData();
  const searchParams = useSearchParams();
  const selectedFund = searchParams.get('fund') || 'all';

  // ALL useMemo hooks must be called before any conditional returns
  const allCompanies = useMemo(() => {
    if (!data) return [];
    return [
      ...(data.fundI || []).map((c: any) => ({ ...c, fund: 'Fund I' })),
      ...(data.fundII || []).map((c: any) => ({ ...c, fund: 'Fund II' })),
      ...(data.fundIII || []).map((c: any) => ({ ...c, fund: 'Fund III' })),
      ...(data.gofI || []).map((c: any) => ({ ...c, fund: 'GOF I' })),
      ...(data.gofII || []).map((c: any) => ({ ...c, fund: 'GOF II' })),
    ];
  }, [data]);

  const filteredCompanies = useMemo(() => {
    if (selectedFund === 'all') return allCompanies;
    return allCompanies.filter((c: any) => c.fund === selectedFund);
  }, [allCompanies, selectedFund]);

  // Filter locations based on selected fund
  const filteredLocations = useMemo(() => {
    if (selectedFund === 'all' && analytics?.topLocations) {
      return analytics.topLocations;
    }
    // Recalculate locations for filtered companies
    const locationCounts: Record<string, number> = {};
    filteredCompanies.forEach((c: any) => {
      const location = c.stateName || 'Unknown';
      if (location !== 'Unknown') {
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });
    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
  }, [selectedFund, analytics, filteredCompanies]);

  // Calculate metrics from Carta API data
  const metrics = useMemo(() => {
    // Count companies by fund for the distribution
    const fundDistribution = {
      'Fund I': filteredCompanies.filter((c: any) => c.fund === 'Fund I').length,
      'Fund II': filteredCompanies.filter((c: any) => c.fund === 'Fund II').length,
      'Fund III': filteredCompanies.filter((c: any) => c.fund === 'Fund III').length,
      'GOF I': filteredCompanies.filter((c: any) => c.fund === 'GOF I').length,
      'GOF II': filteredCompanies.filter((c: any) => c.fund === 'GOF II').length,
    };

    // Count companies using Carta platform
    const cartaCompaniesCount = filteredCompanies.filter((c: any) => c.cartaCompany).length;

    return {
      totalInvestments: filteredCompanies.length,
      cartaCompaniesCount,
      nonCartaCompaniesCount: filteredCompanies.length - cartaCompaniesCount,
      fundDistribution,
    };
  }, [filteredCompanies]);

  // Get fund distribution data for chart
  const fundDistributionData = useMemo(() => {
    if (selectedFund !== 'all') return [];
    return [
      { name: 'Fund I', count: data?.fundI?.length || 0 },
      { name: 'Fund II', count: data?.fundII?.length || 0 },
      { name: 'Fund III', count: data?.fundIII?.length || 0 },
      { name: 'GOF I', count: data?.gofI?.length || 0 },
      { name: 'GOF II', count: data?.gofII?.length || 0 },
    ].filter(f => f.count > 0);
  }, [data, selectedFund]);

  // Conditional returns AFTER all hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1082ee' }}></div>
          <p className="text-sm" style={{ color: '#757575' }}>Loading portfolio data from Carta...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <div className="text-center py-8">
          <p className="text-lg font-medium" style={{ color: '#d32f2f' }}>Failed to load portfolio data</p>
          <p className="text-sm mt-2" style={{ color: '#757575' }}>{error || 'Unknown error'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: '#1082ee', color: '#fff' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Source Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: isLiveData ? '#e8f5e9' : '#fff3e0',
              color: isLiveData ? '#2e7d32' : '#e65100'
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: isLiveData ? '#4caf50' : '#ff9800' }}
            />
            {isLiveData ? 'Live from Carta API' : 'Using cached data'}
          </span>
          {lastUpdated && (
            <span className="text-xs" style={{ color: '#9e9e9e' }}>
              Updated: {new Date(lastUpdated).toLocaleString()}
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs px-3 py-1 rounded-lg hover:opacity-80 transition-opacity"
          style={{ background: '#f5f5f5', color: '#757575' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Portfolio Companies */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#212121' }}>Portfolio Companies</h3>
            <span className="text-xs px-2 py-1 rounded" style={{ background: '#f2f5fd', color: '#1082ee' }}>
              {selectedFund === 'all' ? 'All Funds' : selectedFund}
            </span>
          </div>
          <div className="space-y-3">
            <p className="text-3xl font-bold" style={{ color: '#212121' }}>
              {metrics.totalInvestments}
            </p>
            <p className="text-sm" style={{ color: '#757575' }}>
              Active investments
            </p>
          </div>
        </div>

        {/* Carta Platform Usage */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#212121' }}>Carta Platform</h3>
            <span className="text-xs px-2 py-1 rounded" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
              {metrics.totalInvestments > 0 ? Math.round((metrics.cartaCompaniesCount / metrics.totalInvestments) * 100) : 0}% on Carta
            </span>
          </div>
          <div className="space-y-3">
            <p className="text-3xl font-bold" style={{ color: '#212121' }}>
              {metrics.cartaCompaniesCount}
            </p>
            <p className="text-sm" style={{ color: '#757575' }}>
              Companies using Carta
            </p>
            <div className="w-full h-2 rounded-full" style={{ background: '#e0e0e0' }}>
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  background: '#10b981',
                  width: `${metrics.totalInvestments > 0 ? (metrics.cartaCompaniesCount / metrics.totalInvestments) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Top State of Incorporation */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#212121' }}>Top State of Incorporation</h3>
          </div>
          <div className="space-y-3">
            <p className="text-3xl font-bold" style={{ color: '#212121' }}>
              {filteredLocations[0]?.location || 'N/A'}
            </p>
            <p className="text-sm" style={{ color: '#757575' }}>
              {filteredLocations[0]?.count || 0} companies incorporated
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Companies Table */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#212121' }}>Portfolio Companies</h3>
          <a href="/investment-portfolio/transactions" className="text-sm" style={{ color: '#1082ee' }}>
            See all companies →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#dadada' }}>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Company</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Fund</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>State of Inc.</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Website</th>
                <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>On Carta</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.slice(0, 10).map((company: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f0f0f0' }}>
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: '#212121' }}>{company.Company}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{company.fund}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{company.stateName || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#1082ee' }}>
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </a>
                    ) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        background: company.cartaCompany ? '#e8f5e9' : '#f5f5f5',
                        color: company.cartaCompany ? '#2e7d32' : '#757575'
                      }}
                    >
                      {company.cartaCompany ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund Distribution */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>Investments by Fund</h3>
        {fundDistributionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fundDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: '#757575', fontSize: 12 }} />
              <YAxis tick={{ fill: '#757575', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #dadada', borderRadius: '8px' }}
                labelStyle={{ color: '#212121', fontWeight: 600 }}
              />
              <Bar dataKey="count" fill="#1082ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm" style={{ color: '#757575' }}>Select "All Funds" to view distribution</p>
          </div>
        )}
      </div>

      {/* State of Incorporation Distribution */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>State of Incorporation</h3>
        <p className="text-xs mb-4" style={{ color: '#9e9e9e' }}>Legal incorporation state from Carta API (not company headquarters)</p>
        {filteredLocations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filteredLocations.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fill: '#757575', fontSize: 12 }} />
                <YAxis dataKey="location" type="category" tick={{ fill: '#757575', fontSize: 12 }} width={100} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #dadada', borderRadius: '8px' }}
                  labelStyle={{ color: '#212121', fontWeight: 600 }}
                />
                <Bar dataKey="count" fill="#1082ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {/* Location List */}
            <div className="space-y-3">
              {filteredLocations.slice(0, 8).map((loc, idx) => (
                <div key={loc.location} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: LOCATION_COLORS[idx % LOCATION_COLORS.length] }}
                    />
                    <span className="text-sm font-medium" style={{ color: '#212121' }}>{loc.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#212121' }}>{loc.count}</span>
                    <span className="text-xs" style={{ color: '#757575' }}>
                      ({metrics.totalInvestments > 0 ? Math.round((loc.count / metrics.totalInvestments) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48" style={{ background: '#f9f9f9', borderRadius: '8px' }}>
            <p className="text-sm" style={{ color: '#757575' }}>No incorporation data available</p>
          </div>
        )}
      </div>

      {/* All Portfolio Companies Grid */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>
          All Portfolio Companies ({filteredCompanies.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCompanies.slice(0, 20).map((company: any, idx: number) => (
            <a
              key={idx}
              href={company.website || '#'}
              target={company.website ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="p-4 rounded-lg border flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow"
              style={{ borderColor: '#dadada', background: '#f9f9f9' }}
            >
              <p className="text-sm font-medium" style={{ color: '#212121' }}>{company.Company}</p>
              <p className="text-xs mt-1" style={{ color: '#9e9e9e' }}>{company.fund}</p>
            </a>
          ))}
        </div>
        {filteredCompanies.length > 20 && (
          <p className="text-xs mt-4 text-center" style={{ color: '#757575' }}>
            +{filteredCompanies.length - 20} more companies - <a href="/investment-portfolio/transactions" style={{ color: '#1082ee' }}>View all</a>
          </p>
        )}
      </div>

      {/* Data Note */}
      {dataNote && (
        <div className="rounded-lg p-4" style={{ background: '#fff3e0', border: '1px solid #ffcc80' }}>
          <p className="text-xs" style={{ color: '#e65100' }}>
            <strong>Note:</strong> {dataNote}
          </p>
        </div>
      )}
    </div>
  );
}

export default function InvestmentPortfolioDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center" style={{ color: '#757575' }}>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
