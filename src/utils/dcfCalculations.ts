
import { FinancialData, DCFAssumptions, DCFResults, WACCCalculation } from '../types/financial';

export const calculateWACC = (data: FinancialData, assumptions: DCFAssumptions): WACCCalculation => {
  const marketValue = data.marketCap + data.totalDebt;
  const equityRatio = data.marketCap / marketValue;
  const debtRatio = data.totalDebt / marketValue;
  
  // Cost of Equity = Risk-free rate + Beta * Market Risk Premium
  const costOfEquity = assumptions.riskFreeRate + (data.beta * assumptions.marketRiskPremium);
  
  // Cost of Debt (simplified - assume 4% base rate)
  const costOfDebt = 0.04;
  
  // WACC = (E/V * Re) + (D/V * Rd * (1 - Tax Rate))
  const wacc = (equityRatio * costOfEquity) + (debtRatio * costOfDebt * (1 - assumptions.taxRate));
  
  return {
    costOfEquity,
    costOfDebt,
    wacc,
    marketValue,
    debtRatio,
    equityRatio
  };
};

export const calculateDCF = (data: FinancialData, assumptions: DCFAssumptions): DCFResults => {
  console.log('Starting DCF calculation for:', data.symbol);
  
  // Calculate WACC
  const waccCalc = calculateWACC(data, assumptions);
  console.log('WACC calculated:', waccCalc.wacc);
  
  // Project FCF for 5 years
  const projectedFCF: number[] = [];
  let currentRevenue = data.revenue;
  
  for (let year = 0; year < 5; year++) {
    // Project revenue
    const growthRate = assumptions.revenueGrowthRates[year] || assumptions.revenueGrowthRates[4];
    currentRevenue = currentRevenue * (1 + growthRate);
    
    // Calculate EBIT
    const ebit = currentRevenue * assumptions.ebitMargin;
    
    // Calculate NOPAT (Net Operating Profit After Tax)
    const nopat = ebit * (1 - assumptions.taxRate);
    
    // Calculate D&A
    const depreciation = currentRevenue * assumptions.depreciation;
    
    // Calculate CAPEX
    const capex = currentRevenue * assumptions.capexRate;
    
    // Calculate change in NWC
    const nwcChange = currentRevenue * assumptions.nwcRate;
    
    // FCF = NOPAT + D&A - CAPEX - Change in NWC
    const fcf = nopat + depreciation - capex - nwcChange;
    projectedFCF.push(fcf);
    
    console.log(`Year ${year + 1} FCF: $${(fcf / 1000000).toFixed(1)}M`);
  }
  
  // Calculate Terminal Value using Gordon Growth Model
  const finalYearFCF = projectedFCF[4];
  const terminalFCF = finalYearFCF * (1 + assumptions.terminalGrowthRate);
  const terminalValue = terminalFCF / (waccCalc.wacc - assumptions.terminalGrowthRate);
  
  console.log('Terminal Value:', (terminalValue / 1000000).toFixed(0), 'M');
  
  // Calculate Present Values
  const presentValueFCF: number[] = [];
  for (let year = 0; year < 5; year++) {
    const pv = projectedFCF[year] / Math.pow(1 + waccCalc.wacc, year + 1);
    presentValueFCF.push(pv);
  }
  
  const presentValueTerminal = terminalValue / Math.pow(1 + waccCalc.wacc, 5);
  
  // Calculate Enterprise Value
  const enterpriseValue = presentValueFCF.reduce((sum, pv) => sum + pv, 0) + presentValueTerminal;
  
  console.log('Enterprise Value:', (enterpriseValue / 1000000).toFixed(0), 'M');
  
  // Calculate Equity Value
  const equityValue = enterpriseValue - data.totalDebt + data.cash;
  
  // Calculate Intrinsic Value per Share
  const intrinsicValuePerShare = equityValue / data.sharesOutstanding;
  
  // Calculate upside/downside
  const upside = (intrinsicValuePerShare - data.currentPrice) / data.currentPrice;
  
  console.log('DCF calculation completed');
  console.log('Intrinsic Value per Share:', intrinsicValuePerShare.toFixed(2));
  console.log('Current Price:', data.currentPrice);
  console.log('Upside:', (upside * 100).toFixed(1), '%');
  
  return {
    wacc: waccCalc.wacc,
    projectedFCF,
    terminalValue,
    presentValueFCF,
    presentValueTerminal,
    enterpriseValue,
    equityValue,
    intrinsicValuePerShare,
    currentPrice: data.currentPrice,
    upside
  };
};
