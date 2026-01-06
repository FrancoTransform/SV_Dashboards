"use client";

import { useState, useMemo } from "react";
import { Investment } from "@/types";
import { formatCurrency, formatPercent, formatMultiple } from "@/lib/utils";
import { ArrowUpDown, Search, Filter } from "lucide-react";

interface InvestmentsTableProps {
    investments: Investment[];
}

type SortField = 'name' | 'invested_amount' | 'ownership_entry' | 'ownership_current' | 'valuation_entry' | 'valuation_current' | 'multiple';
type SortDirection = 'asc' | 'desc';

export function InvestmentsTable({ investments }: InvestmentsTableProps) {
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [sectorFilter, setSectorFilter] = useState<string>("all");

    // Get unique sectors
    const sectors = useMemo(() => {
        const s = new Set(investments.map(i => i.sector).filter(Boolean));
        return Array.from(s).sort();
    }, [investments]);

    const filteredAndSortedInvestments = useMemo(() => {
        let result = investments.filter(inv => {
            // Filter out summary rows
            if (['average', 'median', 'dollar-weighted', 'deals:', '#-of-deals', 'fund-i---performance-summary'].includes(inv.id)) return false;

            const matchesSearch = inv.name.toLowerCase().includes(search.toLowerCase());
            const matchesSector = sectorFilter === "all" || inv.sector === sectorFilter;
            return matchesSearch && matchesSector;
        });

        result.sort((a, b) => {
            let valA: any = '';
            let valB: any = '';

            switch (sortField) {
                case 'name':
                    valA = a.name;
                    valB = b.name;
                    break;
                case 'invested_amount':
                    valA = a.entry.invested_amount || 0;
                    valB = b.entry.invested_amount || 0;
                    break;
                case 'ownership_entry':
                    valA = a.entry.ownership_percentage || 0;
                    valB = b.entry.ownership_percentage || 0;
                    break;
                case 'ownership_current':
                    // Handle "Realized" or "Acquired" strings by treating them as -1 or similar for sorting, or just 0
                    const ocA = a.current.ownership_percentage;
                    valA = typeof ocA === 'number' ? ocA : 0;
                    const ocB = b.current.ownership_percentage;
                    valB = typeof ocB === 'number' ? ocB : 0;
                    break;
                case 'valuation_entry':
                    valA = a.entry.implied_valuation || 0;
                    valB = b.entry.implied_valuation || 0;
                    break;
                case 'valuation_current':
                    const vcA = a.current.last_valuation;
                    valA = typeof vcA === 'number' ? vcA : 0;
                    const vcB = b.current.last_valuation;
                    valB = typeof vcB === 'number' ? vcB : 0;
                    break;
                case 'multiple':
                    valA = a.current.multiple || 0;
                    valB = b.current.multiple || 0;
                    break;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [investments, search, sortField, sortDirection, sectorFilter]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc'); // Default to desc for numbers usually
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-50" />;
        return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'text-blue-500' : 'text-blue-500 rotate-180'}`} />;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        placeholder="Search companies..."
                        className="pl-8 h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={sectorFilter}
                        onChange={(e) => setSectorFilter(e.target.value)}
                    >
                        <option value="all">All Sectors</option>
                        {sectors.map(s => <option key={s} value={s as string}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3 cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">Company <SortIcon field="name" /></div>
                                </th>
                                <th className="px-4 py-3">Sector</th>
                                <th className="px-4 py-3">Stage (Entry)</th>
                                <th className="px-4 py-3 text-right cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('invested_amount')}>
                                    <div className="flex items-center justify-end">Invested <SortIcon field="invested_amount" /></div>
                                </th>
                                <th className="px-4 py-3 text-right cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('ownership_entry')}>
                                    <div className="flex items-center justify-end">Own % (Entry) <SortIcon field="ownership_entry" /></div>
                                </th>
                                <th className="px-4 py-3 text-right cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('valuation_entry')}>
                                    <div className="flex items-center justify-end">Val (Entry) <SortIcon field="valuation_entry" /></div>
                                </th>
                                <th className="px-4 py-3 text-right cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('ownership_current')}>
                                    <div className="flex items-center justify-end">Own % (Curr) <SortIcon field="ownership_current" /></div>
                                </th>
                                <th className="px-4 py-3 text-right cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('valuation_current')}>
                                    <div className="flex items-center justify-end">Val (Curr) <SortIcon field="valuation_current" /></div>
                                </th>
                                <th className="px-4 py-3 text-right cursor-pointer group hover:bg-gray-100" onClick={() => handleSort('multiple')}>
                                    <div className="flex items-center justify-end">MOIC <SortIcon field="multiple" /></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedInvestments.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">{inv.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{inv.sector}</td>
                                    <td className="px-4 py-3 text-gray-500">{inv.entry.series}</td>
                                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(inv.entry.invested_amount)}</td>
                                    <td className="px-4 py-3 text-right font-mono">{formatPercent(inv.entry.ownership_percentage)}</td>
                                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(inv.entry.implied_valuation)}</td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {typeof inv.current.ownership_percentage === 'string' ? inv.current.ownership_percentage : formatPercent(inv.current.ownership_percentage)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {typeof inv.current.last_valuation === 'string' ? inv.current.last_valuation : formatCurrency(inv.current.last_valuation)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-medium text-blue-600">{formatMultiple(inv.current.multiple)}</td>
                                </tr>
                            ))}
                            {filteredAndSortedInvestments.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">No investments found matching your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
