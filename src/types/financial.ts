export interface FinancialData {
  symbol: string;
  companyName: string;
  marketCap: number;
  currentPrice: number;
  sharesOutstanding: number;
  totalDebt: number;
  cash: number;
  revenue: number;
  ebit: number;
  netIncome: number;
  totalAssets: number;
  totalEquity: number;
  beta: number;
  bookValue: number;
  depreciation: number;
  capex: number;
  workingCapital: number;
  
  // Additional properties for investment memos
  grossProfit?: number;
  operatingIncome?: number;
  freeCashFlow?: number;
  peRatio?: number;
  priceToBook?: number;
  roe?: number;
  roa?: number;
  currentRatio?: number;
  debtToEquity?: number;
  dividendYield?: number;
}

export interface DCFAssumptions {
  revenueGrowthRates: number[]; // 5-year growth rates
  ebitMargin: number;
  taxRate: number;
  depreciation: number; // as % of revenue
  capexRate: number; // as % of revenue
  nwcRate: number; // working capital change as % of revenue
  terminalGrowthRate: number;
  marketRiskPremium: number;
  riskFreeRate: number;
}

export interface DCFResults {
  wacc: number;
  projectedFCF: number[];
  terminalValue: number;
  presentValueFCF: number[];
  presentValueTerminal: number;
  enterpriseValue: number;
  equityValue: number;
  intrinsicValuePerShare: number;
  currentPrice: number;
  upside: number;
}

export interface WACCCalculation {
  costOfEquity: number;
  costOfDebt: number;
  wacc: number;
  marketValue: number;
  debtRatio: number;
  equityRatio: number;
}
