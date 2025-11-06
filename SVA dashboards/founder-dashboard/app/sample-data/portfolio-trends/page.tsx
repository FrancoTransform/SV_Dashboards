'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import portfolioData from '@/public/mart_portfolio_trends.json';

export default function PortfolioTrendsSampleData() {
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  const getRiskColor = (riskFactors: string[]) => {
    if (riskFactors.length >= 3) return { bg: '#ff6b6b', label: 'High Risk' };
    if (riskFactors.length === 2) return { bg: '#ffd93d', label: 'Medium Risk' };
    return { bg: '#6bcf7f', label: 'Low Risk' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#2d3e50', color: '#fff', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <Link href="/portfolio-trends" style={{ color: '#4dd0e1', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Portfolio Trends Dashboard
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '20px', marginBottom: '10px' }}>
            Portfolio Trends Sample Data
          </h1>
          <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
            Explore the raw data powering the Portfolio Trends dashboard
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
              <div style={{ color: '#4dd0e1', fontSize: '2rem', fontWeight: 700 }}>{portfolioData.length}</div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Sectors Tracked</div>
            </div>
            <div>
              <div style={{ color: '#4dd0e1', fontSize: '2rem', fontWeight: 700 }}>
                {portfolioData.reduce((sum, s) => sum + s.total_companies, 0)}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Total Companies</div>
            </div>
            <div>
              <div style={{ color: '#4dd0e1', fontSize: '2rem', fontWeight: 700 }}>
                ${(portfolioData.reduce((sum, s) => sum + s.total_funding_usd, 0) / 1000000).toFixed(1)}M
              </div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Total Funding</div>
            </div>
          </div>
        </div>

        {/* Sector Cards */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Sectors</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {portfolioData.map((sector) => {
              const risk = getRiskColor(sector.risk_factors);
              return (
                <div
                  key={sector.sector}
                  style={{
                    background: '#3a4f63',
                    borderRadius: '12px',
                    padding: '25px',
                    border: '1px solid #4a5f73',
                    cursor: 'pointer'
                  }}
                  onClick={() => setExpandedSector(expandedSector === sector.sector ? null : sector.sector)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{sector.sector}</h3>
                    <div style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: risk.bg,
                      color: '#ffffff'
                    }}>
                      {risk.label}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Companies</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{sector.total_companies}</div>
                    </div>
                    <div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Success Rate</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{sector.success_rate_pct}%</div>
                    </div>
                    <div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Avg Revenue Growth</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{sector.avg_revenue_growth_pct}%</div>
                    </div>
                    <div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Total Funding</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        ${(sector.total_funding_usd / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>

                  {expandedSector === sector.sector && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #4a5f73' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Investment Thesis</h4>
                      <p style={{ color: '#ddd', marginBottom: '15px' }}>{sector.investment_thesis}</p>

                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Risk Factors</h4>
                      <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                        {sector.risk_factors.map((risk, idx) => (
                          <li key={idx} style={{ marginBottom: '8px', color: '#ddd' }}>{risk}</li>
                        ))}
                      </ul>

                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Top Performers</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                        {sector.top_performers.map((company) => (
                          <span
                            key={company}
                            style={{
                              padding: '4px 12px',
                              background: '#4dd0e1',
                              color: '#2d3e50',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: 600
                            }}
                          >
                            {company}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Market Traction</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{sector.market_traction_score}/10</div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Product Readiness</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{sector.product_readiness_score}/10</div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Team Strength</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{sector.team_strength_score}/10</div>
                        </div>
                        <div>
                          <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Pilot Conversion</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{sector.pilot_conversion_rate_pct}%</div>
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
            {JSON.stringify(portfolioData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

