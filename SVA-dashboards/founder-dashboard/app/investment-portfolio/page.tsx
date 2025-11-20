'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import portfolioData from '@/public/mart_investment_portfolio.json';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type FundKey = 'fundI' | 'fundII' | 'fundIII' | 'gofI' | 'gofII';

interface PortfolioCompany {
  Company: string;
  'Initial  Inv. Date': number;
  'Initial  Inv. Series': string;
  'Current  Inv. Series': string;
  'Last Valuation': number;
  'SV Holding Value': number;
  'FD%': number;
  '$ Invested': number;
  'Current Market Value': number;
  'Portfolio  Value': number;
  'MOIC': number;
  '2025E Rev': number | string;
  '2024A Rev': number | string;
  '2025E ARR': number | string;
  '2024 ARR': number | string;
  'Rev/ARR Growth YoY': number | string;
  'Rev Multiple': number | string;
  'Q2 Status': number;
  'Current Q3 Status': number;
  Rationale: string;
  'Fundraising/Current Runway': string;
  'Other key highlights': string;
}

interface PortfolioData {
  fundI: PortfolioCompany[];
  fundII: PortfolioCompany[];
  fundIII: PortfolioCompany[];
  gofI: PortfolioCompany[];
  gofII: PortfolioCompany[];
}

