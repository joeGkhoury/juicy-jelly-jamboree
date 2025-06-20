import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Sparkles, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InvestmentMemoDisplay from './InvestmentMemoDisplay';
import SaveAnalysisDialog from './SaveAnalysisDialog';
import { generateInvestmentMemoFromTicker } from '../services/deepseekService';
import type { InvestmentMemo } from '../types/investmentMemo';

const InvestmentMemoGenerator = () => {
  const [ticker, setTicker] = useState<string>('');
  const [userInstructions, setUserInstructions] = useState('');
  const [memo, setMemo] = useState<InvestmentMemo | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateMemo = async () => {
    if (!ticker.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a stock ticker symbol",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const generatedMemo = await generateInvestmentMemoFromTicker(ticker.toUpperCase(), userInstructions);
      setMemo(generatedMemo);
      
      toast({
        title: "Memo Generated",
        description: `AI-powered investment memo for ${ticker.toUpperCase()} has been created successfully`,
      });
    } catch (error) {
      console.error('Error generating memo:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate investment memo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareSaveData = () => {
    if (!ticker || !memo) return null;
    
    return {
      title: `${ticker.toUpperCase()} Investment Memo`,
      type: 'MEMO' as const,
      companySymbol: ticker.toUpperCase(),
      companyName: ticker.toUpperCase(),
      inputData: { ticker: ticker.toUpperCase(), userInstructions },
      assumptions: { userInstructions },
      results: memo
    };
  };

  const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">AI Investment Memo Generator</CardTitle>
                <p className="text-slate-300">AI-powered research and analysis for long-term value investors</p>
              </div>
            </div>
            {memo && prepareSaveData() && (
              <SaveAnalysisDialog analysisData={prepareSaveData()!}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Memo
                </Button>
              </SaveAnalysisDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ticker Input */}
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Stock Ticker Symbol <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter stock ticker (e.g., AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="text-lg h-12 bg-slate-700 border-slate-600 text-white"
              disabled={loading}
            />
            
            {/* Popular Stocks */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-sm text-slate-400 flex items-center mr-2">
                Popular:
              </span>
              {popularStocks.map((stock) => (
                <Button
                  key={stock}
                  variant="outline"
                  size="sm"
                  onClick={() => setTicker(stock)}
                  className="text-xs hover:bg-slate-600 border-slate-500 text-slate-300"
                  disabled={loading}
                >
                  {stock}
                </Button>
              ))}
            </div>
          </div>

          {/* Optional Instructions */}
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Research Focus (Optional)
            </label>
            <Textarea
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              placeholder="e.g., 'focus on competitive moat and sustainability', 'analyze downside risks and bear case', 'summarize growth prospects and catalysts'"
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
            <p className="text-slate-400 text-xs mt-1">
              Guide the AI's research focus for more targeted analysis
            </p>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerateMemo}
            disabled={!ticker.trim() || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Researching & Generating Investment Memo...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generate AI Investment Memo
              </div>
            )}
          </Button>
          
          {ticker.trim() && (
            <p className="text-slate-400 text-sm text-center">
              AI will research {ticker.toUpperCase()} and create a comprehensive investment memo
            </p>
          )}
        </CardContent>
      </Card>

      {/* Generated Memo Display */}
      {memo && (
        <InvestmentMemoDisplay 
          memo={memo} 
          companyName={ticker.toUpperCase()} 
          ticker={ticker.toUpperCase()}
        />
      )}
    </div>
  );
};

export default InvestmentMemoGenerator;
