
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { FinancialData } from '../types/financial';
import { extractDataFromText } from '../utils/pdfExtractor';
import { FileText } from 'lucide-react';

interface ReportUploaderProps {
  onDataExtracted: (processedData: FinancialData, rawData: Partial<FinancialData>, units: Record<string, string>) => void;
}

const ReportUploader: React.FC<ReportUploaderProps> = ({ onDataExtracted }) => {
  const [companyName, setCompanyName] = useState('');
  const [reportText, setReportText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!reportText || !companyName) {
      toast({
        title: "Missing Information",
        description: "Please provide a company name and paste the report text.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    toast({
      title: "Processing Report...",
      description: `Analyzing text for ${companyName}. This will take a moment.`,
    });

    setTimeout(() => {
      try {
        console.log('Analyzing Text (first 5000 chars):', reportText.substring(0, 5000));

        const { data: extractedPartials, units } = extractDataFromText(reportText);

        const missingItems: string[] = [];
        if (extractedPartials.revenue === 0) missingItems.push('Revenue');
        if (extractedPartials.sharesOutstanding === 0) missingItems.push('Shares Outstanding');
        if (extractedPartials.totalEquity === 0) missingItems.push('Total Equity');
        if (extractedPartials.netIncome === 0) missingItems.push('Net Income');

        if (missingItems.length > 0) {
          toast({
            title: "Used some estimated data",
            description: `Could not find: ${missingItems.join(', ')}. Using defaults for a partial analysis.`,
          });
        }

        const beta = 1.2;
        
        const sharesOutstanding = extractedPartials.sharesOutstanding || 1600000000;
        const revenue = extractedPartials.revenue || 50000000000;
        const totalEquity = extractedPartials.totalEquity || 90000000000;
        
        let marketCap = extractedPartials.marketCap || 0;
        let currentPrice = 0;

        if (marketCap > 0 && sharesOutstanding > 0) {
          currentPrice = marketCap / sharesOutstanding;
          toast({
            title: "Market Cap Found",
            description: `Extracted market cap from text. Derived stock price: $${currentPrice.toFixed(2)}.`,
          });
        } else {
          currentPrice = 150;
          marketCap = currentPrice * sharesOutstanding;
          toast({
            title: "Using Estimated Price",
            description: `Could not find market cap in text. Using placeholder stock price of $150.`,
            variant: "default",
          });
        }

        const extractedData: FinancialData = {
          companyName: companyName,
          symbol: "FROM-TEXT",
          
          revenue: revenue,
          netIncome: extractedPartials.netIncome || 5000000000,
          sharesOutstanding: sharesOutstanding,
          totalDebt: extractedPartials.totalDebt || 12000000000,
          cash: extractedPartials.cash || 8000000000,
          ebit: extractedPartials.ebit || revenue * 0.15,
          totalAssets: extractedPartials.totalAssets || 180000000000,
          totalEquity: totalEquity,
          depreciation: extractedPartials.depreciation || revenue * 0.03,
          capex: extractedPartials.capex || revenue * 0.04,
          
          beta: beta,
          currentPrice: currentPrice,
          marketCap: marketCap,
          bookValue: totalEquity / sharesOutstanding,
          workingCapital: revenue * 0.02,
        };
        
        onDataExtracted(extractedData, extractedPartials, units);
        
        toast({
          title: "Text Analyzed",
          description: `Extracted key financial data for ${companyName}. Check results below.`,
        });

      } catch (error) {
        console.error("Error analyzing text:", error);
        toast({
          title: "Text Analysis Failed",
          description: "Could not extract data from the provided text. Please check the format.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-slate-600">
        To get started, find a company's 10-K report online, copy its full text, and paste it below.
      </p>
      <div className="space-y-2">
        <Input
          placeholder="Enter Company Name (e.g., Apple Inc.)"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="h-12"
          disabled={loading}
        />
        <Textarea
          placeholder="Paste the entire text from the 10-K report here..."
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          className="min-h-[250px] text-xs font-mono"
          disabled={loading}
        />
      </div>
      <Button 
        onClick={handleAnalyze} 
        disabled={loading || !reportText || !companyName}
        className="h-12 px-6 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
      >
        {loading ? (
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Analyze Pasted Text
          </>
        )}
      </Button>
    </div>
  );
};

export default ReportUploader;
