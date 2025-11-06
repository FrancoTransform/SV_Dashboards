# SemperVirens Accelerator Dashboards — Example Pack

This CLAUDE.md contains everything needed to vibe-code the **SemperVirens Accelerator Dashboards** using sample data that mirrors your accelerator. It includes data dictionaries, CSV links, metric definitions, SQL/JSON snippets, and a lightweight build plan.

## Dashboards

1. **Founder Success Dashboard** - Tracking accelerator performance and portfolio company growth
2. **Partner ROI Dashboard** - Measuring commercial value and innovation impact for corporate partners
3. **Cycle Snapshot** - Key stats and highlights for each cohort (public/marketing)
4. **Portfolio Trends Tracker** - Analyzing which sectors and models are performing best (investment/strategy)
5. **Operational Health Dashboard** - Monitoring efficiency and resource utilization across cycles (platform/ops team)

---

## 0) Quick Start

**Data files**
- [program_cycles.csv](/mnt/data/accelerator_founder_success_example/data/program_cycles.csv)
- [companies.csv](/mnt/data/accelerator_founder_success_example/data/companies.csv)
- [founders.csv](/mnt/data/accelerator_founder_success_example/data/founders.csv)
- [company_progress.csv](/mnt/data/accelerator_founder_success_example/data/company_progress.csv)
- [funding_rounds.csv](/mnt/data/accelerator_founder_success_example/data/funding_rounds.csv)
- [sessions.csv](/mnt/data/accelerator_founder_success_example/data/sessions.csv)

**Goal**
Render a dashboard for one or more cycles showing:
- Top-line KPIs: revenue growth, follow-on funding, pilots, partnerships, founder NPS, attendance, mentor hours
- Company table with drill-through to funding rounds and notes
- Cohort comparisons between ACC-2025-Spring and ACC-2025-Fall
- Narrative summary auto-generated from deltas

---

## 1) Data Dictionary

### program_cycles.csv
- **program_cycle_uid** (PK), **name**, **start_date**, **end_date**

### companies.csv
- **company_uid** (PK), **canonical_name**, **domain**, **sector**, **hq_country**, **stage**, **headcount**, **product_readiness**, **gtm_maturity**, **icp_clarity**, **sales_motion**

### founders.csv
- **founder_uid** (PK), **company_uid** (FK), **name**, **title**, **email_hash** (PII-safe), **demographics** (restricted)

### company_progress.csv (per company per cycle)
- **program_cycle_uid** (FK), **company_uid** (FK), **revenue_growth_pct**, **pilots_initiated**, **partnerships_signed_count**, **follow_on_funding_usd**, **goal_progress_score** (1–5), **founder_nps**, **sessions_attendance_pct**, **mentor_hours**, **notable_outcomes**

### funding_rounds.csv
- **company_uid** (FK), **round_type**, **amount_usd**, **announce_date**, **lead_investor**, **source_system**

### sessions.csv (example event stream)
- **program_cycle_uid**, **company_uid**, **session_id**, **attended** (0/1), **minutes**, **mentor_hours**

---

## 2) Metric Contract (Semantic)

```yaml
metrics:
  - name: founder_success.kpi_topline
    inputs:
      - mart: mart_founder_success
    definitions:
      follow_on_funding_usd: sum(follow_on_funding_usd)
      avg_revenue_growth_pct: avg(revenue_growth_pct)
      pilots_initiated: sum(pilots_initiated)
      partnerships_signed: sum(partnerships_signed_count)
      founder_nps_avg: avg(founder_nps)
      attendance_avg: avg(sessions_attendance_pct)
      mentor_hours_sum: sum(mentor_hours)

  - name: founder_success.company_detail
    dims: [company_uid, canonical_name, sector, stage, program_cycle_uid]
    measures: [revenue_growth_pct, follow_on_funding_usd, pilots_initiated, partnerships_signed_count, founder_nps, sessions_attendance_pct, mentor_hours]
```

---

## 3) Reference SQL (duckdb/bigquery compatible)

### 3.1 Create a simple mart

