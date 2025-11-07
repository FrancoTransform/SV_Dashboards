'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import data from '../../public/mart_advisors.json';

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

export default function AdvisorsPage() {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Get unique roles and locations for filters
  const roles = useMemo(() => {
    const uniqueRoles = Array.from(new Set(data.map((a: Advisor) => a.role)));
    return ['All', ...uniqueRoles.sort()];
  }, []);

  const locations = useMemo(() => {
    const uniqueLocations = Array.from(new Set(data.map((a: Advisor) => a.location)));
    return ['All', ...uniqueLocations.sort()];
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((advisor: Advisor) => {
      const roleMatch = selectedRole === 'All' || advisor.role === selectedRole;
      const locationMatch = selectedLocation === 'All' || advisor.location === selectedLocation;
      return roleMatch && locationMatch;
    });
  }, [selectedRole, selectedLocation]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalAdvisors = filteredData.length;
    const hrVentureAdvisors = filteredData.filter((a: Advisor) => a.role === 'HR Venture Advisor').length;
    const executiveAdvisors = filteredData.filter((a: Advisor) => a.role === 'Executive Advisor' || a.role === 'Exec Advisor').length;
    const insightsAdvisors = filteredData.filter((a: Advisor) => a.role === 'Insights Advisor').length;
    const portcoConnections = filteredData.filter((a: Advisor) => a.portco_advisor).length;
    const femaleAdvisors = filteredData.filter((a: Advisor) => a.female).length;

    return {
      totalAdvisors,
      hrVentureAdvisors,
      executiveAdvisors,
      insightsAdvisors,
      portcoConnections,
      femaleAdvisors,
    };
  }, [filteredData]);

  // Role distribution for chart
  const roleDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredData.forEach((a: Advisor) => {
      counts[a.role] = (counts[a.role] || 0) + 1;
    });
    return Object.entries(counts).map(([role, count]) => ({ role, count }));
  }, [filteredData]);

  // Location distribution for chart
  const locationDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredData.forEach((a: Advisor) => {
      counts[a.location] = (counts[a.location] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData]);

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
            <div className="relative group">
              <button className="text-white text-sm font-medium hover:text-cyan-400 transition-colors flex items-center space-x-1">
                <span>Dashboards</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" style={{ background: '#3a4f63', border: '1px solid #4a5f73' }}>
                <a href="/" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors rounded-t-lg">
                  Founder Success Dashboard
                </a>
                <a href="/partner-roi" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Partner ROI Dashboard
                </a>
                <a href="/cycle-snapshot" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Cycle Snapshot
                </a>
                <a href="/portfolio-trends" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Portfolio Trends Tracker
                </a>
                <a href="/operational-health" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Operational Health Dashboard
                </a>
                <a href="/applications" className="block px-4 py-3 text-sm text-white hover:bg-cyan-900 hover:text-cyan-400 transition-colors">
                  Applications Dashboard
                </a>
                <a href="/advisors" className="block px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-900 transition-colors rounded-b-lg font-semibold">
                  Advisory Board Dashboard
                </a>
              </div>
            </div>
            <a
              href="/sample-data/advisors"
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: '#4dd0e1', color: '#2d3e50' }}
            >
              View Data
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', color: '#fff' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
            Advisory Board Dashboard
          </h1>
          <p style={{ color: '#b0bec5', marginTop: '8px' }}>
            Manage and track SemperVirens advisor network, expertise, and portfolio company connections
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#b0bec5' }}>
              Filter by Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                width: '100%',
                background: '#3a4f63',
                color: '#fff',
                border: '1px solid #4a5f73',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#b0bec5' }}>
              Filter by Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: '100%',
                background: '#3a4f63',
                color: '#fff',
                border: '1px solid #4a5f73',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Advisors</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.totalAdvisors}</div>
          </div>

          <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>HR Venture</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.hrVentureAdvisors}</div>
          </div>

          <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Executive</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.executiveAdvisors}</div>
          </div>

          <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Insights</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.insightsAdvisors}</div>
          </div>

          <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>PortCo Connections</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.portcoConnections}</div>
          </div>

          <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Female Advisors</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4dd0e1' }}>{kpis.femaleAdvisors}</div>
          </div>
        </div>

        {/* Advisors Table */}
        <div style={{ background: '#3a4f63', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Advisor Directory ({filteredData.length})
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #4a5f73' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#b0bec5', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#b0bec5', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#b0bec5', textTransform: 'uppercase' }}>Company</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#b0bec5', textTransform: 'uppercase' }}>Title</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#b0bec5', textTransform: 'uppercase' }}>Location</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#b0bec5', textTransform: 'uppercase' }}>PortCo</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#b0bec5', textTransform: 'uppercase' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((advisor: Advisor) => (
                  <React.Fragment key={advisor.advisor_uid}>
                    <tr
                      style={{
                        borderBottom: '1px solid #4a5f73',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#4a5f73')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => setExpandedRow(expandedRow === advisor.advisor_uid ? null : advisor.advisor_uid)}
                    >
                      <td style={{ padding: '16px', fontWeight: 600 }}>{advisor.full_name}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#4dd0e1', color: '#2d3e50', whiteSpace: 'nowrap', display: 'inline-block' }}>
                          {advisor.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>{advisor.company}</td>
                      <td style={{ padding: '16px', color: '#b0bec5', fontSize: '0.9rem' }}>{advisor.title.substring(0, 40)}{advisor.title.length > 40 ? '...' : ''}</td>
                      <td style={{ padding: '16px' }}>{advisor.location}</td>
                      <td style={{ padding: '16px' }}>
                        {advisor.portco_advisor && (
                          <span style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600, background: '#c084fc', color: '#fff' }}>
                            ✓
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#4dd0e1', fontSize: '1.2rem' }}>
                        {expandedRow === advisor.advisor_uid ? '▼' : '▶'}
                      </td>
                    </tr>

                    {expandedRow === advisor.advisor_uid && (
                      <tr>
                        <td colSpan={7} style={{ padding: '20px', background: '#2d3e50' }}>
                          <div style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
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
                              <div>
                                <h4 style={{ color: '#4dd0e1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Date Added</h4>
                                <p style={{ color: '#b0bec5', margin: 0 }}>{advisor.date_added || 'N/A'}</p>
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
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

