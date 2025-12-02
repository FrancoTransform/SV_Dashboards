import { NextResponse } from 'next/server';
import { fetchCartaData, CartaData } from '@/lib/cartaApi';

// Fund name mapping from Carta to our internal naming
const FUND_MAPPING: Record<string, string> = {
  'SemperVirens Capital Fund LP': 'fundI',
  'SemperVirens Capital Fund II LP': 'fundII',
  'SemperVirens Capital Fund III LP': 'fundIII',
  'SemperVirens Capital Fund III NQP LP': 'fundIII',
  'SV Growth Opportunity Fund II LP': 'gofII',
  'SV Growth Opportunity Fund II NQP LP': 'gofII',
  'SV Opportunity Fund I LP': 'gofI',
};

// State code to full name mapping
const STATE_NAMES: Record<string, string> = {
  'US-DE': 'Delaware',
  'US-CA': 'California',
  'US-NY': 'New York',
  'US-TX': 'Texas',
  'US-WA': 'Washington',
  'US-MA': 'Massachusetts',
  'US-FL': 'Florida',
  'US-IL': 'Illinois',
  'US-CO': 'Colorado',
  'US-PA': 'Pennsylvania',
  'US-GA': 'Georgia',
  'US-NC': 'North Carolina',
  'US-NJ': 'New Jersey',
  'US-VA': 'Virginia',
  'US-AZ': 'Arizona',
  'US-MD': 'Maryland',
  'US-OR': 'Oregon',
  'US-NV': 'Nevada',
  'US-UT': 'Utah',
  'US-MN': 'Minnesota',
  'US-OH': 'Ohio',
  'US-MI': 'Michigan',
  'US-TN': 'Tennessee',
  'US-MO': 'Missouri',
  'US-SC': 'South Carolina',
  'US-IN': 'Indiana',
  'US-WI': 'Wisconsin',
  'US-CT': 'Connecticut',
  'US-KY': 'Kentucky',
  'US-LA': 'Louisiana',
  'US-OK': 'Oklahoma',
  'US-AL': 'Alabama',
  'US-IA': 'Iowa',
  'US-KS': 'Kansas',
  'US-NE': 'Nebraska',
  'US-DC': 'Washington D.C.',
};

// Normalize company name for deduplication
function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/,?\s*(inc\.?|llc|ltd|corp\.?|corporation|company|co\.?|pbc)$/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export async function GET() {
  try {
    // Fetch live data from Carta API
    const cartaData: CartaData = await fetchCartaData();

    // Create portfolio data from Carta only
    const portfolioData: Record<string, any[]> = {
      fundI: [],
      fundII: [],
      fundIII: [],
      gofI: [],
      gofII: [],
    };

    // Location statistics
    const locationCounts: Record<string, number> = {};
    const seenCompanies = new Set<string>();

    // Process Carta investments
    for (const investment of cartaData.investments) {
      const fundKey = FUND_MAPPING[investment._fund_name || ''];
      if (!fundKey) continue;

      // Get display name
      const displayName = investment.doingBusinessAsName ||
        investment.legalName.replace(/,?\s*(Inc\.?|LLC|Ltd|Corp\.?|Corporation)$/i, '');

      const normalizedName = normalizeCompanyName(displayName);

      // Track location (by state of incorporation)
      const stateCode = investment.stateOfIncorporation?.value || '';
      const stateName = STATE_NAMES[stateCode] || stateCode || 'Unknown';

      // Only count each company once for location stats
      if (!seenCompanies.has(normalizedName) && stateName !== 'Unknown') {
        locationCounts[stateName] = (locationCounts[stateName] || 0) + 1;
        seenCompanies.add(normalizedName);
      }

      // Avoid duplicates within the same fund
      const existingIndex = portfolioData[fundKey].findIndex(
        c => normalizeCompanyName(c.Company) === normalizedName
      );

      if (existingIndex === -1) {
        portfolioData[fundKey].push({
          Company: displayName,
          legalName: investment.legalName,
          website: investment.website,
          stateOfIncorporation: stateCode,
          stateName: stateName,
          cartaCompany: investment.cartaCompany,
          companyId: investment.companyId,
          fundName: investment._fund_name,
          fundId: investment.fundId,
          firmId: investment.firmId,
        });
      }
    }

    // Sort locations by count descending
    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    // Count totals
    const totalInvestments = Object.values(portfolioData).reduce((sum, arr) => sum + arr.length, 0);

    return NextResponse.json({
      success: true,
      data: portfolioData,
      analytics: {
        topLocations,
        totalInvestments,
        investmentsByFund: {
          fundI: portfolioData.fundI.length,
          fundII: portfolioData.fundII.length,
          fundIII: portfolioData.fundIII.length,
          gofI: portfolioData.gofI.length,
          gofII: portfolioData.gofII.length,
        },
      },
      metadata: {
        source: 'carta_api',
        cartaFirms: cartaData.firms.length,
        cartaFunds: cartaData.funds.length,
        cartaInvestments: cartaData.investments.length,
        lastUpdated: new Date().toISOString(),
        dataNote: 'Investment categories and co-investors are not available via Carta API'
      }
    });

  } catch (error) {
    console.error('Carta API error:', error);
    return NextResponse.json({
      success: false,
      data: { fundI: [], fundII: [], fundIII: [], gofI: [], gofII: [] },
      analytics: { topLocations: [], totalInvestments: 0, investmentsByFund: {} },
      error: error instanceof Error ? error.message : 'Failed to fetch Carta data',
      metadata: {
        source: 'error',
        lastUpdated: new Date().toISOString()
      }
    });
  }
}

