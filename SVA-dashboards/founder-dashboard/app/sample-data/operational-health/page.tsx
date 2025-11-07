'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import operationalData from '@/public/mart_operational_health.json';

export default function OperationalHealthSampleData() {
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);

  const getEfficiencyRating = (score: number) => {
    if (score >= 8.5) return { label: 'Excellent', color: '#6bcf7f' };
    if (score >= 7.5) return { label: 'Good', color: '#4dd0e1' };
    if (score >= 6.5) return { label: 'Fair', color: '#ffd93d' };
    return { label: 'Needs Improvement', color: '#ff6b6b' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#2d3e50', color: '#fff', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <Link href="/operational-health" style={{ color: '#4dd0e1', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Operational Health Dashboard
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '20px', marginBottom: '10px' }}>
            Operational Health Sample Data
          </h1>
          <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
            Explore the raw data powering the Operational Health dashboard
          </p>
        </div>

        {/* Data Source */}
        <div style={{
          background: '#3a4f63',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          borderLeft: '4px solid #4dd0e1'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '15px', color: '#4dd0e1' }}>Data Source</h2>
          <p style={{ color: '#ddd', marginBottom: '10px' }}>
            This data represents operational metrics derived from program management systems and aggregated from <span style={{ fontWeight: 600, color: '#fff' }}>GTM & Corp Dev Intros PY8.xlsx</span>.
          </p>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 600 }}>Real data:</span> Company counts per cycle, mentor hours, session counts<br/>
            <span style={{ fontWeight: 600 }}>Synthetic data:</span> Budget figures, efficiency scores, ROI metrics (for privacy)
          </p>
        </div>

        {/* Data Overview */}
        <div style={{
          background: '#3a4f63',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          border: '1px solid #4a5f73'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Data Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ color: '#4dd0e1', fontSize: '2rem', fontWeight: 700 }}>{operationalData.length}</div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Program Cycles</div>
            </div>
            <div>
              <div style={{ color: '#4dd0e1', fontSize: '2rem', fontWeight: 700 }}>
                {(operationalData.reduce((sum, c) => sum + c.operational_efficiency_score, 0) / operationalData.length).toFixed(1)}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Avg Efficiency Score</div>
            </div>
            <div>
              <div style={{ color: '#4dd0e1', fontSize: '2rem', fontWeight: 700 }}>
                {(operationalData.reduce((sum, c) => sum + c.budget_utilization_pct, 0) / operationalData.length).toFixed(0)}%
              </div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Avg Budget Utilization</div>
            </div>
          </div>
        </div>

        {/* Cycle Cards */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Program Cycles</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {operationalData.map((cycle) => {
              const rating = getEfficiencyRating(cycle.operational_efficiency_score);
              return (
                <div
                  key={cycle.program_cycle_uid}
                  style={{
                    background: '#3a4f63',
                    borderRadius: '12px',
                    padding: '25px',
                    border: '1px solid #4a5f73',
                    cursor: 'pointer'
                  }}
                  onClick={() => setExpandedCycle(expandedCycle === cycle.program_cycle_uid ? null : cycle.program_cycle_uid)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{cycle.program_cycle_uid}</h3>
                    <div style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: rating.color,
                      color: '#ffffff'
                    }}>
                      {rating.label}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Efficiency Score</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{cycle.operational_efficiency_score}/10</div>
                    </div>
                    <div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Budget Utilization</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{cycle.budget_utilization_pct}%</div>
                    </div>
                    <div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>ROI</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{cycle.roi_on_investment}x</div>
                    </div>
                    <div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Cost per Company</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        ${(cycle.cost_per_company_usd / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>

                  {expandedCycle === cycle.program_cycle_uid && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #4a5f73' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>Budget Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Allocated</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                            ${(cycle.budget_allocated_usd / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Spent</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                            ${(cycle.budget_spent_usd / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Remaining</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                            ${((cycle.budget_allocated_usd - cycle.budget_spent_usd) / 1000).toFixed(0)}K
                          </div>
                        </div>
                      </div>

                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>Engagement Metrics</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Session Completion</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.session_completion_rate_pct}%</div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Avg Attendance</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.avg_attendance_rate_pct}%</div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Mentor Utilization</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.mentor_utilization_rate_pct}%</div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Curriculum Completion</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.curriculum_completion_rate_pct}%</div>
                        </div>
                      </div>

                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>Additional Metrics</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Platform Uptime</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.platform_uptime_pct}%</div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Application Volume</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.application_volume}</div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Acceptance Rate</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.acceptance_rate_pct}%</div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Media Mentions</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.media_mentions}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Raw JSON */}
        <div style={{ 
          background: '#3a4f63', 
          borderRadius: '12px', 
          padding: '30px',
          border: '1px solid #4a5f73'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Raw JSON Data</h2>
          <pre style={{ 
            background: '#2d3e50', 
            padding: '20px', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '0.85rem',
            lineHeight: '1.6'
          }}>
            {JSON.stringify(operationalData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

