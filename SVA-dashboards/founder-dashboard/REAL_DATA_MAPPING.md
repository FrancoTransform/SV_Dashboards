# Real Data Mapping for SVA Dashboards

**Last Updated**: 2025-11-06  
**Status**: ✅ Hybrid Approach Implemented

## Overview

This document maps real SemperVirens Accelerator data to the dashboard examples. We use a **hybrid approach**:
- ✅ **Real company names** from actual portfolio
- ✅ **Real partner names** from GTM intro data
- ✅ **Real intro counts** as engagement metrics
- ⚠️ **Synthetic financial metrics** (for privacy/illustration)

**Disclaimer**: Financial metrics (revenue, funding amounts, NPS scores) shown in dashboards are illustrative examples and do not represent actual company performance.

---

## Data Sources

### Primary Data Files (in `/data` folder)

1. **GTM & Corp Dev Intros PY8.xlsx** (196 intros)
   - Portfolio company names
   - Corporate partner names
   - Intro types and activity counts
   - Used for: Company names, partner names, engagement metrics

2. **SVA Cohort 1 - Scoring.xlsx**
   - Cohort 1 company names
   - Used for: Company selection validation

3. **SVA Applications.xlsx**
   - Application volume data
   - Used for: Operational metrics

---

## Portfolio Companies (Real Names)

### Top Companies by GTM Intro Activity

| Company | Intros | Dashboard | Sector | Notes |
|---------|--------|-----------|--------|-------|
| **Tezi** | 16 | Founder Success | HRTech | Highest intro activity |
| **TrueClaim** | 14 | Founder Success | HealthTech | Strong partner engagement |
| **Second Door** | 13 | Portfolio Trends | FinTech | Enterprise focus |
| **Athena** | 13 | Founder Success | Workforce Dev | Clinical advisory |
| **Andel** | 12 | Founder Success | HRTech | Paychex pilot |
| **CareFam** | 11 | Founder Success | HealthTech | Cigna partnership |
| **Trial Library** | 9 | Cycle Snapshot | HealthTech | 9 strategic partnerships |
| **Clasp** | 6 | Founder Success | Productivity | Cohort 1 company |
| **Certify** | 6 | - | - | - |
| **Take2** | 6 | - | - | - |
| **Stepful** | 6 | Portfolio Trends | Workforce Dev | - |

### Cohort 1 Companies (from IC Voting)

- Borderless
- Clasp ✅ (used in dashboards)
- Kept
- Outro
- Defiant
- Lockwell

---

## Corporate Partners (Real Names)

### Top Partners by Engagement

| Partner | Intros | Dashboard | Industry | Tier |
|---------|--------|-----------|----------|------|
| **Unum** | 9 | Partner ROI | Insurance & Benefits | Platinum |
| **ADP** | 7 | Partner ROI | HR Technology | Gold |
| **Cigna** | 5 | Partner ROI | Healthcare | Gold |
| **Paychex** | 5 | Partner ROI | HR Technology | Platinum |
| **Prudential** | 4 | Partner ROI | Financial Services | Gold |
| **Valeo** | 4 | - | - | - |
| **JPM (Morgan Health)** | 3 | - | Healthcare | - |
| **Telus** | 3 | - | Telecom | - |
| **Workday** | 3 | - | HR Technology | - |
| **Guardian** | 3 | - | Insurance | - |

---

## Dashboard Mapping

### 1. Founder Success Dashboard

**Real Data Used**:
- Company names: Tezi, TrueClaim, Athena, Andel, CareFam, Clasp
- Partner mentions: ADP, Unum, Paychex, Cigna
- Intro counts: Included in "notable_outcomes"

**Synthetic Data**:
- Revenue growth percentages
- Funding amounts
- NPS scores
- Attendance rates
- Mentor hours

