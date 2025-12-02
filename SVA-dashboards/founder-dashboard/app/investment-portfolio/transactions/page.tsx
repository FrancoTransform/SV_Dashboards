'use client';

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartaData } from '@/lib/useCartaData';

type FundKey = 'fundI' | 'fundII' | 'fundIII' | 'gofI' | 'gofII';

function TransactionsContent() {
  const { data, analytics, loading, error, isLiveData, lastUpdated, dataNote, refetch } = useCartaData();
  const searchParams = useSearchParams();
  const urlFund = searchParams.get('fund') || 'all';

  const [filterFund, setFilterFund] = useState<string>(urlFund);
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'company' | 'location'>('company');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setFilterFund(urlFund);
  }, [urlFund]);

  // ALL useMemo hooks before any conditional returns
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

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    allCompanies.forEach((c: any) => {
      if (c.stateName) locations.add(c.stateName);
    });
    return Array.from(locations).sort();
  }, [allCompanies]);

  const filteredCompanies = useMemo(() => {
    let filtered = allCompanies;
    if (filterFund !== 'all') {
      filtered = filtered.filter((c: any) => c.fund === filterFund);
    }
    if (filterLocation !== 'all') {
      filtered = filtered.filter((c: any) => c.stateName === filterLocation);
    }
    filtered = [...filtered].sort((a: any, b: any) => {
      let comparison = 0;
      if (sortBy === 'company') {
        comparison = (a.Company || '').localeCompare(b.Company || '');
      } else if (sortBy === 'location') {
        comparison = (a.stateName || '').localeCompare(b.stateName || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return filtered;
  }, [allCompanies, filterFund, filterLocation, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const cartaCount = filteredCompanies.filter((c: any) => c.cartaCompany).length;
    return {
      count: filteredCompanies.length,
      cartaCount,
      nonCartaCount: filteredCompanies.length - cartaCount
    };
  }, [filteredCompanies]);

  const handleSort = useCallback((column: 'company' | 'location') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // Conditional returns AFTER all hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1082ee' }}></div>
          <p className="text-sm" style={{ color: '#757575' }}>Loading transactions from Carta...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <div className="text-center py-8">
          <p className="text-lg font-medium" style={{ color: '#d32f2f' }}>Failed to load transactions</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#757575' }}>Total Companies</h3>
          <p className="text-3xl font-bold" style={{ color: '#212121' }}>{stats.count}</p>
        </div>
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#757575' }}>On Carta Platform</h3>
          <p className="text-3xl font-bold" style={{ color: '#10b981' }}>{stats.cartaCount}</p>
        </div>
        <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#757575' }}>Not on Carta</h3>
          <p className="text-3xl font-bold" style={{ color: '#757575' }}>{stats.nonCartaCount}</p>
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
            <label className="block text-sm font-medium mb-2" style={{ color: '#757575' }}>State of Inc.</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-2 border rounded-lg"
              style={{ borderColor: '#dadada', background: '#fff', color: '#212121' }}
            >
              <option value="all">All States</option>
              {uniqueLocations.map((location: string) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterFund('all');
                setFilterLocation('all');
              }}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ background: '#f2f5fd', color: '#1082ee' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="rounded-lg shadow-sm p-6" style={{ background: '#fff', border: '1px solid #dadada' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#212121' }}>
          All Portfolio Companies ({filteredCompanies.length})
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
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Legal Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Fund</th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium cursor-pointer hover:bg-gray-50"
                  style={{ color: '#757575' }}
                  onClick={() => handleSort('location')}
                >
                  State of Inc. {sortBy === 'location' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>Website</th>
                <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: '#757575' }}>On Carta</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#f0f0f0' }}>
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: '#212121' }}>{company.Company}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{company.legalName || '-'}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{company.fund}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#757575' }}>{company.stateName || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#1082ee' }}>
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').substring(0, 30)}
                        {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').length > 30 ? '...' : ''}
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

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" style={{ color: '#757575' }}>Loading...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