```sql
with progress as (
  select cp.*,
         c.canonical_name, c.sector, c.stage
  from read_csv_auto('data/company_progress.csv') cp
  left join read_csv_auto('data/companies.csv') c
    on cp.company_uid = c.company_uid
),
funding as (
  select company_uid,
         sum(amount_usd) as follow_on_funding_usd_total
  from read_csv_auto('data/funding_rounds.csv')
  group by 1
)
select
  p.program_cycle_uid,
  p.company_uid,
  p.canonical_name,
  p.sector,
  p.stage,
  p.revenue_growth_pct,
  p.pilots_initiated,
  p.partnerships_signed_count,
  p.follow_on_funding_usd,
  p.founder_nps,
  p.sessions_attendance_pct,
  p.mentor_hours,
  coalesce(f.follow_on_funding_usd_total, 0) as follow_on_funding_usd_lifetime
from progress p
left join funding f using (company_uid);
```

### 3.2 Topline KPIs (by cycle)

```sql
select
  program_cycle_uid,
  avg(revenue_growth_pct) as avg_revenue_growth_pct,
  sum(follow_on_funding_usd) as follow_on_funding_usd,
  sum(pilots_initiated) as pilots_initiated,
  sum(partnerships_signed_count) as partnerships_signed,
  avg(founder_nps) as founder_nps_avg,
  avg(sessions_attendance_pct) as attendance_avg,
  sum(mentor_hours) as mentor_hours_sum
from mart_founder_success
group by 1
order by 1;
```

### 3.3 Cohort delta (Fall vs Spring)

```sql
with kpis as (
  select
    program_cycle_uid,
    avg(revenue_growth_pct) as avg_rev_growth,
    sum(follow_on_funding_usd) as follow_on_funding,
    sum(pilots_initiated) as pilots,
    sum(partnerships_signed_count) as partnerships,
    avg(founder_nps) as nps
  from mart_founder_success
  group by 1
)
select
  k2.program_cycle_uid as cycle,
  (k2.avg_rev_growth - k1.avg_rev_growth) as delta_rev_growth_pct,
  (k2.follow_on_funding - k1.follow_on_funding) as delta_follow_on_usd,
  (k2.pilots - k1.pilots) as delta_pilots,
  (k2.partnerships - k1.partnerships) as delta_partnerships,
  (k2.nps - k1.nps) as delta_nps
from kpis k1
join kpis k2 on k1.program_cycle_uid = 'ACC-2025-Spring' and k2.program_cycle_uid = 'ACC-2025-Fall';
```

---

## 4) Narrative Generation (pseudo)

```python
def narrative_from_kpis(delta):
    lines = []
    if delta['delta_rev_growth_pct'] is not None:
        lines.append(f"Revenue growth changed by {delta['delta_rev_growth_pct']:.1f} pts.")
    if delta['delta_follow_on_usd'] != 0:
        m = delta['delta_follow_on_usd'] / 1_000_000
        lines.append(f"Follow-on funding changed by ${m:.2f}M.")
    if delta['delta_pilots'] != 0:
        lines.append(f"Pilots changed by {delta['delta_pilots']}.")
    if delta['delta_partnerships'] != 0:
        lines.append(f"Partnerships changed by {delta['delta_partnerships']}.")
    if delta['delta_nps'] != 0:
        lines.append(f"Founder NPS changed by {delta['delta_nps']:.1f}.")
    return " ".join(lines) or "Stable performance across cohorts."
```

---

## 5) UX Spec (One-page Dashboard)

**Header**
- Cycle filter (multi-select), Sector filter, Stage filter
- KPI tiles: Avg Rev Growth, Follow-on Funding, Pilots, Partnerships, Founder NPS, Attendance, Mentor Hours

**Charts**
- Bar: KPIs by company (sorted by follow-on funding)
- Line: Rev growth by sector (cycle overlay)
- Stacked bar: Pilots and partnerships by company
- Table: Company detail with drill to funding rounds and 'notable_outcomes'

**Narrative panel**
- Auto-summarized deltas vs prior cohort with plain language

Here is tactical design guidance  to closely match the SemperVirens Venture Capital homepage style:

Fonts

Use a clean, geometric sans-serif font family throughout. Preference: "Montserrat", "Helvetica Neue", Arial, sans-serif for headings and section titles.

Set headings (h1, h2, h3, h4, h5, h6) to bold (font-weight: 700 or 800). Body text should be regular (font-weight: 400 or 500).

Typical sizes:

Main headline: font-size: 2.5rem–3rem;

Subheadings: 1.25rem–1.5rem;

Body: 1rem; line-height: 1.6;

