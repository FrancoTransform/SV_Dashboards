"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency, formatPercent, formatMultiple } from "@/lib/utils";
import { ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface InvestmentCharacteristic {
    "Unnamed: 0": string;
    "Company": string;
    "Description": string;
    "Website": string;
    "HQ": string;
    "Sector": string;
    "Initial Inv. Date": string | null;
    "Series": string;
    "$ Invested": number;
    "VC Syndicate": string | null;
    "Series.1": string;
    "FD%": number | null;
    "$ Current Invested Cost": number;
    "Total Invested Cost": number;
    "Carrying Value": number;
    "Realized Proceeds": number;
    "Total Value": number;
    "Gross MOIC": number;
    "Last Post Money Value": number | string | null;
    "Current SV Company Value": number | string | null;
    "Red/Yellow/Green Status": number | string | null;
    "SV Outlook": string | null;
}

interface PortfolioTableProps {
    data: InvestmentCharacteristic[];
}

type SortField = keyof InvestmentCharacteristic;
type SortDirection = 'asc' | 'desc' | null;

export function PortfolioTable({ data }: PortfolioTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const toggleRow = (companyName: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(companyName)) {
            newExpanded.delete(companyName);
        } else {
            newExpanded.add(companyName);
        }
        setExpandedRows(newExpanded);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortField(null);
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortField || !sortDirection) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            // Handle null/undefined values
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            // Compare values
            let comparison = 0;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
            } else {
                comparison = String(aVal).localeCompare(String(bVal));
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [data, sortField, sortDirection]);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-3 w-3 ml-1 inline opacity-0 group-hover:opacity-50" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp className="h-3 w-3 ml-1 inline" />
            : <ArrowDown className="h-3 w-3 ml-1 inline" />;
    };

    return (
        <div className="rounded-md border">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-800 text-white font-medium border-b">
                        <tr>
                            <th className="p-3 text-left w-8"></th>
                            <th className="p-3 text-left group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("Unnamed: 0")}>
                                Company<SortIcon field="Unnamed: 0" />
                            </th>
                            <th className="p-3 text-left group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("Initial Inv. Date")}>
                                Initial Inv. Date<SortIcon field="Initial Inv. Date" />
                            </th>
                            <th className="p-3 text-left group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("Series.1")}>
                                Series<SortIcon field="Series.1" />
                            </th>
                            <th className="p-3 text-right group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("FD%")}>
                                FD%<SortIcon field="FD%" />
                            </th>
                            <th className="p-3 text-right group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("$ Current Invested Cost")}>
                                % Current Invested Cost<SortIcon field="$ Current Invested Cost" />
                            </th>
                            <th className="p-3 text-right group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("Total Invested Cost")}>
                                Total Invested Cost<SortIcon field="Total Invested Cost" />
                            </th>
                            <th className="p-3 text-right group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("Carrying Value")}>
                                Carrying Value<SortIcon field="Carrying Value" />
                            </th>
                            <th className="p-3 text-right group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("Realized Proceeds")}>
                                Realized Proceeds<SortIcon field="Realized Proceeds" />
                            </th>
                            <th className="p-3 text-right group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("Total Value")}>
                                Total Value<SortIcon field="Total Value" />
                            </th>
                            <th className="p-3 text-right group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("Gross MOIC")}>
                                Gross MOIC<SortIcon field="Gross MOIC" />
                            </th>
                            <th className="p-3 text-right group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("Last Post Money Value")}>
                                Last Post Money Value<SortIcon field="Last Post Money Value" />
                            </th>
                            <th className="p-3 text-right group cursor-pointer hover:bg-gray-700" onClick={() => handleSort("Current SV Company Value")}>
                                Current SV Company Value<SortIcon field="Current SV Company Value" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {sortedData.map((inv, index) => {
                            const companyName = inv["Unnamed: 0"];
                            const isExpanded = expandedRows.has(companyName);
                            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";

                            return (
                                <React.Fragment key={companyName}>
                                    <tr
                                        className={`${rowBg} hover:bg-blue-50 cursor-pointer transition-colors`}
                                        onClick={() => toggleRow(companyName)}
                                    >
                                        <td className="p-3">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                            )}
                                        </td>
                                        <td className="p-3 font-medium">{companyName}</td>
                                        <td className="p-3 text-gray-500">
                                            {inv["Initial Inv. Date"] ? new Date(inv["Initial Inv. Date"]).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="p-3">{inv["Series.1"] || inv["Series"]}</td>
                                        <td className="p-3 text-right">{inv["FD%"] ? formatPercent(inv["FD%"]) : "-"}</td>
                                        <td className="p-3 text-right">{formatCurrency(inv["$ Current Invested Cost"])}</td>
                                        <td className="p-3 text-right">{formatCurrency(inv["Total Invested Cost"])}</td>
                                        <td className="p-3 text-right">{formatCurrency(inv["Carrying Value"])}</td>
                                        <td className="p-3 text-right">{formatCurrency(inv["Realized Proceeds"])}</td>
                                        <td className="p-3 text-right font-medium">{formatCurrency(inv["Total Value"])}</td>
                                        <td className="p-3 text-right">
                                            <span className={Number(inv["Gross MOIC"]) > 1 ? "text-green-600 font-medium" : ""}>
                                                {formatMultiple(inv["Gross MOIC"])}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            {typeof inv["Last Post Money Value"] === "number"
                                                ? formatCurrency(inv["Last Post Money Value"])
                                                : inv["Last Post Money Value"] || "-"}
                                        </td>
                                        <td className="p-3 text-right">
                                            {typeof inv["Current SV Company Value"] === "number"
                                                ? formatCurrency(inv["Current SV Company Value"])
                                                : inv["Current SV Company Value"] || "-"}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr key={`${companyName}-expanded`} className="bg-blue-50/50 border-t-2 border-blue-200">
                                            <td colSpan={13} className="p-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">Company Details</h4>
                                                        <div className="space-y-1">
                                                            <div><span className="text-gray-500">Full Name:</span> <span className="font-medium">{inv["Company"]}</span></div>
                                                            <div><span className="text-gray-500">Website:</span> <span className="text-blue-600">{inv["Website"]}</span></div>
                                                            <div><span className="text-gray-500">HQ:</span> {inv["HQ"]}</div>
                                                            <div><span className="text-gray-500">Sector:</span> {inv["Sector"]}</div>
                                                            <div><span className="text-gray-500">Initial Series:</span> {inv["Series"]}</div>
                                                            <div><span className="text-gray-500">Initial Investment:</span> {formatCurrency(inv["$ Invested"])}</div>
                                                            {inv["VC Syndicate"] && (
                                                                <div><span className="text-gray-500">VC Syndicate:</span> {inv["VC Syndicate"]}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                                                        <div className="space-y-1">
                                                            {inv["Red/Yellow/Green Status"] && (
                                                                <div><span className="text-gray-500">Status:</span> {inv["Red/Yellow/Green Status"]}</div>
                                                            )}
                                                            {inv["SV Outlook"] && (
                                                                <div className="mt-2">
                                                                    <span className="text-gray-500">Outlook:</span>
                                                                    <p className="mt-1 text-gray-700">{inv["SV Outlook"]}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                                        <p className="text-gray-700">{inv["Description"]}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