function DashboardContent() {
  const data = portfolioData as any;
  const searchParams = useSearchParams();
  const selectedFund = searchParams.get('fund') || 'all';

  // Combine all companies from all funds
  const allCompanies = useMemo(() => {
    return [
      ...data.fundI.map((c: any) => ({ ...c, fund: 'Fund I' })),
      ...data.fundII.map((c: any) => ({ ...c, fund: 'Fund II' })),
      ...data.fundIII.map((c: any) => ({ ...c, fund: 'Fund III' })),
      ...data.gofI.map((c: any) => ({ ...c, fund: 'GOF I' })),
      ...data.gofII.map((c: any) => ({ ...c, fund: 'GOF II' })),
    ];
  }, [data]);

  // Filter companies based on selected fund
  const filteredCompanies = useMemo(() => {
    if (selectedFund === 'all') return allCompanies;
    return allCompanies.filter((c: any) => c.fund === selectedFund);
  }, [allCompanies, selectedFund]);

  // Helper to safely parse numeric values
  const parseNumeric = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Helper to format currency
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Helper to convert Excel date to JS Date
  const excelDateToJS = (excelDate: number) => {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date;
  };

  // Calculate aggregate metrics based on filtered companies
  const metrics = useMemo(() => {
    const totalInvested = filteredCompanies.reduce((sum: number, c: any) => sum + parseNumeric(c['$ Invested']), 0);
    const totalMarketValue = filteredCompanies.reduce((sum: number, c: any) => sum + parseNumeric(c['Current Market Value']), 0);

    const validInvestments = filteredCompanies.filter((c: any) => parseNumeric(c['$ Invested']) > 0);
    const avgCheck = validInvestments.length > 0
      ? totalInvested / validInvestments.length
      : 0;

    const investmentAmounts = validInvestments.map((c: any) => parseNumeric(c['$ Invested']));
    const largestCheck = investmentAmounts.length > 0 ? Math.max(...investmentAmounts) : 0;
    const smallestCheck = investmentAmounts.length > 0 ? Math.min(...investmentAmounts) : 0;

    // Find latest investment
    const sortedByDate = [...filteredCompanies].sort((a: any, b: any) =>
      parseNumeric(b['Initial  Inv. Date']) - parseNumeric(a['Initial  Inv. Date'])
    );
    const latestInvestment = sortedByDate[0];
    const latestDate = latestInvestment ? excelDateToJS(parseNumeric(latestInvestment['Initial  Inv. Date'])) : null;

    return {
      totalInvested,
      totalMarketValue,
      fundSize: 200000000, // $200M placeholder - no data in spreadsheet
      deploymentPercentage: (totalInvested / 200000000) * 100,
      totalInvestments: filteredCompanies.length,
      avgCheck,
      largestCheck,
      smallestCheck,
      latestDate,
    };
  }, [filteredCompanies]);

  // Latest transactions (sorted by date)
  const latestTransactions = useMemo(() => {
    return [...filteredCompanies]
      .sort((a: any, b: any) => parseNumeric(b['Initial  Inv. Date']) - parseNumeric(a['Initial  Inv. Date']))
      .slice(0, 10);
  }, [filteredCompanies]);

  // Investments per quarter
  const investmentsByQuarter = useMemo(() => {
    const quarterCounts: { [key: string]: number } = {};

    filteredCompanies.forEach((c: any) => {
      const date = excelDateToJS(parseNumeric(c['Initial  Inv. Date']));
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const key = `Q${quarter} ${year}`;
      quarterCounts[key] = (quarterCounts[key] || 0) + 1;
    });

    return Object.entries(quarterCounts)
      .map(([quarter, count]) => ({ quarter, count }))
      .sort((a, b) => {
        const [qA, yA] = a.quarter.split(' ');
        const [qB, yB] = b.quarter.split(' ');
        if (yA !== yB) return parseInt(yA) - parseInt(yB);
        return parseInt(qA.replace('Q', '')) - parseInt(qB.replace('Q', ''));
      });
  }, [filteredCompanies]);

  // Current vs Previous companies (2025 vs 2024)
  const companiesByYear = useMemo(() => {
    const current: any[] = [];
    const previous: any[] = [];

    filteredCompanies.forEach((c: any) => {
      const date = excelDateToJS(parseNumeric(c['Initial  Inv. Date']));
      const year = date.getFullYear();

      if (year >= 2025) {
        current.push(c);
      } else if (year >= 2024) {
        previous.push(c);
      }
    });

    return { current, previous };
  }, [filteredCompanies]);

  // Format date helper
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Amount Deployed / Fund Size */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#212121' }}>Amount deployed / Fund size</h3>
            <span className="text-xs px-2 py-1 rounded" style={{ background: '#f2f5fd', color: '#1082ee' }}>
              {metrics.deploymentPercentage.toFixed(2)}%
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-bold" style={{ color: '#212121' }}>
                {formatCurrency(metrics.totalInvested)}
              </p>
              <p className="text-sm" style={{ color: '#757575' }}>
                of {formatCurrency(metrics.fundSize)}
              </p>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full" style={{ background: '#e0e0e0' }}>
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  background: '#1082ee',
                  width: `${Math.min(metrics.deploymentPercentage, 100)}%`
                }}
              />
            </div>
            <p className="text-xs italic" style={{ color: '#9e9e9e' }}>
              * Fund size is placeholder - no data available in spreadsheet
            </p>
          </div>
        </div>

        {/* Investments */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#212121' }}>Investments</h3>
            {metrics.latestDate && (
              <span className="text-xs px-2 py-1 rounded" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                Latest {formatDate(metrics.latestDate)}
              </span>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-3xl font-bold" style={{ color: '#212121' }}>
              {metrics.totalInvestments}
            </p>
            <p className="text-sm" style={{ color: '#757575' }}>
              Total portfolio companies
            </p>
          </div>
        </div>

        {/* Average Check */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#212121' }}>Average check</h3>
          </div>
          <div className="space-y-3">
            <p className="text-3xl font-bold" style={{ color: '#212121' }}>
              {formatCurrency(metrics.avgCheck)}
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: '#757575' }}>
              <span>Largest: {formatCurrency(metrics.largestCheck)}</span>
              <span>Smallest: {formatCurrency(metrics.smallestCheck)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Transactions Table */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#212121' }}>Latest transactions</h3>
          <a href="/investment-portfolio/transactions" className="text-sm" style={{ color: '#1082ee' }}>
            See all transactions →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#dadada' }}>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Company</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Fund</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Series</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {latestTransactions.map((company: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f0f0f0' }}>
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: '#212121' }}>{company.Company}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{(company as any).fund}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#212121' }}>
                    {formatCurrency(parseNumeric(company['$ Invested']))}
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{company['Initial  Inv. Series']}</td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: '#757575' }}>
                    {excelDateToJS(parseNumeric(company['Initial  Inv. Date'])).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Categories - NO DATA */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>Investment categories</h3>
          <div className="flex items-center justify-center h-64" style={{ background: '#f9f9f9', borderRadius: '8px' }}>
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-3" style={{ color: '#bdbdbd' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: '#757575' }}>No data available in spreadsheet</p>
              <p className="text-xs mt-1" style={{ color: '#9e9e9e' }}>Sector/category data not found in 2025_Q3_RYG_Analysis.xlsx</p>
            </div>
          </div>
        </div>

        {/* Investments Per Quarter */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>Investments per quarter</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={investmentsByQuarter}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="quarter" tick={{ fill: '#757575', fontSize: 12 }} />
              <YAxis tick={{ fill: '#757575', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #dadada', borderRadius: '8px' }}
                labelStyle={{ color: '#212121', fontWeight: 600 }}
              />
              <Bar dataKey="count" fill="#1082ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Locations - NO DATA */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>Top investments locations</h3>
        <div className="flex items-center justify-center h-64" style={{ background: '#f9f9f9', borderRadius: '8px' }}>
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-3" style={{ color: '#bdbdbd' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: '#757575' }}>No data available in spreadsheet</p>
            <p className="text-xs mt-1" style={{ color: '#9e9e9e' }}>Geographic location data not found in 2025_Q3_RYG_Analysis.xlsx</p>
          </div>
        </div>
      </div>

      {/* Co-investors - NO DATA */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>Co-investors</h3>
        <div className="flex items-center justify-center h-48" style={{ background: '#f9f9f9', borderRadius: '8px' }}>
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-3" style={{ color: '#bdbdbd' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: '#757575' }}>No data available in spreadsheet</p>
            <p className="text-xs mt-1" style={{ color: '#9e9e9e' }}>Co-investor data not found in 2025_Q3_RYG_Analysis.xlsx</p>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Companies */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>
            Current companies ({companiesByYear.current.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {companiesByYear.current.slice(0, 12).map((company: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-lg border flex items-center justify-center text-center hover:shadow-md transition-shadow"
                style={{ borderColor: '#dadada', background: '#f9f9f9' }}
              >
                <p className="text-sm font-medium" style={{ color: '#212121' }}>{company.Company}</p>
              </div>
            ))}
          </div>
          {companiesByYear.current.length > 12 && (
            <p className="text-xs mt-4 text-center" style={{ color: '#757575' }}>
              +{companiesByYear.current.length - 12} more companies
            </p>
          )}
        </div>

        {/* Previous Companies */}
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>
            Previous companies ({companiesByYear.previous.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {companiesByYear.previous.slice(0, 12).map((company: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-lg border flex items-center justify-center text-center hover:shadow-md transition-shadow"
                style={{ borderColor: '#dadada', background: '#f9f9f9' }}
              >
                <p className="text-sm font-medium" style={{ color: '#212121' }}>{company.Company}</p>
              </div>
            ))}
          </div>
          {companiesByYear.previous.length > 12 && (
            <p className="text-xs mt-4 text-center" style={{ color: '#757575' }}>
              +{companiesByYear.previous.length - 12} more companies
            </p>
          )}
        </div>
      </div>
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
