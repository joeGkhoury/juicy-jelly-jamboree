
import React from 'react';
import { FinancialData } from '../types/financial';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Atom } from 'lucide-react';

interface ExtractedDataViewerProps {
  data: Partial<FinancialData> | null;
  units: Record<string, string> | null;
}

const formatNumber = (value: number | undefined | null) => {
  if (value === undefined || value === null) return 'N/A';
  if (value === 0) return 'Not Found';
  return value.toLocaleString();
};

const formatUnit = (unit: string | undefined) => {
  if (!unit || unit === 'not found') return '';
  if (unit === 'units') return '';
  return `(in ${unit})`;
};

const ExtractedDataViewer: React.FC<ExtractedDataViewerProps> = ({ data, units }) => {
  if (!data) return null;

  const dataPoints = [
    { label: 'Revenue', value: data.revenue, unit: units?.revenue },
    { label: 'Net Income', value: data.netIncome, unit: units?.netIncome },
    { label: 'EBIT', value: data.ebit, unit: units?.ebit },
    { label: 'Total Assets', value: data.totalAssets, unit: units?.totalAssets },
    { label: 'Total Liabilities (Debt)', value: data.totalDebt, unit: units?.totalDebt },
    { label: 'Total Equity', value: data.totalEquity, unit: units?.totalEquity },
    { label: 'Cash & Equivalents', value: data.cash, unit: units?.cash },
    { label: 'Shares Outstanding', value: data.sharesOutstanding, unit: units?.sharesOutstanding },
    { label: 'Depreciation & Amortization', value: data.depreciation, unit: units?.depreciation },
    { label: 'Capital Expenditures', value: data.capex, unit: units?.capex },
    { label: 'Market Cap (from text)', value: data.marketCap, unit: units?.marketCap },
  ];

  return (
    <Card className="mt-6 shadow-md border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center text-slate-700">
          <Atom className="w-5 h-5 mr-2 text-blue-600" />
          Raw Extracted Data from Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          The following values were extracted directly from the text. Units show the scale detected from the document.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px] font-semibold text-slate-800">Metric</TableHead>
              <TableHead className="font-semibold text-slate-800">Extracted Value</TableHead>
              <TableHead className="font-semibold text-slate-800">Scale</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataPoints.map(point => (
              <TableRow key={point.label}>
                <TableCell className="font-medium">{point.label}</TableCell>
                <TableCell className="font-mono text-sm">{formatNumber(point.value)}</TableCell>
                <TableCell className="text-sm text-slate-600">{formatUnit(point.unit)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ExtractedDataViewer;
