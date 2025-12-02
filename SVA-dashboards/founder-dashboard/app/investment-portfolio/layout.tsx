'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCartaData } from '@/lib/useCartaData';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data, loading } = useCartaData();
  const selectedFund = searchParams.get('fund') || 'all';

  // Default empty counts if data is loading or not available
  const fundCounts = {
    fundI: data?.fundI?.length || 0,
    fundII: data?.fundII?.length || 0,
    fundIII: data?.fundIII?.length || 0,
    gofI: data?.gofI?.length || 0,
    gofII: data?.gofII?.length || 0,
  };
  const totalCount = fundCounts.fundI + fundCounts.fundII + fundCounts.fundIII + fundCounts.gofI + fundCounts.gofII;

  const handleFundChange = (fund: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (fund === 'all') {
      params.delete('fund');
    } else {
      params.set('fund', fund);
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  const navItems = [
    { name: 'Dashboard', href: '/investment-portfolio', icon: '📊' },
    { name: 'Fund Statistics', href: '/investment-portfolio/fund-statistics', icon: '📈' },
    { name: 'Transactions', href: '/investment-portfolio/transactions', icon: '💳' },
  ];

  const isActive = (href: string) => {
    if (href === '/investment-portfolio') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen" style={{ background: '#f9f9f9' }}>
      {/* Top Header */}
      <header className="border-b" style={{ background: '#fff', borderColor: '#dadada' }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold" style={{ color: '#212121' }}>Investment Portfolio</h1>
          </div>
          <Link
            href="/"
            className="text-sm px-4 py-2 rounded transition-colors"
            style={{ color: '#1082ee', background: '#f2f5fd' }}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Fund Filter Tabs */}
        <div className="px-6 pb-4 border-t" style={{ borderColor: '#f0f0f0' }}>
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => handleFundChange('all')}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: selectedFund === 'all' ? '#1082ee' : '#f9f9f9',
                color: selectedFund === 'all' ? '#fff' : '#757575',
                border: selectedFund === 'all' ? 'none' : '1px solid #dadada'
              }}
            >
              All Funds {loading ? '' : `(${totalCount})`}
            </button>
            <button
              onClick={() => handleFundChange('Fund I')}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: selectedFund === 'Fund I' ? '#1082ee' : '#f9f9f9',
                color: selectedFund === 'Fund I' ? '#fff' : '#757575',
                border: selectedFund === 'Fund I' ? 'none' : '1px solid #dadada'
              }}
            >
              Fund I {loading ? '' : `(${fundCounts.fundI})`}
            </button>
            <button
              onClick={() => handleFundChange('Fund II')}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: selectedFund === 'Fund II' ? '#1082ee' : '#f9f9f9',
                color: selectedFund === 'Fund II' ? '#fff' : '#757575',
                border: selectedFund === 'Fund II' ? 'none' : '1px solid #dadada'
              }}
            >
              Fund II {loading ? '' : `(${fundCounts.fundII})`}
            </button>
            <button
              onClick={() => handleFundChange('Fund III')}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: selectedFund === 'Fund III' ? '#1082ee' : '#f9f9f9',
                color: selectedFund === 'Fund III' ? '#fff' : '#757575',
                border: selectedFund === 'Fund III' ? 'none' : '1px solid #dadada'
              }}
            >
              Fund III {loading ? '' : `(${fundCounts.fundIII})`}
            </button>
            <button
              onClick={() => handleFundChange('GOF I')}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: selectedFund === 'GOF I' ? '#1082ee' : '#f9f9f9',
                color: selectedFund === 'GOF I' ? '#fff' : '#757575',
                border: selectedFund === 'GOF I' ? 'none' : '1px solid #dadada'
              }}
            >
              GOF I {loading ? '' : `(${fundCounts.gofI})`}
            </button>
            <button
              onClick={() => handleFundChange('GOF II')}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: selectedFund === 'GOF II' ? '#1082ee' : '#f9f9f9',
                color: selectedFund === 'GOF II' ? '#fff' : '#757575',
                border: selectedFund === 'GOF II' ? 'none' : '1px solid #dadada'
              }}
            >
              GOF II {loading ? '' : `(${fundCounts.gofII})`}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 border-r transition-transform duration-300`}
          style={{ background: '#fff', borderColor: '#dadada', top: '73px' }}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'font-semibold'
                    : 'hover:bg-gray-50'
                }`}
                style={
                  isActive(item.href)
                    ? { background: '#f2f5fd', color: '#1082ee' }
                    : { color: '#212121' }
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Fund Selector */}
          <div className="p-4 border-t" style={{ borderColor: '#dadada' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: '#212121' }}>
              Select Fund
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              style={{ borderColor: '#dadada', background: '#fff' }}
            >
              <option>All Funds</option>
              <option>Fund I</option>
              <option>Fund II</option>
              <option>Fund III</option>
              <option>GOF I</option>
              <option>GOF II</option>
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function InvestmentPortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#f9f9f9', color: '#757575' }}>Loading...</div>}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
