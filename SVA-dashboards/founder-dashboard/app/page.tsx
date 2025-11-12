'use client';

export default function DashboardIndex() {
  const dashboards = [
    {
      title: 'Founder Success Dashboard',
      description: 'Track accelerator performance and portfolio company growth across key metrics including revenue growth, funding, pilots, partnerships, and founder satisfaction.',
      href: '/founder-success',
      icon: '🚀',
    },
    {
      title: 'Partner ROI Dashboard',
      description: 'Measure corporate partner engagement and return on investment through intro quality, conversion rates, and partnership outcomes.',
      href: '/partner-roi',
      icon: '🤝',
    },
    {
      title: 'Cycle Snapshot',
      description: 'Get a comprehensive overview of each accelerator cycle including cohort composition, funding metrics, and program performance.',
      href: '/cycle-snapshot',
      icon: '📊',
    },
    {
      title: 'Portfolio Trends Tracker',
      description: 'Analyze portfolio-wide trends over time including funding trajectories, sector performance, and growth patterns.',
      href: '/portfolio-trends',
      icon: '📈',
    },
    {
      title: 'Operational Health Dashboard',
      description: 'Monitor operational metrics including application volume, acceptance rates, source quality, and commercial validation scores.',
      href: '/operational-health',
      icon: '⚡',
    },
    {
      title: 'Applications Dashboard',
      description: 'Review application pipeline across cohorts with insights into applicant demographics, sectors, and selection outcomes.',
      href: '/applications',
      icon: '📝',
    },
    {
      title: 'Advisory Board Dashboard',
      description: 'Explore the advisory board network including expertise areas, engagement levels, and contribution metrics.',
      href: '/advisors',
      icon: '👥',
    },
  ];

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
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16" style={{ background: '#3a4f63' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-cyan-400 text-sm font-medium mb-3">SemperVirens Venture Capital</p>
          <h1 className="text-5xl font-bold text-white mb-4">
            Analytics <span className="text-cyan-400">Dashboard Suite</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive insights into accelerator performance, portfolio companies, corporate partners, and operational metrics
          </p>
        </div>
      </section>

      {/* Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <a
              key={dashboard.href}
              href={dashboard.href}
              className="group rounded-lg shadow-lg p-6 border transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: '#3a4f63',
                borderColor: '#4a5f73',
              }}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {dashboard.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {dashboard.title}
                  </h2>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {dashboard.description}
                  </p>
                  <div className="mt-4 flex items-center text-cyan-400 text-sm font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>View Dashboard</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12" style={{ borderColor: '#4a5f73', background: '#2d3e50' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-400 text-center">
            SemperVirens Accelerator · Analytics Dashboard Suite · 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
