import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, Award } from 'lucide-react';
import { FinancialData } from '../types/financial';

interface BuffettChecklistProps {
  stockData: FinancialData;
  historicalData: any;
  loading: boolean;
  onScoreUpdate?: (score: number) => void;
}

const BuffettChecklist: React.FC<BuffettChecklistProps> = ({ stockData, historicalData, loading, onScoreUpdate }) => {
  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-600 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!historicalData) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6 text-center">
          <p className="text-[#777]">No data available for Buffett analysis</p>
        </CardContent>
      </Card>
    );
  }

  // Analyze historical data for Buffett criteria
  const incomeStatements = historicalData.incomeStatements || [];
  const balanceSheets = historicalData.balanceSheets || [];
  const keyMetrics = historicalData.keyMetrics || [];
  const ratios = historicalData.ratios || [];

  // Calculate criteria
  const consistentEarnings = incomeStatements.filter((s: any) => s.netIncome > 0).length >= Math.min(8, incomeStatements.length * 0.8);
  
  const avgROE = keyMetrics.reduce((sum: number, m: any) => sum + (m.roe || 0), 0) / keyMetrics.length;
  const strongROE = avgROE > 0.15;

  const latestDebtEquity = ratios[0]?.debtEquityRatio || 0;
  const lowDebt = latestDebtEquity < 0.5;

  const positiveFCF = historicalData.cashFlows?.[0]?.freeCashFlow > 0;

  const avgROIC = keyMetrics.reduce((sum: number, m: any) => sum + (m.roic || 0), 0) / keyMetrics.length;
  const strongMoat = avgROIC > 0.15;

  // Check for share buybacks (declining share count)
  const oldestShares = incomeStatements[incomeStatements.length - 1]?.weightedAverageShsOutDil;
  const latestShares = incomeStatements[0]?.weightedAverageShsOutDil;
  const shareBuybacks = oldestShares && latestShares && latestShares < oldestShares;

  // Book value growth
  const oldestBookValue = keyMetrics[keyMetrics.length - 1]?.bookValuePerShare;
  const latestBookValue = keyMetrics[0]?.bookValuePerShare;
  const growingBookValue = oldestBookValue && latestBookValue && latestBookValue > oldestBookValue;

  // Dividend consistency (if applicable)
  const dividendYield = historicalData.profile?.lastDiv ? (historicalData.profile.lastDiv / stockData.currentPrice) : 0;
  const paysDividend = dividendYield > 0;

  // Interest coverage
  const interestCoverage = ratios[0]?.interestCoverage || 0;
  const strongInterestCoverage = interestCoverage > 5;

  // Margin stability (coefficient of variation)
  const operatingMargins = incomeStatements.map((s: any) => s.operatingIncomeRatio || 0);
  const avgMargin = operatingMargins.reduce((sum: number, m: number) => sum + m, 0) / operatingMargins.length;
  const marginStdDev = Math.sqrt(operatingMargins.reduce((sum: number, m: number) => sum + Math.pow(m - avgMargin, 2), 0) / operatingMargins.length);
  const marginStability = avgMargin > 0 ? (marginStdDev / avgMargin) < 0.3 : false;

  const criteria = [
    {
      title: "10+ Years of Consistent Earnings",
      description: "Company has positive earnings in most years",
      passed: consistentEarnings,
      details: `${incomeStatements.filter((s: any) => s.netIncome > 0).length}/${incomeStatements.length} years profitable`
    },
    {
      title: "Consistent ROE > 15%",
      description: "Strong and consistent return on equity",
      passed: strongROE,
      details: `Average ROE: ${(avgROE * 100).toFixed(1)}%`
    },
    {
      title: "Low Debt Levels",
      description: "Conservative debt-to-equity ratio",
      passed: lowDebt,
      details: `Debt/Equity: ${latestDebtEquity.toFixed(2)}`
    },
    {
      title: "Positive Free Cash Flow",
      description: "Generates positive free cash flow",
      passed: positiveFCF,
      details: `Latest FCF: $${((historicalData.cashFlows?.[0]?.freeCashFlow || 0) / 1000000000).toFixed(1)}B`
    },
    {
      title: "Strong Competitive Moat",
      description: "High return on invested capital indicates competitive advantage",
      passed: strongMoat,
      details: `Average ROIC: ${(avgROIC * 100).toFixed(1)}%`
    },
    {
      title: "Share Buyback Program",
      description: "Management returns capital through share repurchases",
      passed: shareBuybacks,
      details: shareBuybacks ? "Shares outstanding declining" : "No clear buyback pattern"
    },
    {
      title: "Growing Book Value",
      description: "Book value per share increases over time",
      passed: growingBookValue,
      details: growingBookValue ? "Book value growing" : "Book value not consistently growing"
    },
    {
      title: "Dividend Track Record",
      description: "Consistent dividend payments (if applicable)",
      passed: paysDividend,
      details: paysDividend ? `Dividend yield: ${dividendYield.toFixed(2)}%` : "No dividends"
    },
    {
      title: "Strong Interest Coverage",
      description: "Ability to service debt obligations",
      passed: strongInterestCoverage,
      details: `Interest coverage: ${interestCoverage.toFixed(1)}x`
    },
    {
      title: "Predictable Business Model",
      description: "Stable operating margins indicate predictable business",
      passed: marginStability,
      details: marginStability ? "Stable margins" : "Volatile margins"
    }
  ];

  const passedCriteria = criteria.filter(c => c.passed).length;
  const totalCriteria = criteria.length;
  const buffettScore = (passedCriteria / totalCriteria) * 100;

  // Update parent component with the score
  useEffect(() => {
    if (onScoreUpdate) {
      onScoreUpdate(buffettScore);
    }
  }, [buffettScore, onScoreUpdate]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-600 to-green-600';
    if (score >= 60) return 'from-yellow-600 to-orange-600';
    return 'from-red-600 to-red-700';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Award className="w-8 h-8 text-emerald-300" />;
    if (score >= 60) return <AlertCircle className="w-8 h-8 text-yellow-300" />;
    return <XCircle className="w-8 h-8 text-red-300" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Investment';
    if (score >= 60) return 'Good Investment';
    if (score >= 40) return 'Fair Investment';
    return 'Poor Investment';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className={`bg-gradient-to-r ${getScoreColor(buffettScore)} border-slate-600`}>
        <CardHeader>
          <CardTitle className="text-[#333] flex items-center justify-between">
            <span>Buffett Investment Score</span>
            {getScoreIcon(buffettScore)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#333] text-4xl font-bold">{buffettScore.toFixed(0)}%</p>
              <p className="text-[#777] text-lg">{getScoreLabel(buffettScore)}</p>
              <p className="text-[#777] text-sm">{passedCriteria} of {totalCriteria} criteria met</p>
            </div>
            <div className="text-right">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
                <span className="text-[#333] text-2xl font-bold">{passedCriteria}/{totalCriteria}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria.map((criterion, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {criterion.passed ? 
                    <CheckCircle className="w-6 h-6 text-emerald-400" /> : 
                    <XCircle className="w-6 h-6 text-red-400" />
                  }
                </div>
                <div className="flex-1">
                  <h3 className="text-[#333] font-semibold mb-1">{criterion.title}</h3>
                  <p className="text-[#777] text-sm mb-2">{criterion.description}</p>
                  <p className={`text-sm font-medium ${criterion.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {criterion.details}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Investment Recommendation */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-[#333]">Investment Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {buffettScore >= 80 && (
              <div className="p-4 bg-emerald-900/30 border border-emerald-600 rounded-lg">
                <h4 className="text-emerald-400 font-semibold mb-2">Strong Buy Candidate</h4>
                <p className="text-[#777]">This company meets most of Buffett's investment criteria and shows strong fundamentals for long-term value investing.</p>
              </div>
            )}
            
            {buffettScore >= 60 && buffettScore < 80 && (
              <div className="p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-2">Moderate Buy Candidate</h4>
                <p className="text-[#777]">This company shows promise but has some areas of concern. Consider the failed criteria carefully before investing.</p>
              </div>
            )}
            
            {buffettScore < 60 && (
              <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg">
                <h4 className="text-red-400 font-semibold mb-2">Proceed with Caution</h4>
                <p className="text-[#777]">This company fails several key Buffett criteria. Consider waiting for better opportunities or significant improvements.</p>
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-[#333] font-semibold mb-3">Key Focus Areas:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-emerald-400 font-medium">Strengths:</span>
                  <ul className="text-[#777] text-sm mt-1 space-y-1">
                    {criteria.filter(c => c.passed).slice(0, 3).map((c, i) => (
                      <li key={i}>• {c.title}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-red-400 font-medium">Areas of Concern:</span>
                  <ul className="text-[#777] text-sm mt-1 space-y-1">
                    {criteria.filter(c => !c.passed).slice(0, 3).map((c, i) => (
                      <li key={i}>• {c.title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuffettChecklist;
