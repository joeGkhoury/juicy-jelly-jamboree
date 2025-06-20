import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, Activity, Target } from 'lucide-react';

interface HistoricalTrendsProps {
  data: any;
  loading: boolean;
}

const HistoricalTrends: React.FC<HistoricalTrendsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white border-[#DDDDDD]">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-white rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-white rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data || !data.incomeStatements) {
    return (
      <Card className="bg-white border-[#DDDDDD]">
        <CardContent className="p-6 text-center">
          <p className="text-[#777]">No historical data available</p>
        </CardContent>
      </Card>
    );
  }

  // Process data for charts
  const processedData = data.incomeStatements
    .slice(0, 10)
    .reverse()
    .map((statement: any, index: number) => {
      const balanceSheet = data.balanceSheets?.[9 - index] || {};
      const cashFlow = data.cashFlows?.[9 - index] || {};
      const metrics = data.keyMetrics?.[9 - index] || {};
      
      return {
        year: new Date(statement.date).getFullYear(),
        revenue: statement.revenue / 1000000000, // Convert to billions
        grossProfit: statement.grossProfit / 1000000000,
        operatingIncome: statement.operatingIncome / 1000000000,
        netIncome: statement.netIncome / 1000000000,
        eps: statement.eps || 0,
        freeCashFlow: (cashFlow.freeCashFlow || 0) / 1000000000,
        roe: metrics.roe || 0,
        roa: metrics.roa || 0,
        roic: metrics.roic || 0,
        operatingMargin: statement.operatingIncomeRatio || 0,
        netMargin: statement.netIncomeRatio || 0,
        bookValuePerShare: metrics.bookValuePerShare || 0
      };
    });

  // Calculate CAGR for key metrics
  const calculateCAGR = (startValue: number, endValue: number, years: number) => {
    if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
    return Math.pow(endValue / startValue, 1 / years) - 1;
  };

  const revenueCAGR = calculateCAGR(
    processedData[0]?.revenue || 0,
    processedData[processedData.length - 1]?.revenue || 0,
    processedData.length - 1
  );

  const epsCAGR = calculateCAGR(
    processedData[0]?.eps || 0,
    processedData[processedData.length - 1]?.eps || 0,
    processedData.length - 1
  );

  return (
    <div className="space-y-6">
      {/* CAGR Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-emerald-800 to-emerald-700 border-emerald-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Revenue CAGR</p>
                <p className="text-[#333] text-xl font-bold">{(revenueCAGR * 100).toFixed(1)}%</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-800 to-blue-700 border-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">EPS CAGR</p>
                <p className="text-[#333] text-xl font-bold">{(epsCAGR * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-800 to-purple-700 border-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg ROE</p>
                <p className="text-[#333] text-xl font-bold">
                  {(processedData.reduce((sum, d) => sum + d.roe, 0) / processedData.length * 100).toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-800 to-orange-700 border-orange-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Avg Op Margin</p>
                <p className="text-[#333] text-xl font-bold">
                  {(processedData.reduce((sum, d) => sum + d.operatingMargin, 0) / processedData.length * 100).toFixed(1)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue & Profit Trends */}
        <Card className="bg-white border-[#DDDDDD]">
          <CardHeader>
            <CardTitle className="text-[#333]">Revenue & Profit Trends (Billions)</CardTitle>
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
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="grossProfit" stroke="#3B82F6" strokeWidth={2} name="Gross Profit" />
                <Line type="monotone" dataKey="operatingIncome" stroke="#8B5CF6" strokeWidth={2} name="Operating Income" />
                <Line type="monotone" dataKey="netIncome" stroke="#F59E0B" strokeWidth={2} name="Net Income" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* EPS & Free Cash Flow */}
        <Card className="bg-white border-[#DDDDDD]">
          <CardHeader>
            <CardTitle className="text-[#333]">EPS & Free Cash Flow</CardTitle>
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
                <Line type="monotone" dataKey="eps" stroke="#EF4444" strokeWidth={3} name="EPS ($)" />
                <Line type="monotone" dataKey="freeCashFlow" stroke="#06B6D4" strokeWidth={3} name="FCF (Billions)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Return Metrics */}
        <Card className="bg-white border-[#DDDDDD]">
          <CardHeader>
            <CardTitle className="text-[#333]">Return Metrics (%)</CardTitle>
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
                <Line type="monotone" dataKey="roe" stroke="#10B981" strokeWidth={3} name="ROE (%)" />
                <Line type="monotone" dataKey="roa" stroke="#3B82F6" strokeWidth={2} name="ROA (%)" />
                <Line type="monotone" dataKey="roic" stroke="#8B5CF6" strokeWidth={2} name="ROIC (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Margins */}
        <Card className="bg-white border-[#DDDDDD]">
          <CardHeader>
            <CardTitle className="text-[#333]">Profitability Margins (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="operatingMargin" fill="#10B981" name="Operating Margin" />
                <Bar dataKey="netMargin" fill="#3B82F6" name="Net Margin" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoricalTrends;
