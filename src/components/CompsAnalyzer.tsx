import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Shield, Users, CheckCircle, Download } from 'lucide-react';
import StockInput from './StockInput';
import HistoricalTrends from './HistoricalTrends';
import BalanceSheetAnalysis from './BalanceSheetAnalysis';
import KeyMetricsTable from './KeyMetricsTable';
import PeerComparison from './PeerComparison';
import BuffettChecklist from './BuffettChecklist';
import CompsAnalysisExport from './CompsAnalysisExport';
import SaveAnalysisDialog from './SaveAnalysisDialog';
import SavedAnalysisNotes from './SavedAnalysisNotes';
import { FinancialData } from '../types/financial';
import { fetchHistoricalData, fetchPeerData } from '../services/compsDataService';
import { useToast } from '@/hooks/use-toast';
import { SaveAnalysisData, SavedAnalysis } from '../types/savedAnalysis';
import { Save } from 'lucide-react';

interface CompsAnalyzerProps {
  loadedAnalysis?: SavedAnalysis;
  onAnalysisLoaded?: () => void;
}

const CompsAnalyzer = ({ loadedAnalysis, onAnalysisLoaded }: CompsAnalyzerProps) => {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [stockData, setStockData] = useState<FinancialData | null>(null);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [peerData, setPeerData] = useState<any>(null);
  const [buffettScore, setBuffettScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [savedAnalysisNotes, setSavedAnalysisNotes] = useState<SavedAnalysis['notes'] | null>(null);
  const { toast } = useToast();

  // Load saved analysis when prop changes
  useEffect(() => {
    if (loadedAnalysis && loadedAnalysis.type === 'COMPS') {
      console.log('Loading saved Comps analysis:', loadedAnalysis);
      
      // Set the data from saved analysis
      setSelectedStock(loadedAnalysis.companySymbol);
      setStockData(loadedAnalysis.inputData);
      setHistoricalData(loadedAnalysis.results.historicalData);
      setPeerData(loadedAnalysis.results.peerData);
      setBuffettScore(loadedAnalysis.results.buffettScore || 0);
      setSavedAnalysisNotes(loadedAnalysis.notes);
      setLoading(false);
      
      toast({
        title: "Analysis Loaded",
        description: `${loadedAnalysis.title} has been loaded successfully.`,
      });
      
      // Clear the loaded analysis
      onAnalysisLoaded?.();
    }
  }, [loadedAnalysis, onAnalysisLoaded, toast]);

  const handleStockSelect = async (ticker: string, data: FinancialData) => {
    setSelectedStock(ticker);
    setStockData(data);
    setSavedAnalysisNotes(null); // Clear notes when selecting new stock
    setLoading(true);

    try {
      // Fetch 10-year historical data and peer comparison data
      const [historical, peers] = await Promise.all([
        fetchHistoricalData(ticker),
        fetchPeerData(ticker, data)
      ]);

      setHistoricalData(historical);
      setPeerData(peers);

      toast({
        title: "Analysis Complete",
        description: `Comprehensive analysis loaded for ${ticker}`,
      });
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch comprehensive analysis data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuffettScoreUpdate = (score: number) => {
    setBuffettScore(score);
  };

  const prepareSaveData = (): SaveAnalysisData | null => {
    if (!stockData) return null;
    
    return {
      title: `${stockData.companyName} Comps Analysis`,
      type: 'COMPS',
      companySymbol: selectedStock,
      companyName: stockData.companyName,
      inputData: stockData,
      assumptions: undefined,
      results: {
        historicalData,
        peerData,
        buffettScore
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Saved Analysis Notes - Show if loaded from saved analysis */}
      {savedAnalysisNotes && stockData && (
        <SavedAnalysisNotes notes={savedAnalysisNotes} companyName={stockData.companyName} />
      )}

      {/* Header Section */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Comparable Company Analysis</CardTitle>
                <p className="text-slate-300">Long-term value investing analysis with Buffett-inspired metrics</p>
              </div>
            </div>
            {stockData && prepareSaveData() && (
              <SaveAnalysisDialog analysisData={prepareSaveData()!}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Analysis
                </Button>
              </SaveAnalysisDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <StockInput onStockSelect={handleStockSelect} />
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {stockData && (
        <div className="space-y-6">
          {/* Company Overview */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
                {stockData.companyName} ({selectedStock})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Market Cap</p>
                  <p className="text-white text-lg font-semibold">${(stockData.marketCap / 1000000000).toFixed(1)}B</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Current Price</p>
                  <p className="text-white text-lg font-semibold">${stockData.currentPrice.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Revenue (TTM)</p>
                  <p className="text-white text-lg font-semibold">${(stockData.revenue / 1000000000).toFixed(1)}B</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Book Value</p>
                  <p className="text-white text-lg font-semibold">${stockData.bookValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Tabs */}
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
              <TabsTrigger value="trends" className="data-[state=active]:bg-slate-700 text-white">
                10-Year Trends
              </TabsTrigger>
              <TabsTrigger value="balance" className="data-[state=active]:bg-slate-700 text-white">
                Balance Sheet
              </TabsTrigger>
              <TabsTrigger value="metrics" className="data-[state=active]:bg-slate-700 text-white">
                Key Metrics
              </TabsTrigger>
              <TabsTrigger value="peers" className="data-[state=active]:bg-slate-700 text-white">
                Peer Analysis
              </TabsTrigger>
              <TabsTrigger value="buffett" className="data-[state=active]:bg-slate-700 text-white">
                Buffett Checklist
              </TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-slate-700 text-white">
                Export Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <HistoricalTrends data={historicalData} loading={loading} />
            </TabsContent>

            <TabsContent value="balance">
              <BalanceSheetAnalysis data={historicalData} loading={loading} />
            </TabsContent>

            <TabsContent value="metrics">
              <KeyMetricsTable stockData={stockData} historicalData={historicalData} loading={loading} />
            </TabsContent>

            <TabsContent value="peers">
              <PeerComparison stockData={stockData} peerData={peerData} loading={loading} />
            </TabsContent>

            <TabsContent value="buffett">
              <BuffettChecklist 
                stockData={stockData} 
                historicalData={historicalData} 
                loading={loading}
                onScoreUpdate={handleBuffettScoreUpdate}
              />
            </TabsContent>

            <TabsContent value="export">
              <CompsAnalysisExport 
                stockData={stockData}
                historicalData={historicalData}
                peerData={peerData}
                buffettScore={buffettScore}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {loading && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
              <p className="text-white text-lg">Loading comprehensive analysis...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompsAnalyzer;
