'use client';

import React, { useState } from 'react';

interface Application {
  application_uid: string;
  company_name: string;
  cohort: string;
  application_status: string;
  year_founded: number | null;
  currently_fundraising: boolean;
  referral_source: string;
  company_description: string;
  problem_statement: string;
  target_customer: string;
  market_size: string;
  traction: string;
  runway_months: string;
  submitted_at: string | null;
  company_website: string;
  pitch_deck: string;
  demo_link: string;
  founders: string;
  team_size: string;
}

export default function ApplicationsSampleDataPage() {
  const [data] = useState<Application[]>(require('../../../public/mart_applications.json'));
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Group by cohort
  const groupedData = data.reduce((acc, app) => {
    const cohort = app.cohort;
    if (!acc[cohort]) acc[cohort] = [];
    acc[cohort].push(app);
    return acc;
  }, {} as { [key: string]: Application[] });

  return (
    <div style={{ background: '#2d3e50', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <header style={{ background: '#1a2332', padding: '20px 40px', borderBottom: '1px solid #4a5f73' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <a href="/applications" style={{ color: '#4dd0e1', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              ← Back to Applications Dashboard
            </a>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#fff' }}>APPLICATIONS DATA</h1>
          <p style={{ margin: '8px 0 0 0', color: '#b0bec5' }}>Complete application records from SVA Applications.xlsx</p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {/* Data Source Section */}
        <section className="rounded-lg shadow-lg p-6 mb-8" style={{ background: '#3a4f63', borderLeft: '4px solid #4dd0e1' }}>
          <h2 className="text-xl font-bold text-cyan-400 mb-3 uppercase tracking-wide">Data Source</h2>
          <p className="text-gray-300 mb-2">
            This data is derived from <span className="font-semibold text-white">SVA Applications.xlsx</span> - "Raw Application Data" sheet, which contains 164 applications across 3 cohorts.
          </p>
          <p className="text-sm text-gray-400">
            <span className="font-semibold">Real data:</span> Company names, year founded, company descriptions, problem statements, founders, team size, website links, pitch decks, demo links<br/>
            <span className="font-semibold">Cohort breakdown:</span> Cohort 1 (22 companies), Cohort 2 (127 companies), Cohort 3 (15 companies)
          </p>
        </section>

        {/* Data Overview */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4dd0e1' }}>{data.length}</div>
              <div style={{ fontSize: '0.9rem', color: '#b0bec5', marginTop: '8px' }}>Total Applications</div>
            </div>
            <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4dd0e1' }}>{Object.keys(groupedData).length}</div>
              <div style={{ fontSize: '0.9rem', color: '#b0bec5', marginTop: '8px' }}>Cohorts</div>
            </div>
            <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4dd0e1' }}>
                {data.filter(a => a.currently_fundraising).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#b0bec5', marginTop: '8px' }}>Currently Fundraising</div>
            </div>
            <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4dd0e1' }}>
                {Math.round(data.filter(a => a.year_founded).reduce((sum, a) => sum + (a.year_founded || 0), 0) / data.filter(a => a.year_founded).length)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#b0bec5', marginTop: '8px' }}>Avg Year Founded</div>
            </div>
          </div>
        </section>

        {/* Applications by Cohort */}
        {Object.entries(groupedData).sort((a, b) => a[0].localeCompare(b[0])).map(([cohort, apps]) => (
          <section key={cohort} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: '#4dd0e1', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {cohort} ({apps.length} Applications)
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {apps.map((app) => (
                <div
                  key={app.application_uid}
                  style={{
                    background: '#3a4f63',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setExpandedCard(expandedCard === app.application_uid ? null : app.application_uid)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>{app.company_name}</h3>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: app.application_status === 'PASSED' ? '#4dd0e1' : app.application_status === 'PENDING' ? '#ffa726' : '#ef5350',
                          color: '#fff',
                        }}>
                          {app.application_status}
                        </span>
                        {app.year_founded && (
                          <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#4a5f73', color: '#fff' }}>
                            Founded {app.year_founded}
                          </span>
                        )}
                        {app.currently_fundraising && (
                          <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#c084fc', color: '#fff' }}>
                            Fundraising
                          </span>
                        )}
                      </div>
                    </div>
                    <button style={{ background: 'transparent', border: 'none', color: '#4dd0e1', cursor: 'pointer', fontSize: '1.2rem' }}>
                      {expandedCard === app.application_uid ? '▼' : '▶'}
                    </button>
                  </div>

                  <div style={{ color: '#b0bec5', fontSize: '0.9rem', marginBottom: '8px' }}>
                    <strong>Referral:</strong> {app.referral_source.substring(0, 80)}
                  </div>

                  {expandedCard === app.application_uid && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #4a5f73', display: 'grid', gap: '16px' }}>
                      <div>
                        <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Company Description</h4>
                        <p style={{ color: '#b0bec5', margin: 0, lineHeight: '1.6' }}>{app.company_description}</p>
                      </div>
                      <div>
                        <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Problem Statement</h4>
                        <p style={{ color: '#b0bec5', margin: 0, lineHeight: '1.6' }}>{app.problem_statement}</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Founders</h4>
                          <p style={{ color: '#b0bec5', margin: 0, lineHeight: '1.6' }}>{app.founders || 'N/A'}</p>
                        </div>
                        <div>
                          <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Team Size</h4>
                          <p style={{ color: '#b0bec5', margin: 0, lineHeight: '1.6' }}>{app.team_size || 'N/A'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        {app.company_website && (
                          <div>
                            <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Website</h4>
                            <a href={app.company_website} target="_blank" rel="noopener noreferrer" style={{ color: '#4dd0e1', textDecoration: 'none' }}>
                              Visit Site →
                            </a>
                          </div>
                        )}
                        {app.pitch_deck && (
                          <div>
                            <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Pitch Deck</h4>
                            <a href={app.pitch_deck} target="_blank" rel="noopener noreferrer" style={{ color: '#4dd0e1', textDecoration: 'none' }}>
                              View Deck →
                            </a>
                          </div>
                        )}
                        {app.demo_link && (
                          <div>
                            <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Demo</h4>
                            <a href={app.demo_link} target="_blank" rel="noopener noreferrer" style={{ color: '#4dd0e1', textDecoration: 'none' }}>
                              Watch Demo →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Raw JSON Data */}
        <section style={{ marginTop: '60px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: '#4dd0e1', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Raw JSON Data
          </h2>
          <div style={{ background: '#1a2332', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <pre style={{ color: '#b0bec5', fontSize: '0.85rem', overflow: 'auto', margin: 0 }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}

