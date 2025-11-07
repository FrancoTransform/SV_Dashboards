export interface CompanyData {
  program_cycle_uid: string;
  company_uid: string;
  revenue_growth_pct: number;
  pilots_initiated: number;
  partnerships_signed_count: number;
  follow_on_funding_usd: number;
  goal_progress_score: number;
  founder_nps: number;
  sessions_attendance_pct: number;
  mentor_hours: number;
  notable_outcomes: string;
  canonical_name: string;
  sector: string;
  stage: string;
  product_readiness: string;
  gtm_maturity: string;
  icp_clarity: string;
  sales_motion: string;
  advisor_relationships_formed: number;
}

export interface KPIMetrics {
  avg_revenue_growth_pct: number;
  follow_on_funding_usd: number;
  pilots_initiated: number;
  partnerships_signed: number;
  founder_nps_avg: number;
  attendance_avg: number;
  mentor_hours_sum: number;
}

export interface CohortDelta {
  delta_rev_growth_pct: number;
  delta_follow_on_usd: number;
  delta_pilots: number;
  delta_partnerships: number;
  delta_nps: number;
}

