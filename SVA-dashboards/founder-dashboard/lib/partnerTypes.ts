export interface PartnerData {
  partner_uid: string;
  partner_name: string;
  industry: string;
  company_size: string;
  partnership_tier: string;
  quarter: string;
  bu_focus: string;
  primary_contact: string;
  participation_type: string[];
  sessions_attended: number;
  founders_met: number;
  investments_made: number;
  integrations_completed: number;
  repeat_engagement: string;
  thematic_interest: string[];
  total_engagements: number;
  active_pilots: number;
  completed_pilots: number;
  total_commercial_value_usd: number;
  avg_innovation_score: number;
  time_to_pilot_days: number;
  cost_savings_usd: number;
  new_capabilities_gained: number;
  employee_engagement_hours: number;
  patents_filed: number;
  market_insights_gained: number;
  partner_satisfaction_score: number;
  strategic_alignment_score: number;
  roi_multiple: number;
}

export interface PartnerKPIMetrics {
  total_commercial_value: number;
  avg_cost_savings: number;
  avg_roi_multiple: number;
  total_active_pilots: number;
  total_completed_pilots: number;
  avg_innovation_score: number;
  avg_satisfaction_score: number;
  avg_time_to_pilot: number;
  total_capabilities_gained: number;
  total_patents_filed: number;
}

