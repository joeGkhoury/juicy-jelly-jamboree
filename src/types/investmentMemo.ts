
export interface InvestmentMemo {
  companySummary: string;
  financialOverview: string;
  valuationSummary: string;
  investmentThesis: string;
  riskFactors: string;
  catalysts: string;
  moatAnalysis: string;
  generatedAt: Date;
  userInstructions?: string;
}

export interface MemoGenerationRequest {
  ticker: string;
  companyName: string;
  financialData: any;
  userInstructions?: string;
}
