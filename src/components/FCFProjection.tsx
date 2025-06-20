
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialData, DCFAssumptions, DCFResults } from '../types/financial';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calculator } from 'lucide-react';

interface FCFProjectionProps {
  financialData: FinancialData;
  assumptions: DCFAssumptions;
  dcfResults: DCFResults | null;
  loading: boolean;
}

const FCFProjection: React.FC<FCFProjectionProps> = ({
  financialData,
  assumptions,
  dcfResults,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!dcfResults) {
    return <div>No projection data available</div>;
  }

  const formatCurrency = (value: number) => {
    return `$${(value / 1000000).toFixed(0)}M`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Prepare data for the chart
  const chartData = dcfResults.projectedFCF.map((fcf, index) => ({
    year: `Year ${index + 1}`,
    fcf: fcf / 1000000, // Convert to millions
    presentValue: dcfResults.presentValueFCF[index] / 1000000
  }));

  // Calculate projected revenue for table
  const projectedRevenues = [];
  let currentRevenue = financialData.revenue;
  for (let year = 0; year < 5; year++) {
    const growthRate = assumptions.revenueGrowthRates[year] || assumptions.revenueGrowthRates[4];
    currentRevenue = currentRevenue * (1 + growthRate);
    projectedRevenues.push(currentRevenue);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
        <h3 className="text-lg font-semibold">Free Cash Flow Projection</h3>
      </div>

      {/* FCF Chart */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-md text-green-800">5-Year FCF Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(0)}M`, '']}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar dataKey="fcf" fill="#059669" name="Future FCF" />
              <Bar dataKey="presentValue" fill="#0d9488" name="Present Value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Projection Table */}
      <Card className="bg-white border border-slate-200">
        <CardHeader>
          <CardTitle className="text-md flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Detailed FCF Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-medium">Metric</th>
                  <th className="text-right py-2 font-medium">Year 1</th>
                  <th className="text-right py-2 font-medium">Year 2</th>
                  <th className="text-right py-2 font-medium">Year 3</th>
                  <th className="text-right py-2 font-medium">Year 4</th>
                  <th className="text-right py-2 font-medium">Year 5</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                <tr className="border-b border-slate-100">
                  <td className="py-2 font-medium">Revenue</td>
                  {projectedRevenues.map((rev, i) => (
                    <td key={i} className="text-right py-2">{formatCurrency(rev)}</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-600">Growth Rate</td>
                  {assumptions.revenueGrowthRates.map((rate, i) => (
                    <td key={i} className="text-right py-2 text-slate-600">{formatPercent(rate)}</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-600">EBIT Margin</td>
                  {[1,2,3,4,5].map((_, i) => (
                    <td key={i} className="text-right py-2 text-slate-600">{formatPercent(assumptions.ebitMargin)}</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-200 bg-blue-50">
                  <td className="py-2 font-semibold text-blue-800">Free Cash Flow</td>
                  {dcfResults.projectedFCF.map((fcf, i) => (
                    <td key={i} className="text-right py-2 font-semibold text-blue-600">{formatCurrency(fcf)}</td>
                  ))}
                </tr>
                <tr className="bg-green-50">
                  <td className="py-2 font-semibold text-green-800">Present Value</td>
                  {dcfResults.presentValueFCF.map((pv, i) => (
                    <td key={i} className="text-right py-2 font-semibold text-green-600">{formatCurrency(pv)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">Total PV of FCF</p>
            <p className="text-2xl font-bold text-blue-800">
              {formatCurrency(dcfResults.presentValueFCF.reduce((sum, pv) => sum + pv, 0))}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-purple-600 font-medium">Terminal Value (PV)</p>
            <p className="text-2xl font-bold text-purple-800">
              {formatCurrency(dcfResults.presentValueTerminal)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-green-600 font-medium">Enterprise Value</p>
            <p className="text-2xl font-bold text-green-800">
              {formatCurrency(dcfResults.enterpriseValue)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FCFProjection;
