import { CycleSnapshotData, PortfolioTrendsData, OperationalHealthData } from './cycleTypes';

// Cycle Snapshot Utilities
export function formatCycleDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getCycleStatus(cycle: CycleSnapshotData): { color: string; label: string } {
  if (cycle.status === 'Completed') {
    return { color: '#4dd0e1', label: 'Completed' };
  } else if (cycle.status === 'In Progress') {
    return { color: '#c084fc', label: 'In Progress' };
  }
  return { color: '#888', label: cycle.status };
}

// Portfolio Trends Utilities
export function getSectorPerformanceRating(sector: PortfolioTrendsData): string {
  const score = (
    sector.success_rate_pct * 0.3 +
    sector.market_traction_score * 10 * 0.3 +
    sector.product_readiness_score * 10 * 0.2 +
    sector.team_strength_score * 10 * 0.2
  );
  
  if (score >= 85) return 'Excellent';
  if (score >= 75) return 'Strong';
  if (score >= 65) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Needs Attention';
}

export function getSectorRiskLevel(sector: PortfolioTrendsData): { level: string; color: string } {
  const riskCount = sector.risk_factors.length;
  const successRate = sector.success_rate_pct;
  
  if (riskCount >= 3 || successRate < 70) {
    return { level: 'High', color: '#ff6b6b' };
  } else if (riskCount === 2 || successRate < 80) {
    return { level: 'Medium', color: '#ffd93d' };
  }
  return { level: 'Low', color: '#6bcf7f' };
}

// Operational Health Utilities
export function getEfficiencyRating(score: number): { rating: string; color: string } {
  if (score >= 8.5) return { rating: 'Excellent', color: '#6bcf7f' };
  if (score >= 7.5) return { rating: 'Good', color: '#4dd0e1' };
  if (score >= 6.5) return { rating: 'Fair', color: '#ffd93d' };
  return { rating: 'Needs Improvement', color: '#ff6b6b' };
}

export function calculateBudgetVariance(data: OperationalHealthData): number {
  return data.budget_allocated_usd - data.budget_spent_usd;
}

export function getBudgetStatus(utilizationPct: number): { status: string; color: string } {
  if (utilizationPct >= 90 && utilizationPct <= 100) {
    return { status: 'Optimal', color: '#6bcf7f' };
  } else if (utilizationPct >= 80 && utilizationPct < 90) {
    return { status: 'Good', color: '#4dd0e1' };
  } else if (utilizationPct < 80) {
    return { status: 'Under-utilized', color: '#ffd93d' };
  }
  return { status: 'Over-budget', color: '#ff6b6b' };
}

// Formatting Utilities
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function formatDecimal(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(0)}%`;
}

