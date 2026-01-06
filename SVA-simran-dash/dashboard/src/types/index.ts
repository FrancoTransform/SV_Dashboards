export interface FundMetrics {
    committed_capital: number | null;
    capital_called: number | null;
    percent_called: number | null;
    invested_capital: number | null;
    total_investments: number;
    raw_data?: Record<string, any>;
}

export interface InvestmentEntry {
    series: string | null;
    invested_amount: number | null;
    ownership_percentage: number | null;
    implied_valuation: number;
}

export interface InvestmentCurrent {
    series: string | null;
    ownership_percentage: string | number | null;
    last_valuation: number | string | null;
    holding_value: number | string | null;
    market_value: number | null;
    multiple: number | null;
    realized_value?: number | string | null;
    unrealized_value?: number | string | null;
    gross_irr?: number | string | null;
}

export interface Investment {
    id: string;
    name: string;
    sector: string | null;
    initial_investment_date: string | null;
    syndicate: string | null;
    geography: string | null;
    comments: string | null;
    entry: InvestmentEntry;
    current: InvestmentCurrent;
    raw_data?: Record<string, any>;
}

export interface PerformanceEntry {
    company: string;
    status: 'Realized' | 'Unrealized';
    initial_date: string | null;
    exit_date: string | null;
    invested: number | string | null;
    unrealized: number | string | null;
    realized: number | string | null;
    total_value: number | string | null;
    gross_multiple: number | string | null;
    gross_irr: number | string | null;
}

export interface FundData {
    fund_metrics: FundMetrics;
    investments: Investment[];
    performance_table?: PerformanceEntry[];
    last_updated: string;
}
