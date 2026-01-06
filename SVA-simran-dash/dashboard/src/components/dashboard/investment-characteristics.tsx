"use client";

import { FundData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface InvestmentCharacteristicsProps {
    data: FundData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function InvestmentCharacteristics({ data }: InvestmentCharacteristicsProps) {
    // Filter out aggregate rows
    const investments = data.investments.filter(inv =>
        !['average', 'median', 'dollar weighted'].includes(inv.id.toLowerCase()) &&
        inv.sector // Ensure sector exists
    );

    // 1. Number of deals by category
    const dealsByCategory = investments.reduce((acc, inv) => {
        const sector = inv.sector || "Unknown";
        const existing = acc.find(x => x.name === sector);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: sector, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

    // 2. Initial investment by category
    const initialInvByCategory = investments.reduce((acc, inv) => {
        const sector = inv.sector || "Unknown";
        const existing = acc.find(x => x.name === sector);
        const amount = Number(inv.entry.invested_amount) || 0;
        if (existing) {
            existing.value += amount;
        } else {
            acc.push({ name: sector, value: amount });
        }
        return acc;
    }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

    // 3. Breakout by seed round
    const breakoutByRound = investments.reduce((acc, inv) => {
        // Normalize round names if needed (e.g., "Seed" vs "Seed Round")
        let round = inv.entry.series || "Unknown";
        // Simple normalization
        if (round.toLowerCase().includes('seed')) round = 'Seed';
        else if (round.toLowerCase().includes('series a') || round === 'A') round = 'Series A';
        else if (round.toLowerCase().includes('series b') || round === 'B') round = 'Series B';

        const existing = acc.find(x => x.name === round);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: round, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

    // 4. Current investment by category (Market Value)
    const currentInvByCategory = investments.reduce((acc, inv) => {
        const sector = inv.sector || "Unknown";
        const existing = acc.find(x => x.name === sector);
        const amount = Number(inv.current.market_value) || 0;
        if (existing) {
            existing.value += amount;
        } else {
            acc.push({ name: sector, value: amount });
        }
        return acc;
    }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Investment Characteristics</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {/* Number of Deals by Category */}
                <Card>
                    <CardHeader>
                        <CardTitle>Number of Deals by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dealsByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dealsByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatNumber(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Breakout by Seed Round */}
                <Card>
                    <CardHeader>
                        <CardTitle>Breakout by Round</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={breakoutByRound}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#82ca9d"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {breakoutByRound.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatNumber(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Initial Investment by Category */}
                <Card>
                    <CardHeader>
                        <CardTitle>Initial Investment by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={initialInvByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={(value: number, name) => [formatCurrency(value), 'Cost']} />
                                <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]}>
                                    {initialInvByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Current Investment by Category */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Investment by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={currentInvByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={(value: number, name) => [formatCurrency(value), 'Cost']} />
                                <Bar dataKey="value" fill="#00C49F" radius={[4, 4, 0, 0]}>
                                    {currentInvByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
