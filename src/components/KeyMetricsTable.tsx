import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { FinancialData } from '../types/financial';

interface KeyMetricsTableProps {
  stockData: FinancialData;
  historicalData: any;
  loading: boolean;
}

const KeyMetricsTable: React.FC<KeyMetricsTableProps> = ({ stockData, historicalData, loading }) => {
  if (loading) {
    return (
      <Card className="bg-white border-[#DDDDDD]">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-white rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!historicalData) {
    return (
      <Card className="bg-white border-[#DDDDDD]">
        <CardContent className="p-6 text-center">
          <p className="text-[#777]">No data available for metrics calculation</p>
        </CardContent>
      </Card>
    );
  }

  // Get latest data
  const latestFinancials = historicalData.incomeStatements?.[0] || {};
  const latestBalance = historicalData.balanceSheets?.[0] || {};
  const latestMetrics = historicalData.keyMetrics?.[0] || {};
  const latestRatios = historicalData.ratios?.[0] || {};
  const profile = historicalData.profile || {};

  // Calculate key metrics
  const pe = stockData.currentPrice / (latestFinancials.eps || 1);
  const pb = stockData.currentPrice / (latestMetrics.bookValuePerShare || 1);
  const ps = stockData.marketCap / (latestFinancials.revenue || 1);
  const evEbitda = (stockData.marketCap + stockData.totalDebt - stockData.cash) / (latestFinancials.ebitda || 1);
  const fcfYield = ((historicalData.cashFlows?.[0]?.freeCashFlow || 0) / stockData.marketCap) * 100;
  const roe = latestMetrics.roe * 100 || 0;
  const roa = latestMetrics.roa * 100 || 0;
  const roic = latestMetrics.roic * 100 || 0;
  const debtEquity = latestRatios.debtEquityRatio || 0;
  const dividendYield = profile.lastDiv ? (profile.lastDiv / stockData.currentPrice) * 100 : 0;
  const payoutRatio = latestRatios.payoutRatio * 100 || 0;
  const pegRatio = latestMetrics.pegRatio || 0;

  // Buffett-style evaluation criteria
  const getBuffettScore = (metric: string, value: number) => {
    const criteria: { [key: string]: { excellent: number; good: number; type: 'higher' | 'lower' } } = {
      roe: { excellent: 20, good: 15, type: 'higher' },
      roa: { excellent: 10, good: 7, type: 'higher' },
      roic: { excellent: 15, good: 10, type: 'higher' },
      debtEquity: { excellent: 0.3, good: 0.5, type: 'lower' },
      pe: { excellent: 15, good: 25, type: 'lower' },
      pb: { excellent: 2, good: 3, type: 'lower' },
      fcfYield: { excellent: 8, good: 5, type: 'higher' }
    };

    const criterion = criteria[metric];
    if (!criterion) return 'neutral';

    if (criterion.type === 'higher') {
      if (value >= criterion.excellent) return 'excellent';
      if (value >= criterion.good) return 'good';
      return 'poor';
    } else {
      if (value <= criterion.excellent) return 'excellent';
      if (value <= criterion.good) return 'good';
      return 'poor';
    }
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'good': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'poor': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <div className="w-4 h-4 bg-white rounded-full" />;
    }
  };

  const getScoreBadge = (score: string) => {
    const variants: { [key: string]: any } = {
      excellent: { className: "bg-emerald-600 text-white", label: "Excellent" },
      good: { className: "bg-yellow-600 text-white", label: "Good" },
      poor: { className: "bg-red-600 text-white", label: "Poor" },
      neutral: { className: "bg-white text-[#777]", label: "Neutral" }
    };
    const variant = variants[score] || variants.neutral;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const metrics = [
    { label: 'Price-to-Earnings (P/E)', value: pe.toFixed(2), score: getBuffettScore('pe', pe), category: 'Valuation' },
    { label: 'Price-to-Book (P/B)', value: pb.toFixed(2), score: getBuffettScore('pb', pb), category: 'Valuation' },
    { label: 'Price-to-Sales (P/S)', value: ps.toFixed(2), score: 'neutral', category: 'Valuation' },
    { label: 'EV/EBITDA', value: evEbitda.toFixed(2), score: 'neutral', category: 'Valuation' },
    { label: 'Free Cash Flow Yield (%)', value: fcfYield.toFixed(2), score: getBuffettScore('fcfYield', fcfYield), category: 'Valuation' },
    { label: 'Return on Equity (ROE) %', value: roe.toFixed(2), score: getBuffettScore('roe', roe), category: 'Profitability' },
    { label: 'Return on Assets (ROA) %', value: roa.toFixed(2), score: getBuffettScore('roa', roa), category: 'Profitability' },
    { label: 'Return on Invested Capital (ROIC) %', value: roic.toFixed(2), score: getBuffettScore('roic', roic), category: 'Profitability' },
    { label: 'Debt-to-Equity', value: debtEquity.toFixed(2), score: getBuffettScore('debtEquity', debtEquity), category: 'Financial Health' },
    { label: 'Current Ratio', value: (latestRatios.currentRatio || 0).toFixed(2), score: 'neutral', category: 'Financial Health' },
    { label: 'Quick Ratio', value: (latestRatios.quickRatio || 0).toFixed(2), score: 'neutral', category: 'Financial Health' },
    { label: 'Interest Coverage', value: (latestRatios.interestCoverage || 0).toFixed(1), score: 'neutral', category: 'Financial Health' },
    { label: 'Dividend Yield (%)', value: dividendYield.toFixed(2), score: 'neutral', category: 'Returns' },
    { label: 'Payout Ratio (%)', value: payoutRatio.toFixed(2), score: 'neutral', category: 'Returns' },
    { label: 'PEG Ratio', value: pegRatio.toFixed(2), score: 'neutral', category: 'Growth' },
  ];

  const categories = ['Valuation', 'Profitability', 'Financial Health', 'Returns', 'Growth'];

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <Card key={category} className="bg-white border-[#DDDDDD]">
          <CardHeader>
            <CardTitle className="text-[#333]">{category} Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.filter(m => m.category === category).map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-subtle">
                  <div className="flex items-center space-x-3">
                    {getScoreIcon(metric.score)}
                    <span className="text-[#777] font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[#333] text-lg font-bold">{metric.value}</span>
                    {getScoreBadge(metric.score)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Summary Score */}
      <Card className="bg-gradient-to-r from-blue-800 to-indigo-800 border-blue-600">
        <CardHeader>
          <CardTitle className="text-[#333]">Buffett-Style Investment Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-blue-100 text-sm">Excellent Metrics</p>
              <p className="text-[#333] text-2xl font-bold">
                {metrics.filter(m => m.score === 'excellent').length}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Good Metrics</p>
              <p className="text-[#333] text-2xl font-bold">
                {metrics.filter(m => m.score === 'good').length}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Poor Metrics</p>
              <p className="text-[#333] text-2xl font-bold">
                {metrics.filter(m => m.score === 'poor').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyMetricsTable;
