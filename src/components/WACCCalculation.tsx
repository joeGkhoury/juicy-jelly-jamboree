
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialData, DCFAssumptions } from '../types/financial';
import { calculateWACC } from '../utils/dcfCalculations';
import { Calculator, Percent, TrendingUp } from 'lucide-react';

interface WACCCalculationProps {
  financialData: FinancialData;
  assumptions: DCFAssumptions;
  loading: boolean;
}

const WACCCalculation: React.FC<WACCCalculationProps> = ({
  financialData,
  assumptions,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const waccCalc = calculateWACC(financialData, assumptions);

  const formatCurrency = (value: number) => {
    return `$${(value / 1000000000).toFixed(1)}B`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Calculator className="w-5 h-5 mr-2 text-blue-600" />
        <h3 className="text-lg font-semibold">Weighted Average Cost of Capital (WACC)</h3>
      </div>

      {/* Capital Structure */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md flex items-center text-blue-800">
            <TrendingUp className="w-4 h-4 mr-2" />
            Capital Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-slate-600">Market Cap</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(financialData.marketCap)}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-slate-600">Total Debt</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(financialData.totalDebt)}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-slate-600">Equity Weight</p>
              <p className="text-lg font-semibold text-green-600">
                {formatPercent(waccCalc.equityRatio)}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-slate-600">Debt Weight</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatPercent(waccCalc.debtRatio)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Components */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md flex items-center text-green-800">
            <Percent className="w-4 h-4 mr-2" />
            Cost Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-slate-600">Cost of Equity</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatPercent(waccCalc.costOfEquity)}
              </p>
              <p className="text-xs text-slate-500">
                Risk-free rate ({formatPercent(assumptions.riskFreeRate)}) + 
                Beta ({financialData.beta.toFixed(2)}) × 
                Market Risk Premium ({formatPercent(assumptions.marketRiskPremium)})
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-slate-600">Cost of Debt (After-tax)</p>
              <p className="text-lg font-semibold text-red-600">
                {formatPercent(waccCalc.costOfDebt * (1 - assumptions.taxRate))}
              </p>
              <p className="text-xs text-slate-500">
                Pre-tax cost ({formatPercent(waccCalc.costOfDebt)}) × 
                (1 - Tax rate {formatPercent(assumptions.taxRate)})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final WACC */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6 text-center">
          <h4 className="text-lg font-medium text-purple-800 mb-2">Final WACC</h4>
          <p className="text-4xl font-bold text-purple-600 mb-2">
            {formatPercent(waccCalc.wacc)}
          </p>
          <p className="text-sm text-slate-600">
            This discount rate will be used to calculate present values of future cash flows
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WACCCalculation;
