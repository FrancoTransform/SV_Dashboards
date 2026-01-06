import { Investment } from "@/types";
import { formatCurrency, formatPercent, formatMultiple, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CompanyDetailProps {
    investment: Investment;
}

export function CompanyDetail({ investment }: CompanyDetailProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">{investment.name}</h2>
                    <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">{investment.sector}</span>
                        <span>•</span>
                        <span className="text-sm">{investment.geography}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Current Value</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(investment.current.market_value)}
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500">Invested</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-lg font-bold">{formatCurrency(investment.entry.invested_amount)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500">Ownership (Entry)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-lg font-bold">{formatPercent(investment.entry.ownership_percentage)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500">Ownership (Curr)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-lg font-bold">
                            {typeof investment.current.ownership_percentage === 'number'
                                ? formatPercent(investment.current.ownership_percentage)
                                : investment.current.ownership_percentage}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500">MOIC</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className={`text-lg font-bold ${Number(investment.current.multiple) > 1 ? 'text-green-600' : 'text-gray-900'}`}>
                            {formatPercent(investment.current.multiple)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Metrics (New) */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gray-50/50">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500">Realized Value</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-base font-semibold">{formatCurrency(investment.current.realized_value ?? null)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-50/50">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500">Unrealized Value</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-base font-semibold">{formatCurrency(investment.current.unrealized_value ?? null)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-50/50">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500">Gross IRR</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-base font-semibold">{formatPercent(investment.current.gross_irr ?? null)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Investment Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Value Creation</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'Invested', value: Number(investment.entry.invested_amount) || 0 },
                                    { name: 'Current Value', value: (Number(investment.current.realized_value) || 0) + (Number(investment.current.unrealized_value) || 0) }
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(val: number) => `$${(val / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="value" fill="#3b82f6">
                                    {
                                        [0, 1].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#6b7280', '#10b981'][index]} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Ownership Evolution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'Entry', value: Number(investment.entry.ownership_percentage) || 0 },
                                    { name: 'Current', value: Number(investment.current.ownership_percentage) || 0 }
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(val: number) => `${(val * 100).toFixed(0)}%`} />
                                <Tooltip formatter={(value: number) => formatPercent(value)} />
                                <Bar dataKey="value" fill="#8b5cf6">
                                    {
                                        [0, 1].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#8b5cf6', '#6366f1'][index]} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Details Sections */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Entry Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Entry Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Initial Date</span>
                            <span className="font-medium">{investment.initial_investment_date}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Entry Series</span>
                            <span className="font-medium">{investment.entry.series}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Implied Valuation</span>
                            <span className="font-medium">{formatCurrency(investment.entry.implied_valuation)}</span>
                        </div>
                        <div className="pt-2">
                            <span className="text-sm text-gray-500 block mb-1">Syndicate Partners</span>
                            <p className="text-sm leading-relaxed text-gray-700">
                                {investment.syndicate || "No syndicate data available"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Current Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Current Series</span>
                            <span className="font-medium">{investment.current.series}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Last Valuation</span>
                            <span className="font-medium">
                                {typeof investment.current.last_valuation === 'number'
                                    ? formatCurrency(investment.current.last_valuation)
                                    : investment.current.last_valuation}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Holding Value</span>
                            <span className="font-medium">
                                {typeof investment.current.holding_value === 'number'
                                    ? formatCurrency(investment.current.holding_value)
                                    : investment.current.holding_value}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notes/Comments */}
            {investment.comments && (
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-base text-blue-900">Latest Updates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            {investment.comments}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Raw Data (Collapsed) */}
            {investment.raw_data && (
                <details className="group border rounded-lg bg-gray-50" open>
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900 hover:bg-gray-100 rounded-lg">
                        <span>View All Data Points</span>
                        <span className="transition group-open:rotate-180">
                            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                        </span>
                    </summary>
                    <div className="border-t p-4 text-sm text-gray-600 overflow-x-auto">
                        <table className="w-full text-left">
                            <tbody>
                                {Object.entries(investment.raw_data).map(([key, value]) => {
                                    const keyLower = key.toLowerCase();
                                    const isCurrency = (
                                        keyLower.includes('amount') ||
                                        keyLower.includes('value') ||
                                        keyLower.includes('cost') ||
                                        keyLower.includes('price') ||
                                        keyLower.includes('invested') ||
                                        keyLower.includes('revenue') ||
                                        keyLower.includes('ev ') ||
                                        keyLower === 'ev'
                                    ) && typeof value === 'number' && !keyLower.includes('percent') && !keyLower.includes('multiple') && !keyLower.includes('moic') && !keyLower.includes('irr') && !keyLower.includes('%');

                                    const isPercent = (
                                        keyLower.includes('percent') ||
                                        keyLower.includes('moic') ||
                                        keyLower.includes('irr') ||
                                        keyLower.includes('%') ||
                                        keyLower.includes('multiple')
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
