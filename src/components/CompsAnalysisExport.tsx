import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Building2 } from 'lucide-react';
import { FinancialData } from '../types/financial';
import { useToast } from '@/hooks/use-toast';

interface CompsAnalysisExportProps {
  stockData: FinancialData;
  historicalData: any;
  peerData: any;
  buffettScore?: number;
}

const CompsAnalysisExport: React.FC<CompsAnalysisExportProps> = ({ 
  stockData, 
  historicalData, 
  peerData, 
  buffettScore 
}) => {
  const { toast } = useToast();

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString();
    const profile = historicalData?.profile || {};
    
    // Calculate key metrics
    const latestYear = historicalData?.incomeStatements?.[0];
    const revenueCAGR = calculateCAGR(
      historicalData?.incomeStatements?.slice(-1)[0]?.revenue,
      historicalData?.incomeStatements?.[0]?.revenue,
      Math.min(10, historicalData?.incomeStatements?.length || 1)
    );
    
    const epsCAGR = calculateCAGR(
      historicalData?.incomeStatements?.slice(-1)[0]?.eps,
      historicalData?.incomeStatements?.[0]?.eps,
      Math.min(10, historicalData?.incomeStatements?.length || 1)
    );

    return {
      title: `Comprehensive Investment Analysis: ${stockData.companyName} (${stockData.symbol})`,
      date: currentDate,
      executiveSummary: {
        companyName: stockData.companyName,
        ticker: stockData.symbol,
        sector: peerData?.sector || 'N/A',
        industry: peerData?.industry || 'N/A',
        marketCap: stockData.marketCap,
        currentPrice: stockData.currentPrice,
        bookValue: stockData.bookValue,
        buffettScore: buffettScore || 0
      },
      companyDescription: {
        description: profile.description || `${stockData.companyName} is a ${peerData?.sector || ''} company with operations in ${peerData?.industry || 'various sectors'}.`,
        website: profile.website || 'N/A',
        ceo: profile.ceo || 'N/A',
        employees: profile.fullTimeEmployees || 'N/A',
        headquarters: `${profile.city || ''}, ${profile.state || ''}, ${profile.country || ''}`.trim(),
        founded: profile.ipoDate || 'N/A'
      },
      keyMetrics: {
        revenueCAGR: revenueCAGR,
        epsCAGR: epsCAGR,
        currentPE: stockData.currentPrice / (stockData.netIncome / stockData.sharesOutstanding),
        priceToBook: stockData.currentPrice / stockData.bookValue,
        roe: (stockData.netIncome / stockData.totalEquity) * 100,
        roa: (stockData.netIncome / stockData.totalAssets) * 100,
        debtEquity: stockData.totalDebt / stockData.totalEquity,
        operatingMargin: (stockData.ebit / stockData.revenue) * 100,
        netMargin: (stockData.netIncome / stockData.revenue) * 100
      },
      peerComparison: peerData?.peers?.map((peer: any) => ({
        symbol: peer.symbol,
        name: peer.profile?.companyName || peer.symbol,
        marketCap: peer.profile?.mktCap || 0,
        pe: peer.ratios?.priceEarningsRatio || 0,
        pb: peer.ratios?.priceToBookRatio || 0,
        roe: (peer.ratios?.returnOnEquity || 0) * 100
      })) || [],
      risks: [
        "Market volatility and economic conditions",
        "Industry-specific competitive pressures",
        "Regulatory changes and compliance requirements",
        "Interest rate fluctuations affecting cost of capital",
        "Currency exchange rate risks (if applicable)"
      ],
      opportunities: [
        "Market expansion and growth initiatives",
        "Technological innovation and digital transformation",
        "Strategic acquisitions and partnerships",
        "Operational efficiency improvements",
        "ESG initiatives and sustainable business practices"
      ]
    };
  };

  const calculateCAGR = (endValue: number, startValue: number, years: number): number => {
    if (!startValue || !endValue || years <= 0) return 0;
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  };

  const exportToPDF = async () => {
    try {
      const content = generatePDFContent();
      
      // Create a comprehensive HTML report
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${content.title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
            .subtitle { font-size: 18px; color: #6b7280; }
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            .section-title { font-size: 24px; font-weight: bold; color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
            .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .metric-card { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
            .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px; }
            .metric-value { font-size: 18px; font-weight: bold; color: #1e40af; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .table th { background-color: #f8fafc; font-weight: bold; color: #374151; }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
            .neutral { color: #6b7280; }
            .description { line-height: 1.6; color: #4b5563; margin-bottom: 15px; }
            .risk-item, .opportunity-item { padding: 8px 0; border-left: 3px solid #fbbf24; padding-left: 15px; margin-bottom: 10px; background: #fffbeb; }
            .opportunity-item { border-left-color: #10b981; background: #ecfdf5; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
            @media print { body { margin: 0; } .section { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${content.executiveSummary.companyName}</div>
            <div class="subtitle">Comprehensive Investment Analysis Report</div>
            <div style="margin-top: 10px; color: #6b7280;">${content.date}</div>
          </div>

          <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-label">Ticker Symbol</div>
                <div class="metric-value">${content.executiveSummary.ticker}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Market Cap</div>
                <div class="metric-value">$${(content.executiveSummary.marketCap / 1000000000).toFixed(1)}B</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Current Price</div>
                <div class="metric-value">$${content.executiveSummary.currentPrice.toFixed(2)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Buffett Score</div>
                <div class="metric-value ${content.executiveSummary.buffettScore >= 70 ? 'positive' : content.executiveSummary.buffettScore >= 50 ? 'neutral' : 'negative'}">${content.executiveSummary.buffettScore.toFixed(0)}%</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Sector</div>
                <div class="metric-value">${content.executiveSummary.sector}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Industry</div>
                <div class="metric-value">${content.executiveSummary.industry}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Company Overview</div>
            <div class="description">${content.companyDescription.description}</div>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-label">CEO</div>
                <div class="metric-value">${content.companyDescription.ceo}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Employees</div>
                <div class="metric-value">${content.companyDescription.employees.toLocaleString()}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Headquarters</div>
                <div class="metric-value">${content.companyDescription.headquarters}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Website</div>
                <div class="metric-value">${content.companyDescription.website}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Key Financial Metrics</div>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-label">Revenue CAGR (10Y)</div>
                <div class="metric-value ${content.keyMetrics.revenueCAGR > 5 ? 'positive' : 'neutral'}">${content.keyMetrics.revenueCAGR.toFixed(1)}%</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">EPS CAGR (10Y)</div>
                <div class="metric-value ${content.keyMetrics.epsCAGR > 5 ? 'positive' : 'neutral'}">${content.keyMetrics.epsCAGR.toFixed(1)}%</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">P/E Ratio</div>
                <div class="metric-value">${content.keyMetrics.currentPE.toFixed(1)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Price-to-Book</div>
                <div class="metric-value">${content.keyMetrics.priceToBook.toFixed(1)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Return on Equity</div>
                <div class="metric-value ${content.keyMetrics.roe > 15 ? 'positive' : 'neutral'}">${content.keyMetrics.roe.toFixed(1)}%</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Return on Assets</div>
                <div class="metric-value ${content.keyMetrics.roa > 5 ? 'positive' : 'neutral'}">${content.keyMetrics.roa.toFixed(1)}%</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Debt/Equity</div>
                <div class="metric-value ${content.keyMetrics.debtEquity < 0.5 ? 'positive' : 'negative'}">${content.keyMetrics.debtEquity.toFixed(2)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Operating Margin</div>
                <div class="metric-value ${content.keyMetrics.operatingMargin > 10 ? 'positive' : 'neutral'}">${content.keyMetrics.operatingMargin.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Peer Comparison</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Market Cap</th>
                  <th>P/E Ratio</th>
                  <th>P/B Ratio</th>
                  <th>ROE (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background-color: #f0f9ff;">
                  <td><strong>${content.executiveSummary.companyName} (Target)</strong></td>
                  <td>$${(content.executiveSummary.marketCap / 1000000000).toFixed(1)}B</td>
                  <td>${content.keyMetrics.currentPE.toFixed(1)}</td>
                  <td>${content.keyMetrics.priceToBook.toFixed(1)}</td>
                  <td>${content.keyMetrics.roe.toFixed(1)}%</td>
                </tr>
                ${content.peerComparison.slice(0, 5).map(peer => `
                  <tr>
                    <td>${peer.name}</td>
                    <td>$${(peer.marketCap / 1000000000).toFixed(1)}B</td>
                    <td>${peer.pe > 0 ? peer.pe.toFixed(1) : 'N/A'}</td>
                    <td>${peer.pb > 0 ? peer.pb.toFixed(1) : 'N/A'}</td>
                    <td>${peer.roe.toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Investment Risks</div>
            ${content.risks.map(risk => `<div class="risk-item">${risk}</div>`).join('')}
          </div>

          <div class="section">
            <div class="section-title">Investment Opportunities</div>
            ${content.opportunities.map(opportunity => `<div class="opportunity-item">${opportunity}</div>`).join('')}
          </div>

          <div class="footer">
            <p>This report was generated on ${content.date} for investment analysis purposes.</p>
            <p>This analysis is for informational purposes only and should not be considered as investment advice.</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }

      toast({
        title: "Export Initiated",
        description: "Opening print dialog for PDF export...",
      });

    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export Error",
        description: "Failed to generate PDF export",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    try {
      const csvData = [
        ['Metric', 'Value'],
        ['Company', stockData.companyName],
        ['Ticker', stockData.symbol],
        ['Market Cap', stockData.marketCap],
        ['Current Price', stockData.currentPrice],
        ['Book Value', stockData.bookValue],
        ['Revenue', stockData.revenue],
        ['Net Income', stockData.netIncome],
        ['Total Assets', stockData.totalAssets],
        ['Total Debt', stockData.totalDebt],
        ['Total Equity', stockData.totalEquity]
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${stockData.symbol}_analysis.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "CSV Downloaded",
        description: "Financial data exported to CSV successfully",
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast({
        title: "Export Error",
        description: "Failed to export CSV file",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Export Analysis Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={exportToPDF} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="w-full border-slate-500 text-slate-300 hover:bg-slate-600">
              <Download className="w-4 h-4 mr-2" />
              Export Data as CSV
            </Button>
          </div>
          <div className="text-sm text-slate-400">
            <p>• PDF includes comprehensive analysis with charts, peer comparison, and qualitative insights</p>
            <p>• CSV contains raw financial data for further analysis</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompsAnalysisExport;
