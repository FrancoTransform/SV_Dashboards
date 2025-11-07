'use client';

import { useState, Fragment } from 'react';
import { CompanyData } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/dataUtils';

interface CompanyTableProps {
  data: CompanyData[];
}

export default function CompanyTable({ data }: CompanyTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const sortedData = [...data].sort(
    (a, b) => b.follow_on_funding_usd - a.follow_on_funding_usd
  );

  return (
    <div className="rounded-lg shadow-lg overflow-hidden" style={{ background: '#3a4f63' }}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y" style={{ borderColor: '#4a5f73' }}>
          <thead style={{ background: '#2d3e50' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400">
                Sector
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400">
                Stage
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-400">
                Rev Growth
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-400">
                Funding
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-400">
                Pilots
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-400">
                Partnerships
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-400">
                NPS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ background: '#3a4f63', borderColor: '#4a5f73' }}>
            {sortedData.map((company) => {
              const rowKey = `${company.company_uid}-${company.program_cycle_uid}`;
              return (
                <Fragment key={rowKey}>
                  <tr
                    className="cursor-pointer transition-colors"
                    style={{ background: expandedRow === rowKey ? '#2d3e50' : 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2d3e50'}
                    onMouseLeave={(e) => e.currentTarget.style.background = expandedRow === rowKey ? '#2d3e50' : 'transparent'}
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === rowKey ? null : rowKey
                      )
                    }
                  >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">
                      {company.canonical_name}
                    </div>
                    <div className="text-xs text-gray-400">{company.program_cycle_uid}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {company.sector}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {company.stage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-cyan-400">
                    {formatPercentage(company.revenue_growth_pct)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-cyan-400">
                    {formatCurrency(company.follow_on_funding_usd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                    {company.pilots_initiated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                    {company.partnerships_signed_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                    {company.founder_nps.toFixed(0)}
                  </td>
                </tr>
                {expandedRow === rowKey && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4" style={{ background: '#2d3e50' }}>
                      <div className="space-y-4">
                        <div>
                          <span className="font-bold text-sm text-cyan-400">Notable Outcomes:</span>
                          <p className="text-sm text-gray-300 mt-1">{company.notable_outcomes}</p>
                        </div>

                        <div>
                          <span className="font-bold text-sm text-cyan-400 block mb-2">Product & GTM Readiness:</span>
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Product Readiness</span>
                              <p className="text-sm font-semibold text-white">{company.product_readiness}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">GTM Maturity</span>
                              <p className="text-sm font-semibold text-white">{company.gtm_maturity}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">ICP Clarity</span>
                              <p className="text-sm font-semibold text-white">{company.icp_clarity}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Sales Motion</span>
                              <p className="text-sm font-semibold text-white">{company.sales_motion}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-sm text-cyan-400 block mb-2">Engagement Metrics:</span>
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Attendance</span>
                              <p className="text-sm font-semibold text-white">
                                {formatPercentage(company.sessions_attendance_pct)}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Mentor Hours</span>
                              <p className="text-sm font-semibold text-white">
                                {company.mentor_hours}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Advisor Relationships</span>
                              <p className="text-sm font-semibold text-white">
                                {company.advisor_relationships_formed}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Goal Progress</span>
                              <p className="text-sm font-semibold text-white">
                                {company.goal_progress_score}/5
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

