"use client";

import Link from "next/link";
import Image from "next/image";

interface Fund {
    id: string;
    name: string;
    date: string;
}

interface FundSelectorProps {
    funds: Fund[];
    currentFundId?: string;
}

export function FundSelector({ funds, currentFundId }: FundSelectorProps) {
    return (
        <div className="bg-[#1A1A1A] border-b border-gray-800 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Fund Navigation Tabs */}
                    <nav className="flex space-x-1" aria-label="Fund Navigation">
                        {funds.map((fund) => {
                            const isActive = currentFundId === fund.id;
                            const href = fund.id === 'fund-i' ? '/' : `/${fund.id}`;

                            return (
                                <Link
                                    key={fund.id}
                                    href={href}
                                    className={`
                                        group relative px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? 'text-white bg-white/10'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <div className="flex items-center">
                                        <span className={`text-base ${isActive ? 'font-bold' : 'font-medium'}`}>
                                            {fund.name}
                                        </span>
                                    </div>

                                    {/* Active Indicator Line */}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-b-lg shadow-[0_-1px_6px_rgba(59,130,246,0.5)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logo Area (Right) */}
                    <div className="flex-shrink-0 py-2 pl-8 border-l border-gray-800/50">
                        <Link href="/" className="opacity-90 hover:opacity-100 transition-opacity">
                            <Image
                                src="/SV_Logo.svg"
                                alt="SemperVirens"
                                width={180}
                                height={40}
                                className="h-10 w-auto brightness-0 invert"
                                priority
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
