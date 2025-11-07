export interface CycleSnapshotData {
  program_cycle_uid: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  status: string;
  total_companies: number;
  total_founders: number;
  avg_revenue_growth_pct: number;
  total_funding_raised_usd: number;
  total_pilots: number;
  total_partnerships: number;
  avg_founder_nps: number;
  graduation_rate_pct: number | null;
  job_creation: number;
  sectors_represented: string[];
  top_achievements: string[];
  media_mentions: number;
  demo_day_attendance: number | null;
  investor_connections: number;
  mentor_hours_total: number;
  avg_session_attendance_pct: number;
}

export interface PortfolioTrendsData {
  sector: string;
  total_companies: number;
  avg_revenue_growth_pct: number;
  total_funding_usd: number;
  avg_valuation_usd: number;
  success_rate_pct: number;
  avg_time_to_funding_days: number;
  pilot_conversion_rate_pct: number;
  partnership_rate_pct: number;
  avg_founder_nps: number;
  market_traction_score: number;
  product_readiness_score: number;
  team_strength_score: number;
  investment_thesis: string;
  risk_factors: string[];
  top_performers: string[];
}

export interface OperationalHealthData {
  program_cycle_uid: string;
  cycle_name: string;
  operational_efficiency_score: number;
  budget_utilization_pct: number;
  budget_allocated_usd: number;
  budget_spent_usd: number;
  cost_per_company_usd: number;
  mentor_utilization_rate_pct: number;
  total_mentor_hours: number;
  avg_mentor_hours_per_company: number;
  session_completion_rate_pct: number;
  total_sessions_planned: number;
  total_sessions_completed: number;
  avg_attendance_rate_pct: number;
  resource_satisfaction_score: number;
  platform_uptime_pct: number;
  support_ticket_resolution_time_hours: number;
  curriculum_completion_rate_pct: number;
  milestone_achievement_rate_pct: number;
  staff_hours_invested: number;
  cost_per_outcome_usd: number;
  roi_on_investment: number;
  partner_engagement_score: number;
  alumni_engagement_score: number;
}

