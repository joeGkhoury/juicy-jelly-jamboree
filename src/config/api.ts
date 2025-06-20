
// Financial Modeling Prep API Configuration
// Get your free API key at: https://financialmodelingprep.com/developer/docs
export const API_CONFIG = {
  // Your actual API key for full access
  API_KEY: 'Y2ygatpLwsTjRzKJwUv15ATd5bbIFHdj',
  BASE_URL: 'https://financialmodelingprep.com/api/v3',
  
  // Rate limiting for your plan
  RATE_LIMIT: {
    REQUESTS_PER_DAY: 250,
    REQUESTS_PER_MINUTE: 10
  }
};

// Alternative: Yahoo Finance (unofficial, may be unreliable)
export const YAHOO_CONFIG = {
  BASE_URL: 'https://query1.finance.yahoo.com/v8/finance/chart',
  // Note: Yahoo Finance doesn't provide comprehensive financial statements
  // Only basic price and volume data
};
