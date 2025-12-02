'use client';

import { useState, useEffect } from 'react';

interface PortfolioCompany {
  Company: string;
  legalName?: string;
  website?: string;
  stateOfIncorporation?: string;
  stateName?: string;
  cartaCompany?: boolean;
  companyId?: string;
  fundName?: string;
  fundId?: string;
  firmId?: string;
  [key: string]: any;
}

interface PortfolioData {
  fundI: PortfolioCompany[];
  fundII: PortfolioCompany[];
  fundIII: PortfolioCompany[];
  gofI: PortfolioCompany[];
  gofII: PortfolioCompany[];
}

interface LocationData {
  location: string;
  count: number;
}

interface Analytics {
  topLocations: LocationData[];
  totalInvestments: number;
  investmentsByFund: Record<string, number>;
}

interface CartaApiResponse {
  success: boolean;
  data: PortfolioData;
  analytics?: Analytics;
  error?: string;
  metadata: {
    source?: string;
    cartaFirms?: number;
    cartaFunds?: number;
    cartaInvestments?: number;
    lastUpdated: string;
    dataNote?: string;
  };
}

interface UseCartaDataReturn {
  data: PortfolioData | null;
  analytics: Analytics | null;
  loading: boolean;
  error: string | null;
  isLiveData: boolean;
  lastUpdated: string | null;
  dataNote: string | null;
  refetch: () => Promise<void>;
}

export function useCartaData(): UseCartaDataReturn {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveData, setIsLiveData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dataNote, setDataNote] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/carta');
      const result: CartaApiResponse = await response.json();

      if (result.success) {
        setData(result.data);
        setAnalytics(result.analytics || null);
        setIsLiveData(result.metadata.source === 'carta_api');
        setLastUpdated(result.metadata.lastUpdated);
        setDataNote(result.metadata.dataNote || null);
      } else {
        setData(result.data);
        setAnalytics(result.analytics || null);
        setIsLiveData(false);
        setError(result.error || 'Failed to fetch live data');
        setLastUpdated(result.metadata.lastUpdated);
      }
    } catch (err) {
      console.error('Error fetching Carta data:', err);
      setError(err instanceof Error ? err.message : 'Network error');
      setData(null);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    analytics,
    loading,
    error,
    isLiveData,
    lastUpdated,
    dataNote,
    refetch: fetchData
  };
}

export type { PortfolioCompany, PortfolioData, Analytics, LocationData };

