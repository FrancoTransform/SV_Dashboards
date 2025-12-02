'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartaData } from '@/lib/useCartaData';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type FundKey = 'fundI' | 'fundII' | 'fundIII' | 'gofI' | 'gofII';

const fundNameToKey: { [key: string]: FundKey } = {
  'Fund I': 'fundI',
  'Fund II': 'fundII',
  'Fund III': 'fundIII',
  'GOF I': 'gofI',
  'GOF II': 'gofII',
};

const LOCATION_COLORS = ['#1082ee', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

function FundStatisticsContent() {
  const { data, analytics, loading, error, isLiveData, lastUpdated, dataNote, refetch } = useCartaData();
  const searchParams = useSearchParams();
  const selectedFund = searchParams.get('fund') || 'all';

  const getActiveTab = (): FundKey => {
    if (selectedFund === 'all') return 'fundI';
    return fundNameToKey[selectedFund] || 'fundI';
  };

  const [activeTab, setActiveTab] = useState<FundKey>(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [selectedFund]);

  // Derive companies from data and activeTab
  const companies = useMemo(() => {
    if (!data) return [];
    return data[activeTab] || [];
  }, [data, activeTab]);

  // Derive tabs from data
  const tabs = useMemo(() => {
    if (!data) return [];
    return [
      { key: 'fundI' as FundKey, label: 'Fund I', count: (data.fundI || []).length },
      { key: 'fundII' as FundKey, label: 'Fund II', count: (data.fundII || []).length },
      { key: 'fundIII' as FundKey, label: 'Fund III', count: (data.fundIII || []).length },
      { key: 'gofI' as FundKey, label: 'GOF I', count: (data.gofI || []).length },
      { key: 'gofII' as FundKey, label: 'GOF II', count: (data.gofII || []).length },
    ];
  }, [data]);

  // Calculate metrics from Carta API data
  const metrics = useMemo(() => {
    const cartaCount = companies.filter((c: any) => c.cartaCompany).length;

    // Location distribution for this fund
    const locationCounts: Record<string, number> = {};
    companies.forEach((c: any) => {
      const location = c.stateName || 'Unknown';
      if (location !== 'Unknown') {
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });
    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCompanies: companies.length,
      cartaCount,
      nonCartaCount: companies.length - cartaCount,
      topLocations,
    };
  }, [companies]);

  // Carta platform distribution data for pie chart
  const cartaDistributionData = useMemo(() => {
    return [
      { name: 'On Carta', count: metrics.cartaCount, color: '#10b981' },
      { name: 'Not on Carta', count: metrics.nonCartaCount, color: '#e0e0e0' }
    ].filter(d => d.count > 0);
  }, [metrics]);

  // Location distribution for bar chart
  const locationData = useMemo(() => {
    return metrics.topLocations;
  }, [metrics]);

  // Conditional returns AFTER all hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1082ee' }}></div>
          <p className="text-sm" style={{ color: '#757575' }}>Loading fund statistics from Carta...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <div className="text-center py-8">
          <p className="text-lg font-medium" style={{ color: '#d32f2f' }}>Failed to load fund statistics</p>
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

      {/* Fund Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: activeTab === tab.key ? '#1082ee' : '#f5f5f5',
              color: activeTab === tab.key ? '#fff' : '#757575'
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Companies */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: '#757575' }}>Portfolio Companies</h3>
          <p className="text-3xl font-bold mb-2" style={{ color: '#212121' }}>
            {metrics.totalCompanies}
          </p>
          <p className="text-sm" style={{ color: '#757575' }}>in this fund</p>
        </div>

        {/* On Carta */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: '#757575' }}>On Carta Platform</h3>
          <p className="text-3xl font-bold mb-2" style={{ color: '#10b981' }}>
            {metrics.cartaCount}
          </p>
          <p className="text-sm" style={{ color: '#757575' }}>
            {metrics.totalCompanies > 0 ? Math.round((metrics.cartaCount / metrics.totalCompanies) * 100) : 0}% of portfolio
          </p>
        </div>

        {/* Top State of Incorporation */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: '#757575' }}>Top State of Inc.</h3>
          <p className="text-3xl font-bold mb-2" style={{ color: '#212121' }}>
            {metrics.topLocations[0]?.location || 'N/A'}
          </p>
          <p className="text-sm" style={{ color: '#757575' }}>
            {metrics.topLocations[0]?.count || 0} companies
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carta Platform Distribution */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>Carta Platform Usage</h3>
          {cartaDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={cartaDistributionData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => `${entry.name}: ${entry.count}`}
                >
                  {cartaDistributionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm" style={{ color: '#757575' }}>No data available</p>
            </div>
          )}
        </div>

        {/* State of Incorporation Distribution */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>State of Incorporation</h3>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fill: '#757575', fontSize: 12 }} />
                <YAxis dataKey="location" type="category" tick={{ fill: '#757575', fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#1082ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm" style={{ color: '#757575' }}>No incorporation data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Companies Table */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>All Portfolio Companies</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#dadada' }}>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Company</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Legal Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>State of Inc.</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Website</th>
                <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>On Carta</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f0f0f0' }}>
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: '#212121' }}>{company.Company}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{company.legalName || '-'}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{company.stateName || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#1082ee' }}>
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').substring(0, 25)}
                        {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').length > 25 ? '...' : ''}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
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

export default function FundStatisticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" style={{ color: '#757575' }}>Loading...</div>}>
      <FundStatisticsContent />
    </Suspense>
  );
}
