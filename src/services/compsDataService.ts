
import { API_CONFIG } from '../config/api';
import { FinancialData } from '../types/financial';

export const fetchHistoricalData = async (ticker: string) => {
  console.log(`Fetching 10-year historical data for ${ticker}`);
  
  try {
    const [
      incomeStatements,
      balanceSheets,
      cashFlows,
      keyMetrics,
      ratios,
      profile
    ] = await Promise.all([
      fetch(`${API_CONFIG.BASE_URL}/income-statement/${ticker}?limit=10&apikey=${API_CONFIG.API_KEY}`),
      fetch(`${API_CONFIG.BASE_URL}/balance-sheet-statement/${ticker}?limit=10&apikey=${API_CONFIG.API_KEY}`),
      fetch(`${API_CONFIG.BASE_URL}/cash-flow-statement/${ticker}?limit=10&apikey=${API_CONFIG.API_KEY}`),
      fetch(`${API_CONFIG.BASE_URL}/key-metrics/${ticker}?limit=10&apikey=${API_CONFIG.API_KEY}`),
      fetch(`${API_CONFIG.BASE_URL}/ratios/${ticker}?limit=10&apikey=${API_CONFIG.API_KEY}`),
      fetch(`${API_CONFIG.BASE_URL}/profile/${ticker}?apikey=${API_CONFIG.API_KEY}`)
    ]);

    const [income, balance, cashFlow, metrics, ratioData, profileData] = await Promise.all([
      incomeStatements.json(),
      balanceSheets.json(),
      cashFlows.json(),
      keyMetrics.json(),
      ratios.json(),
      profile.json()
    ]);

    console.log('Historical data fetched successfully');

    return {
      incomeStatements: income,
      balanceSheets: balance,
      cashFlows: cashFlow,
      keyMetrics: metrics,
      ratios: ratioData,
      profile: profileData[0] || {}
    };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

export const fetchPeerData = async (ticker: string, stockData: FinancialData) => {
  console.log(`Fetching peer data for ${ticker}`);
  
  try {
    // Get company profile to determine sector/industry
    const profileResponse = await fetch(`${API_CONFIG.BASE_URL}/profile/${ticker}?apikey=${API_CONFIG.API_KEY}`);
    const profile = await profileResponse.json();
    const sector = profile[0]?.sector || '';
    const industry = profile[0]?.industry || '';
    
    // Get sector peers using stock screener (more efficient than individual calls)
    const peersResponse = await fetch(`${API_CONFIG.BASE_URL}/stock-screener?sector=${sector}&marketCapMoreThan=1000000000&limit=15&apikey=${API_CONFIG.API_KEY}`);
    const peers = await peersResponse.json();
    
    // Filter out the current company and get top peers by market cap
    const peerTickers = peers
      .filter((peer: any) => peer.symbol !== ticker && peer.symbol !== null)
      .slice(0, 8)
      .map((peer: any) => peer.symbol);

    console.log('Peer tickers found:', peerTickers);

    if (peerTickers.length === 0) {
      return {
        sector,
        industry,
        peers: []
      };
    }

    // Use batch API calls instead of individual calls - join tickers with comma
    const tickerList = peerTickers.join(',');
    
    try {
      const [profilesResp, metricsResp, ratiosResp, quotesResp] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/profile/${tickerList}?apikey=${API_CONFIG.API_KEY}`),
        fetch(`${API_CONFIG.BASE_URL}/key-metrics/${tickerList}?limit=1&apikey=${API_CONFIG.API_KEY}`),
        fetch(`${API_CONFIG.BASE_URL}/ratios/${tickerList}?limit=1&apikey=${API_CONFIG.API_KEY}`),
        fetch(`${API_CONFIG.BASE_URL}/quote/${tickerList}?apikey=${API_CONFIG.API_KEY}`)
      ]);

      const [profiles, metrics, ratiosData, quotes] = await Promise.all([
        profilesResp.json(),
        metricsResp.json(),
        ratiosResp.json(),
        quotesResp.json()
      ]);

      // Group data by ticker
      const peerData = peerTickers.map(symbol => {
        const peerProfile = profiles.find((p: any) => p.symbol === symbol) || {};
        const peerMetrics = metrics.find((m: any) => m.symbol === symbol) || {};
        const peerRatios = ratiosData.find((r: any) => r.symbol === symbol) || {};
        const peerQuote = quotes.find((q: any) => q.symbol === symbol) || {};

        return {
          symbol,
          profile: peerProfile,
          metrics: peerMetrics,
          ratios: peerRatios,
          quote: peerQuote
        };
      }).filter(peer => peer.profile.companyName); // Filter out any with missing data

      console.log(`Peer data fetched successfully for ${peerData.length} companies`);

      return {
        sector,
        industry,
        peers: peerData
      };
    } catch (batchError) {
      console.error('Batch API failed, falling back to individual calls:', batchError);
      
      // Fallback to individual calls if batch fails
      const peerDataPromises = peerTickers.slice(0, 5).map(async (peerTicker: string) => {
        try {
          const [profileResp, metricsResp, ratiosResp] = await Promise.all([
            fetch(`${API_CONFIG.BASE_URL}/profile/${peerTicker}?apikey=${API_CONFIG.API_KEY}`),
            fetch(`${API_CONFIG.BASE_URL}/key-metrics/${peerTicker}?limit=1&apikey=${API_CONFIG.API_KEY}`),
            fetch(`${API_CONFIG.BASE_URL}/ratios/${peerTicker}?limit=1&apikey=${API_CONFIG.API_KEY}`)
          ]);

          const [peerProfile, peerMetrics, peerRatios] = await Promise.all([
            profileResp.json(),
            metricsResp.json(),
            ratiosResp.json()
          ]);

          return {
            symbol: peerTicker,
            profile: peerProfile[0] || {},
            metrics: peerMetrics[0] || {},
            ratios: peerRatios[0] || {}
          };
        } catch (error) {
          console.error(`Error fetching data for peer ${peerTicker}:`, error);
          return null;
        }
      });

      const peerResults = await Promise.all(peerDataPromises);
      const validPeers = peerResults.filter(peer => peer !== null);

      return {
        sector,
        industry,
        peers: validPeers
      };
    }
  } catch (error) {
    console.error('Error fetching peer data:', error);
    throw error;
  }
};
