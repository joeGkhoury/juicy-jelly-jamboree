
import { FinancialData } from '../types/financial';
import { API_CONFIG } from '../config/api';

// Fetch real financial data from Financial Modeling Prep API
export const fetchStockData = async (ticker: string): Promise<FinancialData> => {
  console.log(`Fetching REAL financial data for ${ticker} using API key: ${API_CONFIG.API_KEY.substring(0, 8)}...`);
  
  try {
    // Fetch multiple endpoints in parallel, including cash flow statement for CAPEX
    const [
      profileResponse,
      metricsResponse,
      financialsResponse,
      balanceSheetResponse,
      cashFlowResponse
    ] = await Promise.all([
      fetch(`${API_CONFIG.BASE_URL}/profile/${ticker}?apikey=${API_CONFIG.API_KEY}`),
      fetch(`${API_CONFIG.BASE_URL}/key-metrics/${ticker}?apikey=${API_CONFIG.API_KEY}&limit=1`),
      fetch(`${API_CONFIG.BASE_URL}/income-statement/${ticker}?apikey=${API_CONFIG.API_KEY}&limit=1`),
      fetch(`${API_CONFIG.BASE_URL}/balance-sheet-statement/${ticker}?apikey=${API_CONFIG.API_KEY}&limit=1`),
      fetch(`${API_CONFIG.BASE_URL}/cash-flow-statement/${ticker}?apikey=${API_CONFIG.API_KEY}&limit=1`)
    ]);

    // Check for API errors
    if (!profileResponse.ok) {
      if (profileResponse.status === 401) {
        throw new Error(`API key invalid or expired. Please check your API key.`);
      }
      if (profileResponse.status === 429) {
        throw new Error(`API rate limit exceeded. Please try again later.`);
      }
      throw new Error(`Company not found: ${ticker}. Please verify the ticker symbol.`);
    }

    const [profile, metrics, financials, balanceSheet, cashFlow] = await Promise.all([
      profileResponse.json(),
      metricsResponse.json(),
      financialsResponse.json(),
      balanceSheetResponse.json(),
      cashFlowResponse.json()
    ]);

    console.log('Raw API response for profile:', profile);
    console.log('Raw API response for metrics:', metrics);
    console.log('Raw API response for financials:', financials);
    console.log('Raw API response for cash flow:', cashFlow);

    const companyProfile = profile[0];
    const keyMetrics = metrics[0] || {};
    const incomeStatement = financials[0] || {};
    const balanceSheetData = balanceSheet[0] || {};
    const cashFlowData = cashFlow[0] || {};

    if (!companyProfile) {
      throw new Error(`No data found for ticker: ${ticker}. The company may not be publicly traded.`);
    }

    console.log(`✅ REAL DATA FETCHED from Financial Modeling Prep API for ${ticker}`);
    console.log('Company Profile Data:', {
      companyName: companyProfile.companyName,
      price: companyProfile.price,
      mktCap: companyProfile.mktCap,
      beta: companyProfile.beta
    });

    // Extract real financial data with validation
    const marketCap = companyProfile.mktCap || 0;
    const currentPrice = companyProfile.price || 0;
    
    // CORRECTED: Use weighted average shares from income statement, not trading volume
    const sharesOutstanding = incomeStatement.weightedAverageShsOutDil || incomeStatement.weightedAverageShsOut || (marketCap / currentPrice) || 0;
    
    // Income statement data
    const revenue = incomeStatement.revenue || 0;
    const ebit = incomeStatement.operatingIncome || incomeStatement.ebitda || 0;
    const netIncome = incomeStatement.netIncome || 0;
    const depreciation = Math.abs(incomeStatement.depreciationAndAmortization || 0);
    
    // Balance sheet data
    const totalDebt = balanceSheetData.totalDebt || keyMetrics.totalDebt || 0;
    const cash = balanceSheetData.cashAndCashEquivalents || balanceSheetData.cashAndShortTermInvestments || 0;
    const totalAssets = balanceSheetData.totalAssets || 0;
    const totalEquity = balanceSheetData.totalStockholdersEquity || 0;
    
    // Key metrics
    const beta = companyProfile.beta || 1.0;
    const bookValue = keyMetrics.bookValuePerShare || (totalEquity / sharesOutstanding) || 0;
    
    // CORRECTED: Get Capex from Cash Flow statement. It was incorrectly reading as 0 before.
    const capex = Math.abs(cashFlowData.capitalExpenditure || keyMetrics.capitalExpenditure || 0);
    const workingCapital = keyMetrics.workingCapital || 0;

    const data: FinancialData = {
      symbol: ticker.toUpperCase(),
      companyName: companyProfile.companyName || `${ticker} Corporation`,
      marketCap,
      currentPrice,
      sharesOutstanding,
      totalDebt,
      cash,
      revenue,
      ebit,
      netIncome,
      totalAssets,
      totalEquity,
      beta,
      bookValue,
      depreciation,
      capex,
      workingCapital
    };

    console.log(`🎯 REAL financial data successfully processed for ${ticker}:`);
    console.log('📊 Key metrics:', {
      symbol: data.symbol,
      companyName: data.companyName,
      marketCap: `$${(data.marketCap / 1000000000).toFixed(1)}B`,
      currentPrice: `$${data.currentPrice.toFixed(2)}`,
      revenue: `$${(data.revenue / 1000000000).toFixed(1)}B`,
      sharesOutstanding: `${(data.sharesOutstanding / 1000000000).toFixed(2)}B`,
      capex: `$${(data.capex / 1000000).toFixed(1)}M`,
      dataSource: 'Financial Modeling Prep API'
    });

    // Validate that we got real data
    if (data.marketCap === 0 || data.currentPrice === 0 || data.sharesOutstanding === 0) {
      console.warn('⚠️ Some key financial data is missing or zero, which may cause calculation errors.');
      if (sharesOutstanding === 0) {
        throw new Error('Could not determine shares outstanding. Valuation is not possible.');
      }
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching REAL stock data:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error(`API Authentication Failed: ${error.message}`);
    }
    
    throw new Error(`Failed to fetch real data for ${ticker}. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the ticker symbol and your internet connection.`);
  }
};
