"use client";

import { FundData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatMultiple, formatNumber } from "@/lib/utils";
import { InvestmentsTable } from "./investments-table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";

import { InvestmentCharacteristics } from "./investment-characteristics";
import { PortfolioTable } from "./portfolio-table";
import fundICharacteristics from "@/data/investment_characteristics.json";
import fundIICharacteristics from "@/data/fund_ii_characteristics.json";
import fundIIICharacteristics from "@/data/fund_iii_characteristics.json";

interface OverviewProps {
    data: FundData;
    fundId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Overview({ data, fundId = 'fund-i' }: OverviewProps) {
    // Select characteristics data based on fund logic
    const characteristicsData = {
        'fund-i': fundICharacteristics,
        'fund-ii': fundIICharacteristics,
        'fund-iii': fundIIICharacteristics
    }[fundId] || fundICharacteristics;

    // Calculate Sector Data
    const sectorData = data.investments.reduce((acc, inv) => {
        if (!inv.sector || ['Average', 'Median'].includes(inv.name)) return acc;
        const existing = acc.find(x => x.name === inv.sector);
        const amount = inv.current.market_value || inv.entry.invested_amount || 0;
        if (existing) {
            existing.value += amount;
        } else {
            acc.push({ name: inv.sector, value: amount });
        }
        return acc;
    }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Committed Capital</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.fund_metrics.invested_capital)}</div>
                        <p className="text-xs text-muted-foreground">
                            100% Called
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invested Capital</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.fund_metrics.invested_capital)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {data.fund_metrics.total_investments} Investments
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value (TVPI)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* TVPI from Investment Performance Summary spreadsheet (Total Portfolio Gross Multiple) */}
                        <div className="text-2xl font-bold">
                            {formatMultiple(data.fund_metrics.raw_data?.MOIC || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Gross Multiple
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Entry Ownership</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {/* From Investment Characteristics workbook H33 */}
                            {formatPercent(
                                data.fund_metrics.raw_data?.['Avg Entry Ownership'] ||
                                data.investments.reduce((sum, inv) => sum + (inv.entry.ownership_percentage || 0), 0) / data.investments.length
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Investment Characteristics */}
            <InvestmentCharacteristics data={data} />

            {/* Executive Summary Charts */}
            {data.performance_table && (
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Value Bridge */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Value Creation</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={(() => {
                                        // Find the summary rows from the performance table
                                        const totalRealized = data.performance_table.find(item => item.company === 'Total Realized Portfolio');
                                        const totalUnrealized = data.performance_table.find(item => item.company === 'Total Unrealized Portfolio');
                                        const totalPortfolio = data.performance_table.find(item => item.company === 'Total Portfolio');

                                        return [
                                            {
                                                name: 'Invested',
                                                value: data.fund_metrics.invested_capital
                                            },
                                            {
                                                name: 'Realized',
                                                value: totalRealized?.total_value || 0
                                            },
                                            {
                                                name: 'Unrealized',
                                                value: totalUnrealized?.total_value || 0
                                            },
                                            {
                                                name: 'Total Value',
                                                value: totalPortfolio?.total_value || 0
                                            }
                                        ];
                                    })()}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`} />
                                    <Tooltip formatter={(value: number, name) => [formatCurrency(value), 'Cost']} />
                                    <Bar dataKey="value" fill="#8884d8">
                                        {
                                            [0, 1, 2, 3].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#6b7280', '#10b981', '#3b82f6', '#8b5cf6'][index]} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Value Drivers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 5 Value Drivers (Total Value)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={data.performance_table
                                        .filter(item => {
                                            const name = item.company.toLowerCase();
                                            return !name.includes('total') &&
                                                !name.includes('realized') &&
                                                !name.includes('unrealized') &&
                                                !name.includes('portfolio');
                                        })
                                        .sort((a, b) => (Number(b.total_value) || 0) - (Number(a.total_value) || 0))
                                        .slice(0, 5)
                                    }
                                    margin={{ left: 20 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="company" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Bar dataKey="total_value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Portfolio Table from Investment Characteristics */}
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                    <PortfolioTable data={characteristicsData as any} />
                </CardContent>
            </Card>

            {/* Raw Fund Data (Collapsed) */}
            {data.fund_metrics.raw_data && (
                <details className="group border rounded-lg bg-gray-50" open>
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900 hover:bg-gray-100 rounded-lg">
                        <span>View All Fund Data Points</span>
                        <span className="transition group-open:rotate-180">
                            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                        </span>
                    </summary>
                    <div className="border-t p-4 text-sm text-gray-600 overflow-x-auto">
                        <table className="w-full text-left">
                            <tbody>
                                {Object.entries(data.fund_metrics.raw_data).map(([key, value]) => {
                                    const keyLower = key.toLowerCase();
                                    const isCurrency = (
                                        keyLower.includes('capital') ||
                                        keyLower.includes('value') ||
                                        keyLower.includes('cost') ||
                                        keyLower.includes('amount') ||
                                        keyLower.includes('price') ||
                                        keyLower.includes('revenue') ||
                                        keyLower.includes('ev ') ||
                                        keyLower === 'ev'
                                    ) && typeof value === 'number' && !keyLower.includes('percent') && !keyLower.includes('multiple') && !keyLower.includes('moic') && !keyLower.includes('irr') && !keyLower.includes('%');

                                    const isPercent = (
                                        keyLower.includes('percent') ||
                                        keyLower.includes('moic') ||
                                        keyLower.includes('irr') ||
                                        keyLower.includes('%')
                                    ) && typeof value === 'number';

                                    return (
                                        <tr key={key} className="border-b last:border-0">
                                            <td className="py-2 pr-4 font-medium text-gray-500 whitespace-nowrap">{key}</td>
                                            <td className="py-2 text-gray-900">
                                                {isCurrency ? formatCurrency(value as number) :
                                                    isPercent ? formatPercent(value as number) :
                                                        typeof value === 'number' ? formatNumber(value) :
                                                            String(value)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </details>
            )}
        </div>
    );
}
