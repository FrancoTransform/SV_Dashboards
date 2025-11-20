'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import portfolioData from '@/public/mart_investment_portfolio.json';

type FundKey = 'fundI' | 'fundII' | 'fundIII' | 'gofI' | 'gofII';

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

function TransactionsContent() {
  const data = portfolioData as any;
  const searchParams = useSearchParams();
  const urlFund = searchParams.get('fund') || 'all';

  const [filterFund, setFilterFund] = useState<string>(urlFund);
  const [filterSeries, setFilterSeries] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'company'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Update local filter when URL parameter changes
  useEffect(() => {
    setFilterFund(urlFund);
  }, [urlFund]);

  // Combine all companies from all funds
  const allTransactions = useMemo(() => {
    return [
      ...data.fundI.map((c: any) => ({ ...c, fund: 'Fund I' })),
      ...data.fundII.map((c: any) => ({ ...c, fund: 'Fund II' })),
      ...data.fundIII.map((c: any) => ({ ...c, fund: 'Fund III' })),
      ...data.gofI.map((c: any) => ({ ...c, fund: 'GOF I' })),
      ...data.gofII.map((c: any) => ({ ...c, fund: 'GOF II' })),
    ];
  }, [data]);

  // Helper functions
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

  const excelDateToJS = (excelDate: number) => {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date;
  };

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

  // Get unique series for filter
  const uniqueSeries = useMemo(() => {
    const series = new Set<string>();
    allTransactions.forEach((t: any) => {
      if (t['Initial  Inv. Series']) series.add(t['Initial  Inv. Series']);
    });
    return Array.from(series).sort();
  }, [allTransactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    // Apply fund filter
    if (filterFund !== 'all') {
      filtered = filtered.filter((t: any) => (t as any).fund === filterFund);
    }

    // Apply series filter
    if (filterSeries !== 'all') {
      filtered = filtered.filter((t: any) => t['Initial  Inv. Series'] === filterSeries);
    }

    // Sort
    filtered = [...filtered].sort((a: any, b: any) => {
      let comparison = 0;

      if (sortBy === 'date') {
        comparison = parseNumeric(a['Initial  Inv. Date']) - parseNumeric(b['Initial  Inv. Date']);
      } else if (sortBy === 'amount') {
        comparison = parseNumeric(a['$ Invested']) - parseNumeric(b['$ Invested']);
      } else if (sortBy === 'company') {
        comparison = a.Company.localeCompare(b.Company);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allTransactions, filterFund, filterSeries, sortBy, sortOrder]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalInvested = filteredTransactions.reduce((sum: number, t: any) => sum + parseNumeric(t['$ Invested']), 0);
    const totalMarketValue = filteredTransactions.reduce((sum: number, t: any) => sum + parseNumeric(t['Current Market Value']), 0);

    return {
      count: filteredTransactions.length,
      totalInvested,
      totalMarketValue,
      avgMOIC: totalInvested > 0 ? totalMarketValue / totalInvested : 0
    };
  }, [filteredTransactions]);

  const handleSort = (column: 'date' | 'amount' | 'company') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#757575' }}>Total Transactions</h3>
          <p className="text-3xl font-bold" style={{ color: '#212121' }}>{totals.count}</p>
        </div>
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#757575' }}>Total Invested</h3>
          <p className="text-3xl font-bold" style={{ color: '#212121' }}>{formatCurrency(totals.totalInvested)}</p>
        </div>
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#757575' }}>Current Value</h3>
          <p className="text-3xl font-bold" style={{ color: '#212121' }}>{formatCurrency(totals.totalMarketValue)}</p>
        </div>
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#757575' }}>Average MOIC</h3>
          <p className="text-3xl font-bold" style={{ color: '#212121' }}>{formatMOIC(totals.avgMOIC)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#757575' }}>Fund</label>
            <select
              value={filterFund}
              onChange={(e) => setFilterFund(e.target.value)}
              className="px-4 py-2 border rounded-lg"
              style={{ borderColor: '#dadada', background: '#fff', color: '#212121' }}
            >
              <option value="all">All Funds</option>
              <option value="Fund I">Fund I</option>
              <option value="Fund II">Fund II</option>
              <option value="Fund III">Fund III</option>
              <option value="GOF I">GOF I</option>
              <option value="GOF II">GOF II</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#757575' }}>Series</label>
            <select
              value={filterSeries}
              onChange={(e) => setFilterSeries(e.target.value)}
              className="px-4 py-2 border rounded-lg"
              style={{ borderColor: '#dadada', background: '#fff', color: '#212121' }}
            >
              <option value="all">All Series</option>
              {uniqueSeries.map((series: string) => (
                <option key={series} value={series}>{series}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterFund('all');
                setFilterSeries('all');
              }}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ background: '#f2f5fd', color: '#1082ee' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>
          All Transactions ({filteredTransactions.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#dadada' }}>
                <th
                  className="text-left py-3 px-4 text-sm font-medium cursor-pointer hover:bg-gray-50"
                  style={{ color: '#757575' }}
                  onClick={() => handleSort('company')}
                >
                  Company {sortBy === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Fund</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Series</th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium cursor-pointer hover:bg-gray-50"
                  style={{ color: '#757575' }}
                  onClick={() => handleSort('amount')}
                >
                  Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Market Value</th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>MOIC</th>
                <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Status</th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium cursor-pointer hover:bg-gray-50"
                  style={{ color: '#757575' }}
                  onClick={() => handleSort('date')}
                >
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f0f0f0' }}>
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: '#212121' }}>{transaction.Company}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{(transaction as any).fund}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{transaction['Initial  Inv. Series']}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#212121' }}>
                    {formatCurrency(parseNumeric(transaction['$ Invested']))}
                  </td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: '#1082ee' }}>
                    {formatCurrency(parseNumeric(transaction['Current Market Value']))}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#10b981' }}>
                    {formatMOIC(transaction.MOIC)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(transaction['Current Q3 Status']) }}
                      title={getStatusLabel(transaction['Current Q3 Status'])}
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: '#757575' }}>
                    {excelDateToJS(parseNumeric(transaction['Initial  Inv. Date'])).toLocaleDateString()}
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

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" style={{ color: '#757575' }}>Loading...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
