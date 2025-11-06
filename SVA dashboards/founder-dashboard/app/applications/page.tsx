'use client';

import React, { useState, useMemo } from 'react';
import KPITile from '../../components/KPITile';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
}

export default function ApplicationsPage() {
  const [data] = useState<Application[]>(require('../../public/mart_applications.json'));
  const [selectedCohort, setSelectedCohort] = useState<string>('Cohort 1');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Filter data by cohort
  const filteredData = useMemo(() => {
    return data.filter(app => app.cohort === selectedCohort);
  }, [data, selectedCohort]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = filteredData.length;
    const passed = filteredData.filter(a => a.application_status === 'PASSED').length;
    const fundraising = filteredData.filter(a => a.currently_fundraising).length;
    const avgYear = filteredData.filter(a => a.year_founded).reduce((sum, a) => sum + (a.year_founded || 0), 0) / filteredData.filter(a => a.year_founded).length;
    
    return {
      totalApplications: total,
      applicationsPassed: passed,
      acceptanceRate: total > 0 ? (passed / total * 100) : 0,
      currentlyFundraising: fundraising,
      fundraisingRate: total > 0 ? (fundraising / total * 100) : 0,
      avgCompanyAge: new Date().getFullYear() - Math.round(avgYear),
    };
  }, [filteredData]);

  // Year founded distribution
  const yearData = useMemo(() => {
    const counts: { [key: number]: number } = {};
    filteredData.forEach(app => {
      if (app.year_founded) {
        counts[app.year_founded] = (counts[app.year_founded] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => b.year - a.year)
      .slice(0, 10);
  }, [filteredData]);

  // Referral sources
  const referralData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredData.forEach(app => {
      const source = app.referral_source.substring(0, 30);
      counts[source] = (counts[source] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredData]);

  // Fundraising pie chart
  const fundraisingData = [
    { name: 'Fundraising', value: kpis.currentlyFundraising },
    { name: 'Not Fundraising', value: kpis.totalApplications - kpis.currentlyFundraising },
  ];

  const COLORS = ['#4dd0e1', '#c084fc'];

  return (
    <div style={{ background: '#2d3e50', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <header style={{ background: '#1a2332', padding: '20px 40px', borderBottom: '1px solid #4a5f73' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#fff' }}>APPLICATIONS DASHBOARD</h1>
            <p style={{ margin: '8px 0 0 0', color: '#b0bec5' }}>Recruitment Funnel & Application Analytics</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="/" style={{ color: '#4dd0e1', textDecoration: 'none', fontWeight: 600 }}>Dashboards</a>
            <a
              href="/sample-data/applications"
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: '#4dd0e1', color: '#2d3e50' }}
            >
              View Data
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {/* Cohort Tabs */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #4a5f73', paddingBottom: '0' }}>
            <button
              onClick={() => setSelectedCohort('Cohort 1')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: selectedCohort === 'Cohort 1' ? '#4dd0e1' : 'transparent',
                color: selectedCohort === 'Cohort 1' ? '#2d3e50' : '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Cohort 1
            </button>
            <button
              onClick={() => setSelectedCohort('Cohort 2')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: selectedCohort === 'Cohort 2' ? '#4dd0e1' : 'transparent',
                color: selectedCohort === 'Cohort 2' ? '#2d3e50' : '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Cohort 2
            </button>
          </div>
        </section>

        {/* KPI Tiles */}
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', color: '#4dd0e1', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {selectedCohort} Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Applications</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.totalApplications}</div>
            </div>
            <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Applications Passed</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.applicationsPassed}</div>
            </div>
            <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Acceptance Rate</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.acceptanceRate.toFixed(1)}%</div>
            </div>
            <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Currently Fundraising</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.currentlyFundraising}</div>
            </div>
            <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Fundraising Rate</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.fundraisingRate.toFixed(1)}%</div>
            </div>
            <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Company Age</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{isNaN(kpis.avgCompanyAge) ? 'N/A' : `${kpis.avgCompanyAge} yrs`}</div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {/* Year Founded Distribution */}
          <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#4dd0e1' }}>Applications by Year Founded</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
                <XAxis dataKey="year" stroke="#b0bec5" />
                <YAxis stroke="#b0bec5" />
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #4a5f73', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#4dd0e1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Referral Sources */}
          <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#4dd0e1' }}>Top Referral Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={referralData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5f73" />
                <XAxis type="number" stroke="#b0bec5" />
                <YAxis dataKey="source" type="category" stroke="#b0bec5" width={150} />
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #4a5f73', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#c084fc" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fundraising Status */}
          <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#4dd0e1' }}>Fundraising Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fundraisingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fundraisingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #4a5f73', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Applications Table */}
        <section style={{ background: '#3a4f63', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#4dd0e1' }}>Applications ({filteredData.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #4a5f73' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#4dd0e1', fontWeight: 700 }}>Company</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#4dd0e1', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#4dd0e1', fontWeight: 700 }}>Year Founded</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#4dd0e1', fontWeight: 700 }}>Fundraising</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#4dd0e1', fontWeight: 700 }}>Referral Source</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#4dd0e1', fontWeight: 700 }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((app) => (
                  <React.Fragment key={app.application_uid}>
                    <tr style={{ borderBottom: '1px solid #4a5f73', cursor: 'pointer' }} onClick={() => setExpandedRow(expandedRow === app.application_uid ? null : app.application_uid)}>
                      <td style={{ padding: '12px', color: '#fff' }}>{app.company_name}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: app.application_status === 'PASSED' ? '#4dd0e1' : app.application_status === 'PENDING' ? '#ffa726' : '#ef5350',
                          color: '#fff',
                        }}>
                          {app.application_status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#b0bec5' }}>{app.year_founded || 'N/A'}</td>
                      <td style={{ padding: '12px', color: '#b0bec5' }}>{app.currently_fundraising ? 'Yes' : 'No'}</td>
                      <td style={{ padding: '12px', color: '#b0bec5', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.referral_source.substring(0, 40)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button style={{ background: 'transparent', border: 'none', color: '#4dd0e1', cursor: 'pointer', fontSize: '1.2rem' }}>
                          {expandedRow === app.application_uid ? '▼' : '▶'}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === app.application_uid && (
                      <tr style={{ background: '#2d3e50' }}>
                        <td colSpan={6} style={{ padding: '24px' }}>
                          <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                              <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Company Description</h4>
                              <p style={{ color: '#b0bec5', margin: 0 }}>{app.company_description}</p>
                            </div>
                            <div>
                              <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Problem Statement</h4>
                              <p style={{ color: '#b0bec5', margin: 0 }}>{app.problem_statement}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Target Customer</h4>
                                <p style={{ color: '#b0bec5', margin: 0 }}>{app.target_customer}</p>
                              </div>
                              <div>
                                <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Market Size</h4>
                                <p style={{ color: '#b0bec5', margin: 0 }}>{app.market_size}</p>
                              </div>
                            </div>
                            <div>
                              <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Traction (Last 6 Months)</h4>
                              <p style={{ color: '#b0bec5', margin: 0 }}>{app.traction}</p>
                            </div>
                            <div>
                              <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Runway</h4>
                              <p style={{ color: '#b0bec5', margin: 0 }}>{app.runway_months}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

