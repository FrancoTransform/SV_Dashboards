'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import cycleData from '@/public/mart_cycle_snapshot.json';

export default function CycleSnapshotSampleData() {
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: '#2d3e50', color: '#fff', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <Link href="/cycle-snapshot" style={{ color: '#4dd0e1', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Cycle Snapshot Dashboard
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '20px', marginBottom: '10px' }}>
            Cycle Snapshot Sample Data
          </h1>
          <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
            Explore the raw data powering the Cycle Snapshot dashboard
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
            This data is aggregated from <span style={{ fontWeight: 600, color: '#fff' }}>GTM & Corp Dev Intros PY8.xlsx</span> and represents cohort-level metrics across 43 portfolio companies.
          </p>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 600 }}>Real data:</span> Company counts, intro counts, sector distribution<br/>
            <span style={{ fontWeight: 600 }}>Synthetic data:</span> Revenue growth, funding totals, NPS scores (for privacy)
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
              <div style={{ color: '#4dd0e1', fontSize: '2rem', fontWeight: 700 }}>{cycleData.length}</div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Program Cycles</div>
            </div>
            <div>
              <div style={{ color: '#4dd0e1', fontSize: '2rem', fontWeight: 700 }}>
                {cycleData.reduce((sum, c) => sum + c.total_companies, 0)}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Total Companies</div>
            </div>
            <div>
              <div style={{ color: '#4dd0e1', fontSize: '2rem', fontWeight: 700 }}>
                {cycleData.reduce((sum, c) => sum + c.total_founders, 0)}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Total Founders</div>
            </div>
          </div>
        </div>

        {/* Cycle Cards */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Cycles</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cycleData.map((cycle) => (
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
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '5px' }}>
                      {cycle.cycle_name}
                    </h3>
                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
                      {cycle.start_date} to {cycle.end_date}
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: cycle.status === 'Completed' ? '#4dd0e1' : '#c084fc',
                    color: '#ffffff'
                  }}>
                    {cycle.status}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Companies</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{cycle.total_companies}</div>
                  </div>
                  <div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Founders</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{cycle.total_founders}</div>
                  </div>
                  <div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Avg Revenue Growth</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{cycle.avg_revenue_growth_pct}%</div>
                  </div>
                  <div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Total Funding</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                      ${(cycle.total_funding_raised_usd / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                {expandedCycle === cycle.program_cycle_uid && (
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #4a5f73' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Top Achievements</h4>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                      {cycle.top_achievements.map((achievement, idx) => (
                        <li key={idx} style={{ marginBottom: '8px', color: '#ddd' }}>{achievement}</li>
                      ))}
                    </ul>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Sectors</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                      {cycle.sectors_represented.map((sector) => (
                        <span
                          key={sector}
                          style={{
                            padding: '4px 12px',
                            background: '#4a5f73',
                            borderRadius: '12px',
                            fontSize: '0.85rem'
                          }}
                        >
                          {sector}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                      <div>
                        <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Media Mentions</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.media_mentions}</div>
                      </div>
                      <div>
                        <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Investor Connections</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.investor_connections}</div>
                      </div>
                      <div>
                        <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Job Creation</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.job_creation}</div>
                      </div>
                      {cycle.graduation_rate_pct && (
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Graduation Rate</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{cycle.graduation_rate_pct}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
            {JSON.stringify(cycleData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

