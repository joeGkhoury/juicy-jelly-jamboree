import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinancialData, DCFResults, DCFAssumptions } from '../types/financial';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Target, DollarSign, Building, Minus } from 'lucide-react';
import ExcelExportButton from './ExcelExportButton';

interface ValuationSummaryProps {
  financialData: FinancialData;
  dcfResults: DCFResults | null;
  assumptions: DCFAssumptions;
  loading: boolean;
}

const ValuationSummary: React.FC<ValuationSummaryProps> = ({
  financialData,
  dcfResults,
  assumptions,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!dcfResults) {
    return <div>No valuation data available</div>;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000_000) {
      return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  };

  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Data for enterprise to equity value waterfall
  const waterfallData = [
    {
      name: 'Enterprise Value',
      value: dcfResults.enterpriseValue / 1000000,
      fill: '#3b82f6'
    },
    {
      name: 'Less: Total Debt',
      value: -financialData.totalDebt / 1000000,
      fill: '#ef4444'
    },
    {
      name: 'Plus: Cash',
      value: financialData.cash / 1000000,
      fill: '#10b981'
    },
    {
      name: 'Equity Value',
      value: dcfResults.equityValue / 1000000,
      fill: '#8b5cf6'
    }
  ];

  // Value composition pie chart
  const valueComposition = [
    {
      name: 'PV of FCF (Years 1-5)',
      value: dcfResults.presentValueFCF.reduce((sum, pv) => sum + pv, 0),
      color: '#3b82f6'
    },
    {
      name: 'PV of Terminal Value',
      value: dcfResults.presentValueTerminal,
      color: '#8b5cf6'
    }
  ];

  const COLORS = ['#3b82f6', '#8b5cf6'];

  const getUpsideColor = (upside: number) => {
    if (upside > 0.2) return 'text-green-600 bg-green-50 border-green-200';
    if (upside > 0) return 'text-green-500 bg-green-50 border-green-100';
    if (upside > -0.1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getUpsideIcon = (upside: number) => {
    if (upside > 0) return <TrendingUp className="w-4 h-4" />;
    if (upside < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          <h3 className="text-lg font-semibold">Valuation Summary</h3>
        </div>
        <ExcelExportButton
          financialData={financialData}
          dcfResults={dcfResults}
          assumptions={assumptions}
          disabled={loading}
        />
      </div>

      {/* Company Overview */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-slate-800">
            <Building className="w-5 h-5 mr-2" />
            {financialData.companyName} ({financialData.symbol})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-600">Current Price</p>
              <p className="text-xl font-bold text-slate-800">{formatPrice(financialData.currentPrice)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">Market Cap</p>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(financialData.marketCap)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">Beta</p>
              <p className="text-xl font-bold text-slate-800">{financialData.beta.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">WACC</p>
              <p className="text-xl font-bold text-slate-800">{formatPercent(dcfResults.wacc)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Valuation Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-blue-600 font-medium">Enterprise Value</p>
            <p className="text-2xl font-bold text-blue-800">
              {formatCurrency(dcfResults.enterpriseValue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-purple-600 font-medium">Equity Value</p>
            <p className="text-2xl font-bold text-purple-800">
              {formatCurrency(dcfResults.equityValue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-green-600 font-medium">Intrinsic Value</p>
            <p className="text-2xl font-bold text-green-800">
              {formatPrice(dcfResults.intrinsicValuePerShare)}
            </p>
          </CardContent>
        </Card>

        <Card className={`border ${getUpsideColor(dcfResults.upside)}`}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              {getUpsideIcon(dcfResults.upside)}
            </div>
            <p className="text-sm font-medium">Upside/Downside</p>
            <p className="text-2xl font-bold">
              {dcfResults.upside > 0 ? '+' : ''}{formatPercent(dcfResults.upside)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Recommendation */}
      <Card className="border-2 border-slate-200">
        <CardContent className="p-6 text-center">
          <h4 className="text-lg font-semibold mb-4">Investment Recommendation</h4>
          <div className="flex justify-center mb-4">
            {dcfResults.upside > 0.15 && (
              <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                STRONG BUY
              </Badge>
            )}
            {dcfResults.upside > 0 && dcfResults.upside <= 0.15 && (
              <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                BUY
              </Badge>
            )}
            {dcfResults.upside > -0.1 && dcfResults.upside <= 0 && (
              <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                HOLD
              </Badge>
            )}
            {dcfResults.upside <= -0.1 && (
              <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                SELL
              </Badge>
            )}
          </div>
          <p className="text-slate-600">
            Based on DCF analysis, the stock is trading at {formatPrice(financialData.currentPrice)} vs 
            intrinsic value of {formatPrice(dcfResults.intrinsicValuePerShare)}, 
            representing a {Math.abs(dcfResults.upside) > 0.01 ? formatPercent(Math.abs(dcfResults.upside)) : 'fair'} {dcfResults.upside > 0 ? 'upside' : 'downside'}.
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Value Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Enterprise Value Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={valueComposition}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {valueComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Waterfall Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Enterprise to Equity Value Bridge</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={waterfallData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(0)}M`, '']} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValuationSummary;
