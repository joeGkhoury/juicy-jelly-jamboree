import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import StockInput from './StockInput';
import ReportUploader from './ReportUploader';
import AssumptionsPanel from './AssumptionsPanel';
import WACCCalculation from './WACCCalculation';
import FCFProjection from './FCFProjection';
import ValuationSummary from './ValuationSummary';
import ApiStatus from './ApiStatus';
import SavedAnalysisNotes from './SavedAnalysisNotes';
import { FinancialData, DCFAssumptions, DCFResults } from '../types/financial';
import { calculateDCF } from '../utils/dcfCalculations';
import { useToast } from '@/hooks/use-toast';
import ExtractedDataViewer from './ExtractedDataViewer';
import SaveAnalysisDialog from './SaveAnalysisDialog';
import { SaveAnalysisData, SavedAnalysis } from '../types/savedAnalysis';

interface DCFAnalyzerProps {
  loadedAnalysis?: SavedAnalysis;
  onAnalysisLoaded?: () => void;
}

const DCFAnalyzer = ({ loadedAnalysis, onAnalysisLoaded }: DCFAnalyzerProps) => {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [rawExtractedData, setRawExtractedData] = useState<Partial<FinancialData> | null>(null);
  const [extractedUnits, setExtractedUnits] = useState<Record<string, string> | null>(null);
  const [assumptions, setAssumptions] = useState<DCFAssumptions>({
    revenueGrowthRates: [0.15, 0.12, 0.10, 0.08, 0.05],
    ebitMargin: 0.20,
    taxRate: 0.25,
    depreciation: 0.03,
    capexRate: 0.04,
    nwcRate: 0.02,
    terminalGrowthRate: 0.025,
    marketRiskPremium: 0.06,
    riskFreeRate: 0.045
  });
  const [dcfResults, setDCFResults] = useState<DCFResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedAnalysisNotes, setSavedAnalysisNotes] = useState<SavedAnalysis['notes'] | null>(null);
  const { toast } = useToast();

  // Load saved analysis when prop changes
  useEffect(() => {
    if (loadedAnalysis && loadedAnalysis.type === 'DCF') {
      console.log('Loading saved DCF analysis:', loadedAnalysis);
      
      // Set the financial data and assumptions from saved analysis
      setSelectedStock(loadedAnalysis.companySymbol);
      setFinancialData(loadedAnalysis.inputData);
      setAssumptions(loadedAnalysis.assumptions || assumptions);
      setDCFResults(loadedAnalysis.results);
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

  const handleStockSelect = (ticker: string, data: FinancialData) => {
    setSelectedStock(ticker);
    setFinancialData(data);
    setRawExtractedData(null);
    setExtractedUnits(null);
    setSavedAnalysisNotes(null); // Clear notes when selecting new stock
    setLoading(true);
    
    // Calculate DCF with current assumptions
    setTimeout(() => {
      const results = calculateDCF(data, assumptions);
      setDCFResults(results);
      setLoading(false);
    }, 1000);
  };

  const handlePdfDataExtracted = (data: FinancialData, rawData: Partial<FinancialData>, units: Record<string, string>) => {
    setSelectedStock(data.companyName);
    setFinancialData(data);
    setRawExtractedData(rawData);
    setExtractedUnits(units);
    setSavedAnalysisNotes(null); // Clear notes when uploading new data
    setLoading(true);
    
    // Calculate DCF with current assumptions
    setTimeout(() => {
      const results = calculateDCF(data, assumptions);
      setDCFResults(results);
      setLoading(false);
      toast({
        title: `Analysis for ${data.companyName} complete!`,
        description: "DCF results have been updated based on the uploaded report's data.",
      });
    }, 1000);
  };

  const handleAssumptionsChange = (newAssumptions: DCFAssumptions) => {
    setAssumptions(newAssumptions);
    if (financialData) {
      setLoading(true);
      setTimeout(() => {
        const results = calculateDCF(financialData, newAssumptions);
        setDCFResults(results);
        setLoading(false);
      }, 500);
    }
  };

  const prepareSaveData = (): SaveAnalysisData | null => {
    if (!financialData || !dcfResults) return null;
    
    return {
      title: `${financialData.companyName} DCF Analysis`,
      type: 'DCF',
      companySymbol: financialData.symbol,
      companyName: financialData.companyName,
      inputData: financialData,
      assumptions,
      results: dcfResults
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* API Status */}
      <ApiStatus />

      {/* Saved Analysis Notes - Show if loaded from saved analysis */}
      {savedAnalysisNotes && financialData && (
        <SavedAnalysisNotes notes={savedAnalysisNotes} companyName={financialData.companyName} />
      )}

      {/* Data Input Section */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-[#333] flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Financial Data Input
              </CardTitle>
              <p className="text-[#777] text-sm mt-1">Choose your preferred data source for analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Step 1
              </Badge>
              {financialData && dcfResults && prepareSaveData() && (
                <SaveAnalysisDialog analysisData={prepareSaveData()!}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Analysis
                  </Button>
                </SaveAnalysisDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-slate-800/30">
          <Tabs defaultValue="ticker" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 border border-slate-600">
              <TabsTrigger value="ticker" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                Live Market Data
              </TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                Upload 10-K Report
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ticker" className="pt-6">
              <StockInput onStockSelect={handleStockSelect} />
            </TabsContent>
            <TabsContent value="upload" className="pt-6">
              <ReportUploader onDataExtracted={handlePdfDataExtracted} />
              <ExtractedDataViewer data={rawExtractedData} units={extractedUnits} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {financialData && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Assumptions Panel */}
          <div className="xl:col-span-1">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur shadow-2xl sticky top-24">
              <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600">
                <CardTitle className="text-lg text-[#333] flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  Model Assumptions
                </CardTitle>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 w-fit">
                  Step 2
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <AssumptionsPanel 
                  assumptions={assumptions}
                  onAssumptionsChange={handleAssumptionsChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Analysis */}
          <div className="xl:col-span-3">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[#333] flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    DCF Analysis Results
                  </CardTitle>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    Step 3
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-slate-800/30">
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-700/50 m-6 mb-0 border border-slate-600">
                    <TabsTrigger value="summary" className="text-sm data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                      Executive Summary
                    </TabsTrigger>
                    <TabsTrigger value="wacc" className="text-sm data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                      WACC Analysis
                    </TabsTrigger>
                    <TabsTrigger value="fcf" className="text-sm data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                      Cash Flow Model
                    </TabsTrigger>
                    <TabsTrigger value="valuation" className="text-sm data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                      Valuation Detail
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="p-8">
                    <TabsContent value="summary">
                      <ValuationSummary 
                        financialData={financialData}
                        dcfResults={dcfResults}
                        assumptions={assumptions}
                        loading={loading}
                      />
                    </TabsContent>
                    
                    <TabsContent value="wacc">
                      <WACCCalculation 
                        financialData={financialData}
                        assumptions={assumptions}
                        loading={loading}
                      />
                    </TabsContent>
                    
                    <TabsContent value="fcf">
                      <FCFProjection 
                        financialData={financialData}
                        assumptions={assumptions}
                        dcfResults={dcfResults}
                        loading={loading}
                      />
                    </TabsContent>
                    
                    <TabsContent value="valuation">
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-[#333] mb-2">Terminal Value & Present Value Analysis</h3>
                          <p className="text-[#777] text-sm">Detailed breakdown of enterprise and equity valuation components</p>
                        </div>
                        {dcfResults && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-blue-300">Terminal Value</h4>
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                </div>
                              </div>
                              <p className="text-3xl font-bold text-blue-400 mb-2">
                                ${(dcfResults.terminalValue / 1000000).toFixed(0)}M
                              </p>
                              <p className="text-[#777] text-sm">Perpetual value beyond forecast period</p>
                            </Card>
                            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-green-300">Enterprise Value</h4>
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                  </svg>
                                </div>
                              </div>
                              <p className="text-3xl font-bold text-green-400 mb-2">
                                ${(dcfResults.enterpriseValue / 1000000).toFixed(0)}M
                              </p>
                              <p className="text-[#777] text-sm">Total operational business value</p>
                            </Card>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DCFAnalyzer;
