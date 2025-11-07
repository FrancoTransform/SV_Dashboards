'use client';

import { useState, Fragment } from 'react';
import { PartnerData } from '@/lib/partnerTypes';
import { formatCurrency, formatDecimal } from '@/lib/partnerUtils';

interface PartnerTableProps {
  data: PartnerData[];
}

export default function PartnerTable({ data }: PartnerTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const sortedData = [...data].sort(
    (a, b) => b.total_commercial_value_usd - a.total_commercial_value_usd
  );

  return (
    <div className="rounded-lg shadow-lg overflow-hidden" style={{ background: '#3a4f63' }}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y" style={{ borderColor: '#4a5f73' }}>
          <thead style={{ background: '#2d3e50' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400">
                Partner
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400">
                Industry
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400">
                Tier
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-400">
                Commercial Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-400">
                ROI Multiple
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-400">
                Active Pilots
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-400">
                Innovation Score
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-400">
                Satisfaction
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ background: '#3a4f63', borderColor: '#4a5f73' }}>
            {sortedData.map((partner) => {
              const rowKey = partner.partner_uid;
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
                      {partner.partner_name}
                    </div>
                    <div className="text-xs text-gray-400">{partner.company_size}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {partner.industry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {partner.partnership_tier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-cyan-400">
                    {formatCurrency(partner.total_commercial_value_usd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-cyan-400">
                    {formatDecimal(partner.roi_multiple, 2)}x
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                    {partner.active_pilots}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                    {formatDecimal(partner.avg_innovation_score, 1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                    {partner.partner_satisfaction_score}
                  </td>
                </tr>
                {expandedRow === rowKey && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4" style={{ background: '#2d3e50' }}>
                      <div className="space-y-4">
                        <div>
                          <span className="font-bold text-sm text-cyan-400 block mb-2">Partner Details:</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">BU Focus</span>
                              <p className="text-sm font-semibold text-white">{partner.bu_focus}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Primary Contact</span>
                              <p className="text-sm font-semibold text-white">{partner.primary_contact}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Repeat Engagement</span>
                              <p className="text-sm font-semibold text-white">{partner.repeat_engagement}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Investments Made</span>
                              <p className="text-sm font-semibold text-white">{partner.investments_made}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-sm text-cyan-400 block mb-2">Participation:</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Sessions Attended</span>
                              <p className="text-sm font-semibold text-white">{partner.sessions_attended}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Founders Met</span>
                              <p className="text-sm font-semibold text-white">{partner.founders_met}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Integrations Completed</span>
                              <p className="text-sm font-semibold text-white">{partner.integrations_completed}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Participation Type</span>
                              <p className="text-sm font-semibold text-white">{partner.participation_type.join(', ')}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-sm text-cyan-400 block mb-2">Thematic Interests:</span>
                          <div className="flex flex-wrap gap-2">
                            {partner.thematic_interest.map((interest, idx) => (
                              <span key={idx} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#4a5f73', color: '#4dd0e1' }}>
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-sm text-cyan-400 block mb-2">Performance Metrics:</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Cost Savings</span>
                              <p className="text-sm font-semibold text-white">
                                {formatCurrency(partner.cost_savings_usd)}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Completed Pilots</span>
                              <p className="text-sm font-semibold text-white">{partner.completed_pilots}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Time to Pilot</span>
                              <p className="text-sm font-semibold text-white">{partner.time_to_pilot_days} days</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase text-gray-400">Strategic Alignment</span>
                              <p className="text-sm font-semibold text-white">{formatDecimal(partner.strategic_alignment_score, 1)}/10</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t" style={{ borderColor: '#4a5f73' }}>
                          <div>
                            <span className="text-xs font-bold uppercase text-gray-400">New Capabilities</span>
                            <p className="text-sm font-semibold text-white">{partner.new_capabilities_gained}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase text-gray-400">Employee Hours</span>
                            <p className="text-sm font-semibold text-white">{partner.employee_engagement_hours}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase text-gray-400">Patents Filed</span>
                            <p className="text-sm font-semibold text-white">{partner.patents_filed}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase text-gray-400">Market Insights</span>
                            <p className="text-sm font-semibold text-white">{partner.market_insights_gained}</p>
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

