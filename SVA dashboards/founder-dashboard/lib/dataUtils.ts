import { CompanyData, KPIMetrics, CohortDelta } from './types';

export function computeKPIs(data: CompanyData[]): KPIMetrics {
  if (data.length === 0) {
    return {
      avg_revenue_growth_pct: 0,
      follow_on_funding_usd: 0,
      pilots_initiated: 0,
      partnerships_signed: 0,
      founder_nps_avg: 0,
      attendance_avg: 0,
      mentor_hours_sum: 0,
    };
  }

  const sum = data.reduce(
    (acc, row) => ({
      revenue_growth: acc.revenue_growth + row.revenue_growth_pct,
      funding: acc.funding + row.follow_on_funding_usd,
      pilots: acc.pilots + row.pilots_initiated,
      partnerships: acc.partnerships + row.partnerships_signed_count,
      nps: acc.nps + row.founder_nps,
      attendance: acc.attendance + row.sessions_attendance_pct,
      mentor_hours: acc.mentor_hours + row.mentor_hours,
    }),
    {
      revenue_growth: 0,
      funding: 0,
      pilots: 0,
      partnerships: 0,
      nps: 0,
      attendance: 0,
      mentor_hours: 0,
    }
  );

  return {
    avg_revenue_growth_pct: sum.revenue_growth / data.length,
    follow_on_funding_usd: sum.funding,
    pilots_initiated: sum.pilots,
    partnerships_signed: sum.partnerships,
    founder_nps_avg: sum.nps / data.length,
    attendance_avg: sum.attendance / data.length,
    mentor_hours_sum: sum.mentor_hours,
  };
}

export function computeCohortDelta(
  spring: CompanyData[],
  fall: CompanyData[]
): CohortDelta {
  const springKPIs = computeKPIs(spring);
  const fallKPIs = computeKPIs(fall);

  return {
    delta_rev_growth_pct: fallKPIs.avg_revenue_growth_pct - springKPIs.avg_revenue_growth_pct,
    delta_follow_on_usd: fallKPIs.follow_on_funding_usd - springKPIs.follow_on_funding_usd,
    delta_pilots: fallKPIs.pilots_initiated - springKPIs.pilots_initiated,
    delta_partnerships: fallKPIs.partnerships_signed - springKPIs.partnerships_signed,
    delta_nps: fallKPIs.founder_nps_avg - springKPIs.founder_nps_avg,
  };
}

export function generateNarrative(delta: CohortDelta): string {
  const lines: string[] = [];

  if (delta.delta_rev_growth_pct !== 0) {
    const direction = delta.delta_rev_growth_pct > 0 ? 'increased' : 'decreased';
    lines.push(
      `Revenue growth ${direction} by ${Math.abs(delta.delta_rev_growth_pct).toFixed(1)} pts.`
    );
  }

  if (delta.delta_follow_on_usd !== 0) {
    const m = delta.delta_follow_on_usd / 1_000_000;
    const direction = delta.delta_follow_on_usd > 0 ? 'increased' : 'decreased';
    lines.push(`Follow-on funding ${direction} by $${Math.abs(m).toFixed(2)}M.`);
  }

  if (delta.delta_pilots !== 0) {
    const direction = delta.delta_pilots > 0 ? 'increased' : 'decreased';
    lines.push(`Pilots ${direction} by ${Math.abs(delta.delta_pilots)}.`);
  }

  if (delta.delta_partnerships !== 0) {
    const direction = delta.delta_partnerships > 0 ? 'increased' : 'decreased';
    lines.push(`Partnerships ${direction} by ${Math.abs(delta.delta_partnerships)}.`);
  }

  if (delta.delta_nps !== 0) {
    const direction = delta.delta_nps > 0 ? 'increased' : 'decreased';
    lines.push(`Founder NPS ${direction} by ${Math.abs(delta.delta_nps).toFixed(1)}.`);
  }

  return lines.length > 0 ? lines.join(' ') : 'Stable performance across cohorts.';
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

