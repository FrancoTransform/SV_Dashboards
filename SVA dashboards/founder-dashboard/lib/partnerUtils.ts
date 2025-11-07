import { PartnerData, PartnerKPIMetrics } from './partnerTypes';

export function computePartnerKPIs(data: PartnerData[]): PartnerKPIMetrics {
  if (data.length === 0) {
    return {
      total_commercial_value: 0,
      avg_cost_savings: 0,
      avg_roi_multiple: 0,
      total_active_pilots: 0,
      total_completed_pilots: 0,
      avg_innovation_score: 0,
      avg_satisfaction_score: 0,
      avg_time_to_pilot: 0,
      total_capabilities_gained: 0,
      total_patents_filed: 0,
    };
  }

  return {
    total_commercial_value: data.reduce((sum, d) => sum + d.total_commercial_value_usd, 0),
    avg_cost_savings: data.reduce((sum, d) => sum + d.cost_savings_usd, 0) / data.length,
    avg_roi_multiple: data.reduce((sum, d) => sum + d.roi_multiple, 0) / data.length,
    total_active_pilots: data.reduce((sum, d) => sum + d.active_pilots, 0),
    total_completed_pilots: data.reduce((sum, d) => sum + d.completed_pilots, 0),
    avg_innovation_score: data.reduce((sum, d) => sum + d.avg_innovation_score, 0) / data.length,
    avg_satisfaction_score: data.reduce((sum, d) => sum + d.partner_satisfaction_score, 0) / data.length,
    avg_time_to_pilot: data.reduce((sum, d) => sum + d.time_to_pilot_days, 0) / data.length,
    total_capabilities_gained: data.reduce((sum, d) => sum + d.new_capabilities_gained, 0),
    total_patents_filed: data.reduce((sum, d) => sum + d.patents_filed, 0),
  };
}

export function generatePartnerNarrative(data: PartnerData[]): string {
  if (data.length === 0) return 'No partner data available.';

  const kpis = computePartnerKPIs(data);
  const avgROI = kpis.avg_roi_multiple.toFixed(2);
  const totalValue = (kpis.total_commercial_value / 1000000).toFixed(2);
  const avgSavings = (kpis.avg_cost_savings / 1000).toFixed(0);

  const lines = [];
  
  lines.push(`Partners are achieving an average ROI of ${avgROI}x on their investments.`);
  lines.push(`Total commercial value generated: $${totalValue}M with average cost savings of $${avgSavings}K per partner.`);
  
  if (kpis.total_active_pilots > 0) {
    lines.push(`Currently ${kpis.total_active_pilots} active pilots with ${kpis.total_completed_pilots} successfully completed.`);
  }
  
  if (kpis.total_capabilities_gained > 0) {
    lines.push(`Partners have gained ${kpis.total_capabilities_gained} new capabilities through these engagements.`);
  }

  if (kpis.total_patents_filed > 0) {
    lines.push(`${kpis.total_patents_filed} patents filed as a result of partner collaborations.`);
  }

  return lines.join(' ');
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  return value.toFixed(0);
}

export function formatDecimal(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

