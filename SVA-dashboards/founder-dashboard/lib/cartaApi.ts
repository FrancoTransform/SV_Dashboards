/**
 * Carta API Client for Next.js
 * Handles authentication and data fetching from Carta's Investor API
 */

interface CartaFirm {
  id: string;
  name: string;
}

interface CartaFund {
  firmId: string;
  id: string;
  name: string;
}

interface CartaInvestment {
  firmId: string;
  fundId: string;
  companyId: string;
  legalName: string;
  doingBusinessAsName?: string;
  website?: string;
  country?: string;
  stateOfIncorporation?: { value: string };
  cartaCompany: boolean;
  referenceCapTableId?: string;
  _fund_name?: string;
  _fund_id?: string;
  _firm_name?: string;
  _firm_id?: string;
}

interface CartaData {
  firms: CartaFirm[];
  funds: CartaFund[];
  investments: CartaInvestment[];
}

// API credentials
const CARTA_CLIENT_ID = process.env.CARTA_CLIENT_ID || '1TJ62V2zyOJoO3G81unUwP3LeCJIjBvlHxqrDnSh';
const CARTA_CLIENT_SECRET = process.env.CARTA_CLIENT_SECRET || 'esC84CY54LvFbYTJ8d5cGF8hZolnW6zb7EMsY2bktYmIj5w530wFaE4cVfLdn2lfbQ7Ny7KFGSxbFJnamUaIDGsPPjf1UOTpLDapf8ahPzdiw6Qi5Pb1fXs2rTeFEMZl';
const CARTA_TOKEN_URL = 'https://login.app.carta.com/o/access_token/';
const CARTA_API_BASE = 'https://api.carta.com';

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Authenticate with Carta API and get access token
 */
export async function getCartaAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${CARTA_CLIENT_ID}:${CARTA_CLIENT_SECRET}`).toString('base64');
  
  const scopes = [
    'read_investor_investments',
    'read_investor_capitalizationtables',
    'read_investor_firms',
    'read_investor_cashbalances',
    'read_investor_fundperformance',
    'read_investor_funds',
    'read_investor_securities',
    'read_investor_stakeholdercapitalizationtable'
  ];

  const response = await fetch(CARTA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: scopes.join(' ')
    })
  });

  if (!response.ok) {
    throw new Error(`Carta authentication failed: ${response.statusText}`);
  }

  const data = await response.json();
  const expiresIn = data.expires_in || 3600; // Default 1 hour
  
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (expiresIn * 1000) - 60000 // Refresh 1 min before expiry
  };

  return cachedToken.token;
}

/**
 * Make authenticated request to Carta API
 */
async function cartaRequest<T>(endpoint: string): Promise<T | null> {
  try {
    const token = await getCartaAccessToken();
    
    const response = await fetch(`${CARTA_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Carta API error: ${endpoint} - ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`Carta API request failed: ${endpoint}`, error);
    return null;
  }
}

/**
 * Fetch all data from Carta API
 */
export async function fetchCartaData(): Promise<CartaData> {
  const result: CartaData = {
    firms: [],
    funds: [],
    investments: []
  };

  // Step 1: Get Firms
  const firmsData = await cartaRequest<{ firms: CartaFirm[] }>('/v1alpha1/investors/firms');
  if (!firmsData?.firms?.length) {
    return result;
  }
  result.firms = firmsData.firms;

  // Step 2: Get Funds and Investments for each firm
  for (const firm of result.firms) {
    const fundsData = await cartaRequest<{ funds: CartaFund[] }>(
      `/v1alpha1/investors/firms/${firm.id}/funds`
    );
    
    if (fundsData?.funds) {
      result.funds.push(...fundsData.funds);
      
      // Get investments for each fund
      for (const fund of fundsData.funds) {
        const investmentsData = await cartaRequest<{ investments: CartaInvestment[] }>(
          `/v1alpha1/investors/firms/${firm.id}/funds/${fund.id}/investments`
        );
        
        if (investmentsData?.investments) {
          const enrichedInvestments = investmentsData.investments.map(inv => ({
            ...inv,
            _fund_name: fund.name,
            _fund_id: fund.id,
            _firm_name: firm.name,
            _firm_id: firm.id
          }));
          result.investments.push(...enrichedInvestments);
        }
      }
    }
  }

  return result;
}

export type { CartaFirm, CartaFund, CartaInvestment, CartaData };

