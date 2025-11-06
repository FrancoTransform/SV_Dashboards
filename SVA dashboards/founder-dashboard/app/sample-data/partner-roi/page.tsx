'use client';

import { useState } from 'react';
import allData from '@/public/mart_partner_roi.json';
import { PartnerData } from '@/lib/partnerTypes';
import { formatCurrency, formatDecimal } from '@/lib/partnerUtils';

export default function PartnerROISampleDataPage() {
  const [selectedPartner, setSelectedPartner] = useState<PartnerData | null>(null);
  const data = allData as PartnerData[];

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
            <a href="/partner-roi" className="text-white text-sm font-medium hover:text-cyan-400 transition-colors">← Back to Dashboard</a>
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
            Partner ROI Dashboard - Underlying data
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Data Overview */}
        <section className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Data Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-300 mb-1">Total Partners</p>
              <p className="text-3xl font-bold text-white">{data.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300 mb-1">Industries</p>
              <p className="text-3xl font-bold text-white">{new Set(data.map(d => d.industry)).size}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300 mb-1">Total Commercial Value</p>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(data.reduce((sum, d) => sum + d.total_commercial_value_usd, 0))}
              </p>
            </div>
          </div>
        </section>

        {/* Partner Cards */}
        <section className="rounded-lg shadow-lg p-6" style={{ background: '#3a4f63' }}>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wide">Partner Details</h2>
          <div className="space-y-4">
            {data.map((partner) => (
              <div 
                key={partner.partner_uid}
                className="rounded-lg p-4 cursor-pointer transition-all"
                style={{ background: '#2d3e50', border: '1px solid #4a5f73' }}
                onClick={() => setSelectedPartner(selectedPartner?.partner_uid === partner.partner_uid ? null : partner)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{partner.partner_name}</h3>
                    <p className="text-sm text-gray-400">{partner.industry} • {partner.partnership_tier} • {partner.company_size}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">ROI Multiple</p>
                    <p className="text-xl font-bold text-cyan-400">{formatDecimal(partner.roi_multiple, 2)}x</p>
                  </div>
                </div>

                {selectedPartner?.partner_uid === partner.partner_uid && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: '#4a5f73' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Commercial Value</p>
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(partner.total_commercial_value_usd)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Cost Savings</p>
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(partner.cost_savings_usd)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Active Pilots</p>
                        <p className="text-sm font-semibold text-white">{partner.active_pilots}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Completed Pilots</p>
                        <p className="text-sm font-semibold text-white">{partner.completed_pilots}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Innovation Score</p>
                        <p className="text-sm font-semibold text-white">{formatDecimal(partner.avg_innovation_score, 1)}/10</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Satisfaction Score</p>
                        <p className="text-sm font-semibold text-white">{partner.partner_satisfaction_score}/100</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Time to Pilot</p>
                        <p className="text-sm font-semibold text-white">{partner.time_to_pilot_days} days</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Strategic Alignment</p>
                        <p className="text-sm font-semibold text-white">{formatDecimal(partner.strategic_alignment_score, 1)}/10</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t" style={{ borderColor: '#4a5f73' }}>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">New Capabilities</p>
                        <p className="text-sm font-semibold text-white">{partner.new_capabilities_gained}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Employee Hours</p>
                        <p className="text-sm font-semibold text-white">{partner.employee_engagement_hours}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Patents Filed</p>
                        <p className="text-sm font-semibold text-white">{partner.patents_filed}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Market Insights</p>
                        <p className="text-sm font-semibold text-white">{partner.market_insights_gained}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

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
            SemperVirens Accelerator · Partner ROI Dashboard · 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

