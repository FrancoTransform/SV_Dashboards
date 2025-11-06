'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import data from '../../../public/mart_advisors.json';

interface Advisor {
  advisor_uid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: string;
  company: string;
  title: string;
  linkedin_url: string;
  location: string;
  engagement: string;
  expertise: string;
  company_size: string;
  annual_revenue: string;
  portco_advisor: string;
  date_added: string | null;
  female: boolean;
  urm: boolean;
  referred_by: string;
  onboarded: string;
}

export default function AdvisorsSampleDataPage() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Group by role
  const groupedByRole: { [key: string]: Advisor[] } = {};
  data.forEach((advisor: Advisor) => {
    if (!groupedByRole[advisor.role]) {
      groupedByRole[advisor.role] = [];
    }
    groupedByRole[advisor.role].push(advisor);
  });

  return (
    <div style={{ minHeight: '100vh', background: '#2d3e50', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href="/advisors"
            style={{
              display: 'inline-block',
              color: '#4dd0e1',
              textDecoration: 'none',
              marginBottom: '20px',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            ← Back to Advisory Board Dashboard
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
            Advisory Board Sample Data
          </h1>
          <p style={{ color: '#b0bec5', marginTop: '16px', fontSize: '1.1rem' }}>
            This data is derived from <span style={{ fontWeight: 700, color: '#fff' }}>SemperVirens Advisory Board.xlsx</span> - "Full Contact List" sheet, which contains 178 advisors.
          </p>
          <p style={{ color: '#b0bec5', marginTop: '8px', fontSize: '0.95rem' }}>
            <span style={{ fontWeight: 700 }}>Real data:</span> Advisor names, roles, companies, titles, locations, expertise areas, LinkedIn profiles, portfolio company assignments<br/>
            <span style={{ fontWeight: 700 }}>Role breakdown:</span> HR Venture Advisors (151), Executive Advisors (18), Insights Advisors (8)
          </p>
        </div>

        {/* Data Overview */}
        <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '30px', marginBottom: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Data Overview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase' }}>Total Advisors</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4dd0e1' }}>{data.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase' }}>Advisor Roles</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4dd0e1' }}>{Object.keys(groupedByRole).length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase' }}>PortCo Connections</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4dd0e1' }}>{data.filter((a: Advisor) => a.portco_advisor).length}</div>
            </div>
          </div>
        </div>

        {/* Advisors by Role */}
        {Object.entries(groupedByRole).map(([role, advisors]) => (
          <div key={role} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px', color: '#4dd0e1', textTransform: 'uppercase', letterSpacing: '2px' }}>
              {role} ({advisors.length})
            </h2>

            <div style={{ display: 'grid', gap: '20px' }}>
              {advisors.map((advisor: Advisor) => (
                <div
                  key={advisor.advisor_uid}
                  style={{
                    background: '#3a4f63',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setExpandedCard(expandedCard === advisor.advisor_uid ? null : advisor.advisor_uid)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, marginBottom: '8px' }}>
                        {advisor.full_name}
                      </h3>
                      <div style={{ color: '#b0bec5', fontSize: '0.95rem', marginBottom: '12px' }}>
                        <strong>{advisor.title}</strong> at {advisor.company}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#4dd0e1', color: '#2d3e50' }}>
                          {advisor.location}
                        </span>
                        {advisor.portco_advisor && (
                          <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#c084fc', color: '#fff' }}>
                            PortCo Advisor
                          </span>
                        )}
                        {advisor.female && (
                          <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#4a5f73', color: '#fff' }}>
                            Female
                          </span>
                        )}
                        {advisor.urm && (
                          <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#4a5f73', color: '#fff' }}>
                            URM
                          </span>
                        )}
                      </div>
                    </div>
                    <button style={{ background: 'transparent', border: 'none', color: '#4dd0e1', cursor: 'pointer', fontSize: '1.2rem' }}>
                      {expandedCard === advisor.advisor_uid ? '▼' : '▶'}
                    </button>
                  </div>

                  {expandedCard === advisor.advisor_uid && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #4a5f73', display: 'grid', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Email</h4>
                          {advisor.email ? (
                            <a href={`mailto:${advisor.email}`} style={{ color: '#4dd0e1', textDecoration: 'none' }}>
                              {advisor.email}
                            </a>
                          ) : (
                            <p style={{ color: '#b0bec5', margin: 0 }}>N/A</p>
                          )}
                        </div>
                        <div>
                          <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>LinkedIn</h4>
                          {advisor.linkedin_url ? (
                            <a href={advisor.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4dd0e1', textDecoration: 'none' }}>
                              View Profile →
                            </a>
                          ) : (
                            <p style={{ color: '#b0bec5', margin: 0 }}>N/A</p>
                          )}
                        </div>
                      </div>

                      {advisor.expertise && (
                        <div>
                          <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Areas of Expertise</h4>
                          <p style={{ color: '#b0bec5', margin: 0, lineHeight: '1.6' }}>{advisor.expertise}</p>
                        </div>
                      )}

                      {advisor.portco_advisor && (
                        <div>
                          <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Portfolio Company Assignments</h4>
                          <p style={{ color: '#b0bec5', margin: 0, lineHeight: '1.6' }}>{advisor.portco_advisor}</p>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        {advisor.company_size && (
                          <div>
                            <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Company Size</h4>
                            <p style={{ color: '#b0bec5', margin: 0 }}>{advisor.company_size}</p>
                          </div>
                        )}
                        {advisor.annual_revenue && (
                          <div>
                            <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Annual Revenue</h4>
                            <p style={{ color: '#b0bec5', margin: 0 }}>{advisor.annual_revenue}</p>
                          </div>
                        )}
                        {advisor.date_added && (
                          <div>
                            <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Date Added</h4>
                            <p style={{ color: '#b0bec5', margin: 0 }}>{advisor.date_added}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Raw JSON Data */}
        <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '30px', marginTop: '40px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Raw JSON Data
          </h2>
          <pre style={{ background: '#2d3e50', padding: '20px', borderRadius: '8px', overflow: 'auto', maxHeight: '400px', fontSize: '0.85rem', lineHeight: '1.6' }}>
            {JSON.stringify(data.slice(0, 5), null, 2)}
          </pre>
          <p style={{ color: '#b0bec5', marginTop: '12px', fontSize: '0.9rem' }}>
            Showing first 5 of {data.length} advisors. Full data available in <code style={{ background: '#2d3e50', padding: '2px 8px', borderRadius: '4px' }}>public/mart_advisors.json</code>
          </p>
        </div>
      </div>
    </div>
  );
}

