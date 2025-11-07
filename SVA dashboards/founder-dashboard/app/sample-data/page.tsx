'use client';

import { useState } from 'react';
import founderData from '@/public/mart_founder_success.json';
import { CompanyData } from '@/lib/types';

export default function SampleDataPage() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);

  const data = founderData as CompanyData[];

  // Group data by program cycle
  const cycleGroups = data.reduce((acc, company) => {
    if (!acc[company.program_cycle_uid]) {
      acc[company.program_cycle_uid] = [];
    }
    acc[company.program_cycle_uid].push(company);
    return acc;
  }, {} as Record<string, CompanyData[]>);

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
            <a href="/" className="text-white text-sm font-medium hover:text-cyan-400 transition-colors">Dashboard</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12" style={{ background: '#3a4f63' }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-cyan-400 text-sm font-medium mb-2">SemperVirens Venture Capital</p>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-cyan-400">Sample Data</span>
          </h1>
          <p className="text-xl text-gray-300">
            View the underlying data used to generate the dashboard metrics
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Data Overview */}
        <section className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Data Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-300 mb-1">Total Companies</p>
              <p className="text-3xl font-bold text-white">{new Set(data.map(d => d.company_uid)).size}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300 mb-1">Program Cycles</p>
              <p className="text-3xl font-bold text-white">{Object.keys(cycleGroups).length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300 mb-1">Total Records</p>
              <p className="text-3xl font-bold text-white">{data.length}</p>
            </div>
          </div>
        </section>

        {/* Data by Program Cycle */}
        {Object.entries(cycleGroups).map(([cycle, companies]) => (
          <section key={cycle} className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
            <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">{cycle}</h2>
            <div className="space-y-4">
              {companies.map((company) => (
                <div 
                  key={`${company.company_uid}-${company.program_cycle_uid}`}
                  className="rounded-lg p-4 cursor-pointer transition-all"
                  style={{ background: '#2d3e50', border: '1px solid #4a5f73' }}
                  onClick={() => setSelectedCompany(selectedCompany?.company_uid === company.company_uid && selectedCompany?.program_cycle_uid === company.program_cycle_uid ? null : company)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{company.canonical_name}</h3>
                      <p className="text-sm text-gray-400">{company.sector} • {company.stage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Revenue Growth</p>
                      <p className="text-xl font-bold text-cyan-400">{company.revenue_growth_pct}%</p>
                    </div>
                  </div>

                  {selectedCompany?.company_uid === company.company_uid && selectedCompany?.program_cycle_uid === company.program_cycle_uid && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: '#4a5f73' }}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Follow-on Funding</p>
                          <p className="text-sm font-semibold text-white">
                            ${(company.follow_on_funding_usd / 1000000).toFixed(2)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Pilots Initiated</p>
                          <p className="text-sm font-semibold text-white">{company.pilots_initiated}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Partnerships</p>
                          <p className="text-sm font-semibold text-white">{company.partnerships_signed_count}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Founder NPS</p>
                          <p className="text-sm font-semibold text-white">{company.founder_nps.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Attendance</p>
                          <p className="text-sm font-semibold text-white">{company.sessions_attendance_pct}%</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Mentor Hours</p>
                          <p className="text-sm font-semibold text-white">{company.mentor_hours}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Goal Progress</p>
                          <p className="text-sm font-semibold text-white">{company.goal_progress_score}/5</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Notable Outcomes</p>
                        <p className="text-sm text-gray-300">{company.notable_outcomes}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Raw JSON Data */}
        <section className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Raw JSON Data</h2>
          <div className="rounded p-4 overflow-x-auto" style={{ background: '#2d3e50' }}>
            <pre className="text-xs text-gray-300">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12" style={{ borderColor: '#4a5f73', background: '#2d3e50' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-400 text-center">
            SemperVirens Accelerator · Founder Success Dashboard · 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

