"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, AlertCircle, RefreshCw, Target, Lightbulb, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { FundData } from "@/types";

interface DetailedInsight {
    title: string;
    description: string;
    impact: "High" | "Medium" | "Low";
    sentiment: "Positive" | "Neutral" | "Negative";
}

interface InsightsData {
    executive_summary: string;
    key_takeaways: string[];
    action_items: string[];
    detailed_insights: DetailedInsight[];
}

interface AIInsightsViewProps {
    fundData: FundData;
    fundId: string;
}

export function AIInsightsView({ fundData, fundId }: AIInsightsViewProps) {
    const [data, setData] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            const cacheKey = `fund_insights_${fundId}`;

            // Check cache first if not forcing refresh
            if (!forceRefresh) {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    setData(JSON.parse(cached));
                    setLoading(false);
                    return;
                }
            }

            // Prepare summary payload
            const summary = {
                fund_metrics: fundData.fund_metrics,
                performance_summary: fundData.performance_table?.map(p => ({
                    company: p.company,
                    status: p.status,
                    invested: p.invested,
                    total_value: p.total_value,
                    gross_moic: p.gross_multiple,
                    gross_irr: p.gross_irr
                })),
                top_investments: fundData.investments.slice(0, 10).map(inv => ({
                    name: inv.name,
                    sector: inv.sector,
                    current_value: inv.current.market_value,
                    moic: inv.current.multiple
                }))
            };

            const response = await fetch('/api/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary })
            });

            if (!response.ok) throw new Error('Failed to fetch insights');
            const result = await response.json();

            setData(result);
            localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [fundId]); // Re-fetch when fundId changes

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p>Analyzing fund performance data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-red-500 space-y-4">
                <AlertCircle className="h-8 w-8" />
                <p>Unable to generate insights. Please try again later.</p>
                <button
                    onClick={() => fetchInsights(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">AI Executive Insights</h2>
                        <p className="text-gray-500">Automated analysis of fund performance and key drivers</p>
                    </div>
                </div>
                <button
                    onClick={() => fetchInsights(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Insights
                </button>
            </div>

            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Executive Summary</h3>
                <p className="text-gray-800 leading-relaxed text-lg">
                    {data.executive_summary}
                </p>
            </div>

            {/* Takeaways & Action Items Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Key Takeaways */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-blue-500" />
                            <CardTitle>Key Takeaways</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {data.key_takeaways.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                    <span className="text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Action Items */}
                <Card className="border-t-4 border-t-emerald-500 bg-emerald-50/30">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-emerald-600" />
                            <CardTitle className="text-emerald-900">Recommended Actions</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {data.action_items.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                    <span className="text-emerald-900 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Insights */}
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {data.detailed_insights.map((insight, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-4">
                                    <CardTitle className="text-lg text-gray-900 leading-tight">
                                        {insight.title}
                                    </CardTitle>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Badge variant={insight.impact === 'High' ? 'destructive' : 'secondary'}>
                                            {insight.impact} Impact
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm mb-3">
                                    {insight.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    {insight.sentiment === 'Positive' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                    {insight.sentiment === 'Negative' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                                    {insight.sentiment === 'Neutral' && <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />}
                                    <span className={
                                        insight.sentiment === 'Positive' ? 'text-green-600' :
                                            insight.sentiment === 'Negative' ? 'text-red-600' :
                                                'text-gray-500'
                                    }>
                                        {insight.sentiment} Outlook
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