**Example**:
```json
{
  "canonical_name": "Tezi",
  "sector": "HRTech",
  "notable_outcomes": "Pilot with ADP Marketplace; 16 strategic intros completed",
  "revenue_growth_pct": 42  // ← Synthetic
}
```

### 2. Partner ROI Dashboard

**Real Data Used**:
- Partner names: Unum, ADP, Cigna, Paychex, Prudential
- Industries: Mapped from real partner profiles
- Intro counts: Used as basis for engagement metrics

**Synthetic Data**:
- Commercial value amounts
- ROI multiples
- Innovation scores
- Cost savings
- Satisfaction scores

**Example**:
```json
{
  "partner_name": "Unum",
  "industry": "Insurance & Benefits",
  "bu_focus": "Unum Innovation Lab",
  "total_commercial_value_usd": 400000  // ← Synthetic
}
```

### 3. Cycle Snapshot Dashboard

**Real Data Used**:
- Company names in achievements: Tezi, TrueClaim, Athena, Andel, CareFam, Clasp
- Intro counts in achievements
- Sector representation

**Synthetic Data**:
- Funding amounts
- Revenue growth
- NPS scores
- Job creation numbers

### 4. Portfolio Trends Tracker

**Real Data Used**:
- Top performers: TrueClaim, Second Door, CareFam, Tezi, Andel, Clasp, Athena, Stepful
- Sector distribution

**Synthetic Data**:
- Success rates
- Valuation amounts
- Conversion rates
- Traction scores

### 5. Operational Health Dashboard

**Real Data Used**:
- Application volume: 164 total applications (from SVA Applications.xlsx)
- Acceptance rate: ~3-4% (6 companies from 164 applications)

**Synthetic Data**:
- Budget utilization
- Efficiency scores
- ROI metrics
- Session completion rates

---

## Intro Type Distribution (Real Data)

From GTM & Corp Dev Intros PY8.xlsx:

| Type | Count | % |
|------|-------|---|
| AccelCo | 54 | 27.6% |
| PortCo | 37 | 18.9% |
| Portco/Advisor | 23 | 11.7% |
| portco | 19 | 9.7% |
| Portco | 16 | 8.2% |
| Sales | 13 | 6.6% |
| Investment | 4 | 2.0% |
| Other | 30 | 15.3% |

**Total**: 196 intros

---

## Benefits of Hybrid Approach

### ✅ Advantages

1. **Authenticity**: Real company and partner names make dashboards relatable
2. **Privacy**: Sensitive financial data is protected
3. **Flexibility**: Can demo to stakeholders without revealing confidential metrics
4. **Validation**: Real intro counts validate engagement patterns
5. **Marketing**: Can use for external communications with disclaimer

### ⚠️ Considerations

1. **Disclaimer Required**: Always include note that metrics are illustrative
2. **Data Freshness**: Real data is from PY8 (2025) - may need updates
3. **Company Consent**: Verify companies are comfortable with public mention
4. **Partner Relationships**: Ensure partner names align with current relationships

---

## Next Steps / Recommendations

### Short Term
- [ ] Add disclaimer to all dashboard pages
- [ ] Verify company consent for public mention
- [ ] Update intro counts if more recent data available

### Medium Term
- [ ] Connect to live data source for real-time metrics
- [ ] Add data refresh timestamp to dashboards
- [ ] Create admin panel to toggle between real/synthetic data

### Long Term
- [ ] Build data pipeline from CRM/ATS systems
- [ ] Implement role-based access (public vs. internal views)
- [ ] Add anonymization layer for sensitive metrics

---

## Data Refresh Log

| Date | Source | Updates |
|------|--------|---------|
| 2025-11-06 | GTM Intros PY8 | Initial mapping of 196 intros |
| 2025-11-06 | Cohort 1 Scoring | Validated company names |
| 2025-11-06 | SVA Applications | Added application volume (164) |

---

**Questions?** Contact the data team or refer to `/data/data.md` for file descriptions.