Colors

Background: Pure white (#ffffff) for main sections.

Accent colors: Subtle green for highlights and buttons (#00897b or similar muted green).

Text: Standard dark gray (#222 or #333).

Use light gray (#f5f6fa or similar) for backgrounds behind cards/sections.

Layout

Center major content using max-width and auto margins:

css
.container { max-width: 1100px; margin: 0 auto; }
Generous space between and around sections. Use padding: 60px 0; for main content blocks.

Navigation & Buttons

Navigation: Simple horizontal bar, spaced-out links, font-weight: bold, uppercase, no underline, color same as body text.

Button style:

css
.btn {
  background: #00897b;
  color: #fff;
  border-radius: 6px;
  padding: 12px 32px;
  font-weight: 700;
  border: none;
  transition: background 0.2s;
}
.btn:hover {
  background: #00695c;
}
Calls-to-action (e.g., Portfolio, Explore Now): Large, prominent, rounded corners.

Section Styles

Headings use all-caps or at least uppercase letter-spacing:

css
h2, h3 { text-transform: uppercase; letter-spacing: 2px; }
Divider lines between sections are thin, light gray.

Imagery

Use images with plenty of whitespace and modern, aspirational subject matter (buildings, plants, teams).

Logo: monochrome, preferably white on color or color on white.

Cards/Blocks

Use shadowed or softly bordered cards for segments like “Our Approach”, “Portfolio”, or “Impact”:

css
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(40,50,60,0.07);
  padding: 32px;
  margin-bottom: 32px;
}
Miscellaneous

Ensure everything feels very clean and breathable, with clear separation between content blocks.

Footer: small type, muted gray, links spaced out.

Summary Sample CSS Snippet

css
body { font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif; color: #222; background: #fff; }
h1, h2, h3, h4 { font-weight: 800; text-transform: uppercase; color: #222; letter-spacing: 2px; }
a { color: #00897b; text-decoration: none; font-weight: 700; }
nav { background: #fff; padding: 20px 0; }
.btn { background: #00897b; color: #fff; border-radius: 6px; padding: 12px 32px; font-weight: 700; border: none; }
section { padding: 60px 0; }
.card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(40,50,60,0.07); padding: 32px; margin-bottom: 32px; }
footer { color: #aaa; font-size: 0.9rem; padding: 20px 0; }
Give this guidance and these starter styles to your developer for a strong match with this site's look and feel.​



---

## 6) React (Next.js) sketch (client-only pseudocode)

```tsx
// components/FounderSuccess.tsx
import React, { useMemo, useState } from 'react';
import data from '../public/mart_founder_success.json';

export default function FounderSuccess() {
  const [cycles, setCycles] = useState<string[]>(['ACC-2025-Spring','ACC-2025-Fall']);
  const rows = useMemo(() => data.filter((r:any) => cycles.includes(r.program_cycle_uid)), [cycles]);
  // compute KPIs + narrative...
  return (
    <div className="p-6 space-y-6">
      <header className="grid grid-cols-4 gap-4">
        {/* Filters + KPI tiles */}
      </header>
      <section className="grid grid-cols-2 gap-6">
        {/* Charts (e.g., Recharts) */}
      </section>
      <section>
        {/* Table with drill-down */}
      </section>
      <aside className="prose">
        {/* Narrative text */}
      </aside>
    </div>
  );
}
```

---

## 7) Data to JSON for the app

Export the mart to JSON and place at `public/mart_founder_success.json`.

Example record:
```json
{
  "program_cycle_uid": "ACC-2025-Spring",
  "company_uid": "C-NOVA",
  "canonical_name": "NovaPayroll",
  "sector": "FinTech",
  "stage": "Seed",
  "revenue_growth_pct": 55,
  "pilots_initiated": 2,
  "partnerships_signed_count": 2,
  "follow_on_funding_usd": 1500000,
  "founder_nps": 76,
  "sessions_attendance_pct": 83,
  "mentor_hours": 20
}
```

---

## 8) Validation Checklist

- [ ] Cycle totals match KPI tiles
- [ ] Deliberate handling for companies with zero funding
- [ ] Attendance and NPS use averages, not sums
- [ ] Narrative only mentions meaningful movements
- [ ] PII: surfaces founder names only in restricted views

---

## 9) Extension Ideas

- Add lifetime funding and revenue milestones per company
- Add readiness → outcomes scatter plot
- Push partner pilot statuses into detail drawer
- Add export to PDF with cycle header + narrative

---

## 10) Implementation Status

**Status**: ✅ COMPLETE

**Implementation Date**: 2025-11-04

### What Was Built

A fully functional Next.js 16 dashboard application with the following features:

#### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom SemperVirens branding
- **Charts**: Recharts
- **Font**: Montserrat (Google Fonts)

#### Project Structure
```
founder-dashboard/
├── app/
│   ├── layout.tsx          # Root layout with Montserrat font
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles with SV branding
├── components/
│   ├── KPITile.tsx         # Reusable KPI metric tile
│   ├── CompanyTable.tsx    # Interactive company table with drill-down
│   └── Charts.tsx          # Three chart components (Funding, Revenue, Pilots/Partnerships)
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   └── dataUtils.ts        # KPI computation and narrative generation
└── public/
    └── mart_founder_success.json  # Sample data
```

#### Features Implemented

1. **Filters** (Multi-select)
   - Program Cycle (ACC-2025-Spring, ACC-2025-Fall)
   - Sector (HRTech, HealthTech, FinTech, Workforce Dev, Productivity)
   - Stage (Seed, Pre-Seed)

2. **KPI Tiles** (7 metrics)
   - Avg Revenue Growth: 30.8%
   - Follow-on Funding: $3.05M
   - Pilots: 9
   - Partnerships: 5
   - Founder NPS: 67
   - Attendance: 85.8%
   - Mentor Hours: 107

3. **Cohort Comparison Narrative**
   - Auto-generated comparison between Spring and Fall cohorts
   - Example: "Revenue growth decreased by 15.0 pts. Follow-on funding decreased by $1.45M..."

4. **Charts**
   - Follow-on Funding by Company (Bar chart)
   - Avg Revenue Growth by Sector (Bar chart)
   - Pilots & Partnerships by Company (Stacked bar chart)

5. **Company Table**
   - Sortable by funding (descending)
   - Click to expand for detailed view
   - Shows: Company, Sector, Stage, Rev Growth, Funding, Pilots, Partnerships, NPS
   - Expanded view includes: Notable Outcomes, Attendance, Mentor Hours, Goal Progress

#### Design System

Follows SemperVirens brand guidelines:
- **Colors**:
  - Accent: `#00897b` (muted green)
  - Accent Dark: `#00695c`
  - Background: `#ffffff`
  - Text: `#222222`
- **Typography**: Montserrat (400, 500, 700, 800 weights)
- **Style**: Clean, modern, professional with generous whitespace
- **Components**: Rounded corners (12px), subtle shadows, uppercase headings

### Running the Application

```bash
cd founder-dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Validation Results

- [x] Cycle totals match KPI tiles
- [x] Deliberate handling for companies with zero funding
- [x] Attendance and NPS use averages, not sums
- [x] Narrative only mentions meaningful movements
- [x] PII: surfaces founder names only in restricted views (not implemented in current version)

### Design Updates (2025-11-05)

Updated the dashboard to match the SemperVirens homepage design:
- **Dark Theme**: Changed from light theme to dark blue-gray background (#2d3e50)
- **Color Palette**:
  - Primary background: #2d3e50
  - Card background: #3a4f63
  - Accent color: #4dd0e1 (cyan)
  - Purple accent: #7b2d8e
  - Border color: #4a5f73
- **Typography**: White text on dark backgrounds with cyan highlights
- **Logo**: Added SemperVirens white logo to header
- **Navigation**: Simplified to single "Sample Data" link
- **Removed**: Purple announcement banner and full navigation menu

### Sample Data Page

Created a new `/sample-data` route that displays:
- Data overview with total companies, program cycles, and records
- Expandable company cards grouped by program cycle
- Detailed metrics for each company (click to expand)
- Raw JSON data viewer at the bottom
- Consistent dark theme styling matching the main dashboard

### Data Architecture Alignment (2025-11-05)

Updated all dashboards to align with the Accelerator Data Architecture PDF specification:

#### **Founder Success Dashboard** - Added Fields:
- **Product readiness** (MVP, beta, GA)
- **GTM maturity** (Early, Established, Scaling)
- **ICP clarity** (Exploring, Developing, Clear)
- **Sales motion** (Founder-led, Product-led, Sales-led, Partnership-led, etc.)
- **Advisor relationships formed** (count)

These fields are now displayed in the expanded company detail view, organized into:
- Product & GTM Readiness section (4 fields)
- Engagement Metrics section (includes advisor relationships)

#### **Partner ROI Dashboard** - Added Fields:
- **BU focus** (e.g., "MetLife Ventures", "ADP Marketplace")
- **Primary contact** (name and title)
- **Participation type** (multi-select: Education Session, AMA, Pilot Partner, Investor)
- **Sessions attended** (count)
- **Founders met/evaluated** (count)
- **Investments made into portcos** (count)
- **Integrations completed** (count)
- **Repeat engagement** (frequency: Quarterly, Bi-annual, Annual)
- **Thematic interest** (multi-select: AI in Healthcare, FinTech Innovation, etc.)

These fields are now displayed in the expanded partner detail view, organized into:
- Partner Details section (BU focus, primary contact, repeat engagement, investments)
- Participation section (sessions, founders met, integrations, participation types)
- Thematic Interests section (visual tags for interest areas)
- Performance Metrics section (existing metrics)

#### **Operational Health Dashboard** - Added Metrics:
- **Recruitment**: Application volume, applications accepted, acceptance rate, source quality score
- **Brand Reach**: Media mentions, co-marketing outputs, press releases
- **Follow-on Readiness**: Commercial validation score, capital efficiency score, market positioning score

These metrics are now displayed in a new "Recruitment & Sourcing" section with 4 cards:
- Application Volume card (total, accepted, acceptance rate)
- Source Quality Score card
- Brand Reach card (media, co-marketing, press releases)
- Follow-on Readiness card (commercial, capital efficiency, market positioning)

### Known Limitations

1. **Data Source**: Currently uses static JSON file. For production, connect to live data source.
2. **PII Protection**: Founder names are not currently displayed (as per spec).
3. **Export**: PDF export feature not yet implemented (extension idea).
4. **Responsive**: Optimized for desktop; mobile experience could be enhanced.

### Next Steps / Extension Ideas

- [ ] Connect to live data API instead of static JSON
- [ ] Add PDF export functionality
- [ ] Implement readiness → outcomes scatter plot
- [ ] Add lifetime funding and revenue milestones per company
- [ ] Push partner pilot statuses into detail drawer
- [ ] Add authentication and role-based access control
- [ ] Implement real-time data updates
- [ ] Add more granular date range filters
- [ ] Create admin panel for data management

---

## 11) Partner ROI Dashboard

**Status**: ✅ COMPLETE

**Implementation Date**: 2025-11-05

### Overview

A fully functional Partner ROI Dashboard that measures commercial value and innovation impact for corporate partners. Built with the same tech stack and design system as the Founder Success Dashboard.

### Data Structure

#### Partner Data Files

**partners.csv**
- **partner_uid** (PK), **partner_name**, **industry**, **company_size**, **engagement_start_date**, **partnership_tier**, **primary_contact_title**

**partner_engagements.csv**
- **partner_uid** (FK), **company_uid** (FK), **engagement_type**, **start_date**, **status**, **commercial_value_usd**, **innovation_score**, **pilot_success**, **deployment_timeline_months**, **partner_satisfaction_score**, **strategic_alignment_score**

**partner_metrics.csv** (quarterly metrics)
- **partner_uid** (FK), **quarter**, **total_engagements**, **active_pilots**, **completed_pilots**, **total_commercial_value_usd**, **avg_innovation_score**, **time_to_pilot_days**, **cost_savings_usd**, **new_capabilities_gained**, **employee_engagement_hours**, **patents_filed**, **market_insights_gained**

#### Data Mart

**mart_partner_roi.json** - Denormalized partner data combining all metrics:
```json
{
  "partner_uid": "P-ACME",
  "partner_name": "Acme Healthcare Systems",
  "industry": "Healthcare",
  "company_size": "Enterprise",
  "partnership_tier": "Platinum",
  "quarter": "2024-Q2",
  "total_engagements": 2,
  "active_pilots": 1,
  "completed_pilots": 1,
  "total_commercial_value_usd": 400000,
  "avg_innovation_score": 7.5,
  "time_to_pilot_days": 38,
  "cost_savings_usd": 180000,
  "new_capabilities_gained": 2,
  "employee_engagement_hours": 280,
  "patents_filed": 0,
  "market_insights_gained": 4,
  "partner_satisfaction_score": 82,
  "strategic_alignment_score": 8.5,
  "roi_multiple": 2.45
}
```

### Features Implemented

1. **Filters** (Multi-select)
   - Industry (Healthcare, Financial Services, Technology, Retail, Energy)
   - Partnership Tier (Platinum, Gold, Silver)
   - Company Size (Enterprise, Mid-Market)

2. **KPI Tiles** (8 metrics)
   - Total Commercial Value: $1.70M
   - Avg ROI Multiple: 2.53x
   - Active Pilots: 6
   - Completed Pilots: 2
   - Avg Cost Savings: $140K
   - Innovation Score: 7.8/10
   - Partner Satisfaction: 83/100
   - Time to Pilot: 43 days

3. **Partner Value Summary**
   - Auto-generated narrative describing ROI, commercial value, cost savings, pilots, capabilities, and patents

4. **Charts**
   - ROI Multiple by Partner (Bar chart)
   - Innovation & Satisfaction Scores (Grouped bar chart)
   - Pilot Engagements by Partner (Stacked bar chart)

5. **Partner Table**
   - Sortable by commercial value (descending)
   - Click to expand for detailed view
   - Shows: Partner, Industry, Tier, Commercial Value, ROI, Active Pilots, Innovation Score, Satisfaction
   - Expanded view includes: Cost Savings, Completed Pilots, Time to Pilot, Strategic Alignment, New Capabilities, Employee Hours, Patents Filed, Market Insights

### Navigation

- **Dashboard Dropdown Menu**: Top-right navigation allows switching between:
  - Founder Success Dashboard
  - Partner ROI Dashboard

- **Sample Data Links**: Each dashboard has a "View Sample Data" button in the hero section that links to:
  - `/sample-data/founder-success` for Founder Success Dashboard
  - `/sample-data/partner-roi` for Partner ROI Dashboard

### File Structure

```
founder-dashboard/
├── app/
│   ├── partner-roi/
│   │   └── page.tsx              # Partner ROI dashboard page
│   ├── sample-data/
│   │   ├── founder-success/
│   │   │   └── page.tsx          # Founder Success sample data page
│   │   └── partner-roi/
│   │       └── page.tsx          # Partner ROI sample data page
│   └── page.tsx                  # Founder Success dashboard (updated with dropdown)
├── components/
│   ├── PartnerCharts.tsx         # Partner ROI charts
│   └── PartnerTable.tsx          # Partner table with drill-down
├── lib/
│   ├── partnerTypes.ts           # TypeScript interfaces for partner data
│   └── partnerUtils.ts           # KPI computation and utilities
└── public/
    └── mart_partner_roi.json     # Partner data mart
```

### Sample Data

The Partner ROI dashboard includes data for 5 corporate partners:
- **Acme Healthcare Systems** (Healthcare, Platinum)
- **NovaBank Financial** (Financial Services, Gold)
- **TechCorp Industries** (Technology, Silver)
- **RetailMax Group** (Retail, Platinum)
- **EnergyFlow Solutions** (Energy, Gold)

### Validation Results

- [x] KPI calculations are accurate
- [x] Filters work correctly across all dimensions
- [x] Charts display partner data appropriately
- [x] Partner table expands to show detailed metrics
- [x] Navigation between dashboards works seamlessly
- [x] Sample data pages display all partner information
- [x] Design matches SemperVirens brand guidelines

### Next Steps / Extension Ideas

- [ ] Add time-series analysis showing partner ROI trends over multiple quarters
- [ ] Implement partner comparison tool (side-by-side comparison)
- [ ] Add engagement pipeline visualization
- [ ] Create partner-specific reports with PDF export
- [ ] Add predictive analytics for ROI forecasting
- [ ] Implement partner segmentation analysis
- [ ] Add integration with CRM systems for real-time data

---

## 12) Cycle Snapshot Dashboard

**Status**: ✅ COMPLETE

**Implementation Date**: 2025-11-05

### Overview

A public-facing dashboard showcasing key stats and highlights for each cohort. Designed for marketing and external communications.

### Data Structure

**mart_cycle_snapshot.json** - Cohort-level metrics:
```json
{
  "program_cycle_uid": "ACC-2025-Spring",
  "cycle_name": "Spring 2025 Cohort",
  "start_date": "2025-01-15",
  "end_date": "2025-04-15",
  "status": "Completed",
  "total_companies": 3,
  "total_founders": 8,
  "avg_revenue_growth_pct": 45.8,
  "total_funding_raised_usd": 2500000,
  "total_pilots": 5,
  "total_partnerships": 3,
  "avg_founder_nps": 75,
  "graduation_rate_pct": 100,
  "job_creation": 12,
  "sectors_represented": ["HRTech", "HealthTech", "FinTech"],
  "top_achievements": [...],
  "media_mentions": 8,
  "demo_day_attendance": 150,
  "investor_connections": 45
}
```

### Features

- **Cycle Selector**: Choose from 3 cohorts (Spring 2025, Fall 2025, Fall 2024)
- **Status Indicators**: Visual badges for Completed/In Progress status
- **8 KPI Tiles**: Revenue growth, funding, pilots, partnerships, NPS, jobs, media, investors
- **Top Achievements**: Numbered list of major milestones
- **Sector Tags**: Visual representation of industries covered
- **Additional Stats**: Graduation rate, demo day attendance, mentor hours

---

## 13) Portfolio Trends Tracker Dashboard

**Status**: ✅ COMPLETE

**Implementation Date**: 2025-11-05

### Overview

An investment strategy dashboard analyzing sector performance, funding trends, and portfolio health metrics.

### Data Structure

**mart_portfolio_trends.json** - Sector-level analytics:
```json
{
  "sector": "FinTech",
  "total_companies": 3,
  "avg_revenue_growth_pct": 48.5,
  "total_funding_usd": 3200000,
  "avg_valuation_usd": 8500000,
  "success_rate_pct": 85,
  "avg_time_to_funding_days": 45,
  "pilot_conversion_rate_pct": 75,
  "partnership_rate_pct": 67,
  "market_traction_score": 8.2,
  "product_readiness_score": 8.5,
  "team_strength_score": 8.0,
  "investment_thesis": "...",
  "risk_factors": [...],
  "top_performers": [...]
}
```

### Features

- **Portfolio Overview**: 4 aggregate KPIs across all sectors
- **4 Charts**:
  - Sector Performance (success rate & revenue growth)
  - Funding & Valuation by Sector
  - Conversion Metrics (pilots & partnerships)
  - Sector Strength Radar (market, product, team)
- **Sector Cards**: Expandable cards showing:
  - Risk level badges (Low/Medium/High)
  - Performance ratings (Excellent/Strong/Good/Fair)
  - Investment thesis
  - Risk factors
  - Top performing companies
  - Detailed scores (market traction, product readiness, team strength)

---

## 14) Operational Health Dashboard

**Status**: ✅ COMPLETE

**Implementation Date**: 2025-11-05

### Overview

An internal operations dashboard monitoring efficiency, budget utilization, and resource allocation across program cycles.

### Data Structure

**mart_operational_health.json** - Operational metrics per cycle:
```json
{
  "program_cycle_uid": "ACC-2025-Spring",
  "operational_efficiency_score": 8.5,
  "budget_utilization_pct": 92,
  "budget_allocated_usd": 250000,
  "budget_spent_usd": 230000,
  "cost_per_company_usd": 76667,
  "mentor_utilization_rate_pct": 85,
  "session_completion_rate_pct": 95,
  "avg_attendance_rate_pct": 88,
  "platform_uptime_pct": 99.5,
  "curriculum_completion_rate_pct": 92,
  "roi_on_investment": 10.9
}
```

### Features

- **Overall Performance**: 4 aggregate KPIs (efficiency, budget util, ROI, mentor hours)
- **Cycle Selector**: Choose cycle with efficiency rating badges
- **Detailed Metrics Cards**:
  - Budget (allocated, spent, remaining)
  - Sessions (planned, completed, attendance)
  - Mentorship (hours, utilization)
- **4 Trend Charts**:
  - Budget Utilization by Cycle
  - Efficiency Trends (efficiency, session completion, attendance)
  - Mentor Utilization
  - ROI Comparison
- **Additional Metrics**: Platform uptime, support resolution time, curriculum completion, milestone achievement

---

**Generated**: 2025-11-04
**Last Updated**: 2025-11-05
