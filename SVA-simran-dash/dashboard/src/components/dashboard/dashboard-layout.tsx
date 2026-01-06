"use client";

import { useState } from "react";
import { FundData, Investment } from "@/types";
import { cn } from "@/lib/utils";
import Overview from "./overview";
import { CompanyDetail } from "./company-detail";
import { AIInsightsView } from "./ai-insights-view";
import { Search, ChevronRight, LayoutDashboard, Sparkles } from "lucide-react";

interface DashboardLayoutProps {
    data: FundData;
    fundId?: string;
}

export default function DashboardLayout({ data, fundId = 'fund-i' }: DashboardLayoutProps) {
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const filteredCompanies = data.investments.filter(inv =>
        inv.name.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));

    const selectedCompany = selectedCompanyId && selectedCompanyId !== 'insights'
        ? data.investments.find(i => i.id === selectedCompanyId)
        : null;

    return (
        <div className="flex min-h-[calc(100vh-8rem)] border rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Sidebar List */}
            <div className="w-80 shrink-0 border-r bg-slate-50 flex flex-col">
                <div className="p-4 border-b space-y-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            placeholder="Filter companies..."
                            className="pl-8 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1">
                    {/* Summary Option */}
                    <button
                        onClick={() => setSelectedCompanyId(null)}
                        className={cn(
                            "w-full text-left px-4 py-3 text-sm font-medium border-b transition-colors flex items-center gap-3",
                            selectedCompanyId === null
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "text-gray-700 hover:bg-gray-100/50"
                        )}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        All Investments
                    </button>

                    {/* AI Insights Option */}
                    <button
                        onClick={() => setSelectedCompanyId('insights')}
                        className={cn(
                            "w-full text-left px-4 py-3 text-sm font-medium border-b transition-colors flex items-center gap-3",
                            selectedCompanyId === 'insights'
                                ? "bg-purple-50 text-purple-700 border-purple-100"
                                : "text-gray-700 hover:bg-gray-100/50"
                        )}
                    >
                        <Sparkles className="h-4 w-4" />
                        AI Insights
                    </button>

                    {/* Company List */}
                    {filteredCompanies.map((company) => (
                        <button
                            key={company.id}
                            onClick={() => setSelectedCompanyId(company.id)}
                            className={cn(
                                "w-full text-left px-4 py-3 text-sm border-b transition-colors flex justify-between items-center group",
                                selectedCompanyId === company.id
                                    ? "bg-white border-l-4 border-l-blue-600 shadow-sm z-10"
                                    : "text-gray-600 hover:bg-gray-100/50 border-l-4 border-l-transparent"
                            )}
                        >
                            <span className={cn(
                                "truncate font-medium",
                                selectedCompanyId === company.id ? "text-gray-900" : "text-gray-600"
                            )}>
                                {company.name}
                            </span>
                            {selectedCompanyId === company.id && (
                                <ChevronRight className="h-4 w-4 text-blue-600" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white p-8 min-w-0">
                {selectedCompanyId === 'insights' ? (
                    <AIInsightsView fundData={data} fundId={fundId} />
                ) : selectedCompany ? (
                    <CompanyDetail investment={selectedCompany} />
                ) : (
                    <Overview data={data} fundId={fundId} />
                )}
            </div>
        </div>
    );
}
