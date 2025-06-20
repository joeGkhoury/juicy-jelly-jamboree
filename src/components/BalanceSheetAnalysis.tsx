import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';

interface BalanceSheetAnalysisProps {
  data: any;
  loading: boolean;
}

const BalanceSheetAnalysis: React.FC<BalanceSheetAnalysisProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white border-slate-700 rounded-lg shadow-subtle">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-slate-600 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data || !data.balanceSheets) {
    return (
      <Card className="bg-white border-slate-700 rounded-lg shadow-subtle">
        <CardContent className="p-6 text-center">
          <p className="text-[#777]">No balance sheet data available</p>
        </CardContent>
      </Card>
    );
  }

  // Process balance sheet data
  const processedData = data.balanceSheets
    .slice(0, 10)
    .reverse()
    .map((sheet: any, index: number) => {
      const ratios = data.ratios?.[9 - index] || {};
      const keyMetrics = data.keyMetrics?.[9 - index] || {};
      
      return {
        year: new Date(sheet.date).getFullYear(),
        cash: (sheet.cashAndCashEquivalents || 0) / 1000000000,
        totalDebt: (sheet.totalDebt || 0) / 1000000000,
        netDebt: ((sheet.totalDebt || 0) - (sheet.cashAndCashEquivalents || 0)) / 1000000000,
        debtToEquity: ratios.debtEquityRatio || 0,
        currentRatio: ratios.currentRatio || 0,
        quickRatio: ratios.quickRatio || 0,
        interestCoverage: ratios.interestCoverage || 0,
        workingCapital: ((sheet.totalCurrentAssets || 0) - (sheet.totalCurrentLiabilities || 0)) / 1000000000,
        tangibleBookValue: ((sheet.totalStockholdersEquity || 0) - (sheet.goodwill || 0)) / 1000000000,
        bookValuePerShare: keyMetrics.bookValuePerShare || 0
      };
    });

  // Current financial health indicators
  const currentData = processedData[processedData.length - 1] || {};
  const isHealthy = {
    debtToEquity: currentData.debtToEquity < 0.5,
    currentRatio: currentData.currentRatio > 1.5,
    quickRatio: currentData.quickRatio > 1,
    interestCoverage: currentData.interestCoverage > 5,
    cashPosition: currentData.cash > 0
  };

  const healthScore = Object.values(isHealthy).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className={`${healthScore >= 4 ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 border-emerald-600' : 
                            healthScore >= 3 ? 'bg-gradient-to-r from-yellow-800 to-yellow-700 border-yellow-600' : 
                            'bg-gradient-to-r from-red-800 to-red-700 border-red-600'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#333] text-sm">Health Score</p>
                <p className="text-[#333] text-xl font-bold">{healthScore}/5</p>
              </div>
              {healthScore >= 4 ? <Shield className="w-8 h-8 text-emerald-300" /> : 
               healthScore >= 3 ? <AlertTriangle className="w-8 h-8 text-yellow-300" /> : 
               <TrendingDown className="w-8 h-8 text-red-300" />}
            </div>
          </CardContent>
        </Card>

        <Card className={`${isHealthy.debtToEquity ? 'bg-emerald-800' : 'bg-red-800'} border-slate-700`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#333] text-sm">Debt/Equity</p>
                <p className="text-[#333] text-xl font-bold">{currentData.debtToEquity?.toFixed(2)}</p>
              </div>
              {isHealthy.debtToEquity ? <CheckCircle className="w-6 h-6 text-emerald-300" /> : 
               <AlertTriangle className="w-6 h-6 text-red-300" />}
            </div>
          </CardContent>
        </Card>

        <Card className={`${isHealthy.currentRatio ? 'bg-emerald-800' : 'bg-red-800'} border-slate-700`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#333] text-sm">Current Ratio</p>
                <p className="text-[#333] text-xl font-bold">{currentData.currentRatio?.toFixed(2)}</p>
              </div>
              {isHealthy.currentRatio ? <CheckCircle className="w-6 h-6 text-emerald-300" /> : 
               <AlertTriangle className="w-6 h-6 text-red-300" />}
            </div>
          </CardContent>
        </Card>

        <Card className={`${isHealthy.quickRatio ? 'bg-emerald-800' : 'bg-red-800'} border-slate-700`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#333] text-sm">Quick Ratio</p>
                <p className="text-[#333] text-xl font-bold">{currentData.quickRatio?.toFixed(2)}</p>
              </div>
              {isHealthy.quickRatio ? <CheckCircle className="w-6 h-6 text-emerald-300" /> : 
               <AlertTriangle className="w-6 h-6 text-red-300" />}
            </div>
          </CardContent>
        </Card>

        <Card className={`${isHealthy.interestCoverage ? 'bg-emerald-800' : 'bg-red-800'} border-slate-700`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#333] text-sm">Interest Coverage</p>
                <p className="text-[#333] text-xl font-bold">{currentData.interestCoverage?.toFixed(1)}x</p>
              </div>
              {isHealthy.interestCoverage ? <CheckCircle className="w-6 h-6 text-emerald-300" /> : 
               <AlertTriangle className="w-6 h-6 text-red-300" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cash vs Debt */}
        <Card className="bg-white border-slate-700 rounded-lg shadow-subtle">
          <CardHeader>
            <CardTitle className="text-[#333]">Cash vs Total Debt (Billions)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Area type="monotone" dataKey="cash" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Cash" />
                <Area type="monotone" dataKey="totalDebt" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Total Debt" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Liquidity Ratios */}
        <Card className="bg-white border-slate-700 rounded-lg shadow-subtle">
          <CardHeader>
            <CardTitle className="text-[#333]">Liquidity Ratios</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="currentRatio" stroke="#3B82F6" strokeWidth={3} name="Current Ratio" />
                <Line type="monotone" dataKey="quickRatio" stroke="#8B5CF6" strokeWidth={2} name="Quick Ratio" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Net Debt & Working Capital */}
        <Card className="bg-white border-slate-700 rounded-lg shadow-subtle">
          <CardHeader>
            <CardTitle className="text-[#333]">Net Debt & Working Capital (Billions)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="netDebt" stroke="#EF4444" strokeWidth={3} name="Net Debt" />
                <Line type="monotone" dataKey="workingCapital" stroke="#06B6D4" strokeWidth={3} name="Working Capital" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Book Value Trends */}
        <Card className="bg-white border-slate-700 rounded-lg shadow-subtle">
          <CardHeader>
            <CardTitle className="text-[#333]">Book Value Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="bookValuePerShare" stroke="#F59E0B" strokeWidth={3} name="Book Value per Share" />
                <Line type="monotone" dataKey="tangibleBookValue" stroke="#10B981" strokeWidth={2} name="Tangible Book Value (B)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalanceSheetAnalysis;
