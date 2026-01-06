"use client";

import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { FundData } from "@/types";
import { LogoutButton } from "@/components/logout-button";

interface FundPageProps {
    fundData: FundData;
    fundName: string;
    fundId: string;
}

export function FundPage({ fundData, fundName, fundId }: FundPageProps) {
    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">
                <div className="flex justify-between items-center px-1">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{fundName}</h1>
                        <p className="text-sm text-gray-500">Performance Dashboard • As of {fundData.last_updated}</p>
                    </div>
                    <div className="flex items-center gap-6">

                        <LogoutButton />
                    </div>
                </div>

                <DashboardLayout data={fundData} fundId={fundId} />
            </div>
        </main>
    );
}
