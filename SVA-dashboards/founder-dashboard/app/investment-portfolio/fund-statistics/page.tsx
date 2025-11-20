'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import portfolioData from '@/public/mart_investment_portfolio.json';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type FundKey = 'fundI' | 'fundII' | 'fundIII' | 'gofI' | 'gofII';

const fundNameToKey: { [key: string]: FundKey } = {
  'Fund I': 'fundI',
  'Fund II': 'fundII',
  'Fund III': 'fundIII',
  'GOF I': 'gofI',
  'GOF II': 'gofII',
};

interface PortfolioCompany {
  Company: string;
  'Initial  Inv. Date'?: number;
  'Initial  Inv. Series'?: string;
  'Current  Inv. Series'?: string;
  '$ Invested'?: number;
  'Current Market Value'?: number;
  'MOIC'?: number;
  'Current Q3 Status'?: number;
  Rationale?: string;
  [key: string]: any; // Allow additional properties
}

interface PortfolioData {
  fundI: PortfolioCompany[];
  fundII: PortfolioCompany[];
  fundIII: PortfolioCompany[];
  gofI: PortfolioCompany[];
  gofII: PortfolioCompany[];
}

function FundStatisticsContent() {
  const searchParams = useSearchParams();
  const selectedFund = searchParams.get('fund') || 'all';
  const data = portfolioData as any;

  // Determine active tab based on URL parameter or show all funds
  const getActiveTab = (): FundKey => {
    if (selectedFund === 'all') return 'fundI'; // Default to Fund I when "All Funds" is selected
    return fundNameToKey[selectedFund] || 'fundI';
  };

  const [activeTab, setActiveTab] = useState<FundKey>(getActiveTab());

  // Update active tab when URL parameter changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [selectedFund]);

  const tabs = [
    { key: 'fundI' as FundKey, label: 'Fund I', count: data.fundI.length },
    { key: 'fundII' as FundKey, label: 'Fund II', count: data.fundII.length },
    { key: 'fundIII' as FundKey, label: 'Fund III', count: data.fundIII.length },
    { key: 'gofI' as FundKey, label: 'GOF I', count: data.gofI.length },
    { key: 'gofII' as FundKey, label: 'GOF II', count: data.gofII.length },
  ];

  const companies = data[activeTab];

  // Helper to safely parse numeric values
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

  const formatMOIC = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || numValue === 0) return '-';
    return `${numValue.toFixed(2)}x`;
  };

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalInvested = companies.reduce((sum: number, c: any) => sum + parseNumeric(c['$ Invested']), 0);
    const totalMarketValue = companies.reduce((sum: number, c: any) => sum + parseNumeric(c['Current Market Value']), 0);

    const validMOICs = companies.map((c: any) => parseNumeric(c.MOIC)).filter((m: number) => m > 0);
    const avgMOIC = validMOICs.length > 0
      ? validMOICs.reduce((sum: number, m: number) => sum + m, 0) / validMOICs.length
      : 0;

    const maxMOIC = validMOICs.length > 0 ? Math.max(...validMOICs) : 0;
    const minMOIC = validMOICs.length > 0 ? Math.min(...validMOICs) : 0;

    // Count companies by status (1 = Green, 2 = Yellow, 3 = Red)
    const greenCount = companies.filter((c: any) => c['Current Q3 Status'] === 1).length;
    const yellowCount = companies.filter((c: any) => c['Current Q3 Status'] === 2).length;
    const redCount = companies.filter((c: any) => c['Current Q3 Status'] === 3).length;

    return {
      totalInvested,
      totalMarketValue,
      totalCompanies: companies.length,
      avgMOIC,
      maxMOIC,
      minMOIC,
      greenCount,
      yellowCount,
      redCount,
      overallMOIC: totalInvested > 0 ? totalMarketValue / totalInvested : 0
    };
  }, [companies]);

  // Investment series distribution
  const seriesData = useMemo(() => {
    const seriesCounts: { [key: string]: number } = {};
    companies.forEach((c: any) => {
      const series = c['Current  Inv. Series'] || 'Unknown';
      seriesCounts[series] = (seriesCounts[series] || 0) + 1;
    });
    return Object.entries(seriesCounts)
      .map(([series, count]) => ({ series, count }))
      .sort((a, b) => b.count - a.count);
  }, [companies]);

  // Status distribution (RYG)
  const statusData = useMemo(() => {
    return [
      { status: 'Green', count: metrics.greenCount, color: '#10b981' },
      { status: 'Yellow', count: metrics.yellowCount, color: '#f59e0b' },
      { status: 'Red', count: metrics.redCount, color: '#ef4444' }
    ].filter((s: any) => s.count > 0);
  }, [metrics]);

  // Top performers by MOIC
  const topPerformers = useMemo(() => {
    return companies
      .filter((c: any) => parseNumeric(c.MOIC) > 0)
      .sort((a: any, b: any) => parseNumeric(b.MOIC) - parseNumeric(a.MOIC))
      .slice(0, 5);
  }, [companies]);

  const getStatusColor = (status: number) => {
    if (status === 1) return '#10b981'; // Green
    if (status === 2) return '#f59e0b'; // Yellow
    if (status === 3) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  const getStatusLabel = (status: number) => {
    if (status === 1) return 'Green';
    if (status === 2) return 'Yellow';
    if (status === 3) return 'Red';
    return 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Invested */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: '#757575' }}>Total Invested</h3>
          <p className="text-3xl font-bold mb-2" style={{ color: '#212121' }}>
            {formatCurrency(metrics.totalInvested)}
          </p>
          <p className="text-sm" style={{ color: '#757575' }}>{metrics.totalCompanies} companies</p>
        </div>

        {/* Current Market Value */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: '#757575' }}>Current Market Value</h3>
          <p className="text-3xl font-bold mb-2" style={{ color: '#212121' }}>
            {formatCurrency(metrics.totalMarketValue)}
          </p>
          <p className="text-sm font-semibold" style={{ color: '#1082ee' }}>
            {formatMOIC(metrics.overallMOIC)}
          </p>
        </div>

        {/* Average MOIC */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: '#757575' }}>Average MOIC</h3>
          <p className="text-3xl font-bold mb-2" style={{ color: '#212121' }}>
            {formatMOIC(metrics.avgMOIC)}
          </p>
          <div className="flex justify-between text-xs" style={{ color: '#757575' }}>
            <span>Max: {formatMOIC(metrics.maxMOIC)}</span>
            <span>Min: {formatMOIC(metrics.minMOIC)}</span>
          </div>
        </div>

        {/* Portfolio Health */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: '#757575' }}>Portfolio Health</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#757575' }}>Green</span>
              <span className="text-lg font-bold" style={{ color: '#10b981' }}>{metrics.greenCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#757575' }}>Yellow</span>
              <span className="text-lg font-bold" style={{ color: '#f59e0b' }}>{metrics.yellowCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#757575' }}>Red</span>
              <span className="text-lg font-bold" style={{ color: '#ef4444' }}>{metrics.redCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>Top Performers by MOIC</h3>
          <div className="space-y-3">
            {topPerformers.map((company: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded hover:bg-gray-50 transition-colors" style={{ border: '1px solid #f0f0f0' }}>
                <div>
                  <p className="font-medium" style={{ color: '#212121' }}>{company.Company}</p>
                  <p className="text-sm" style={{ color: '#757575' }}>Series {company['Current  Inv. Series']}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: '#10b981' }}>{formatMOIC(company.MOIC)}</p>
                  <p className="text-xs" style={{ color: '#1082ee' }}>{formatCurrency(parseNumeric(company['Current Market Value']))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Health Distribution */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>Portfolio Health Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry: any) => `${entry.status}: ${entry.count}`}
              >
                {statusData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Investment Series Distribution */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>Investment Series Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={seriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="series" tick={{ fill: '#757575', fontSize: 12 }} />
            <YAxis tick={{ fill: '#757575' }} />
            <Tooltip />
            <Bar dataKey="count" fill="#1082ee" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Portfolio Companies Table */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>All Portfolio Companies</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#dadada' }}>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Company</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Series</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Invested</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Market Value</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>MOIC</th>
                <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f0f0f0' }}>
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: '#212121' }}>{company.Company}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{company['Current  Inv. Series']}</td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: '#757575' }}>
                    {formatCurrency(parseNumeric(company['$ Invested']))}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#1082ee' }}>
                    {formatCurrency(parseNumeric(company['Current Market Value']))}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#10b981' }}>
                    {formatMOIC(company.MOIC)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(company['Current Q3 Status']) }}
                      title={getStatusLabel(company['Current Q3 Status'])}
                    />
                  </td>
                  <td className="py-3 px-4 text-sm max-w-xs truncate" style={{ color: '#757575' }} title={company.Rationale}>
                    {company.Rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
