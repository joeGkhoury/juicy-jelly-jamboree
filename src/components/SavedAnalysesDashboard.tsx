import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Edit,
  Trash2,
  Pin,
  PinOff,
  BarChart3,
  Calculator,
  FileText
} from 'lucide-react';
import { SavedAnalysis } from '../types/savedAnalysis';
import { savedAnalysisService } from '../services/savedAnalysisService';
import { useToast } from '@/hooks/use-toast';

interface SavedAnalysesDashboardProps {
  onLoadAnalysis?: (analysis: SavedAnalysis) => void;
}

const SavedAnalysesDashboard = ({ onLoadAnalysis }: SavedAnalysesDashboardProps) => {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'DCF' | 'COMPS' | 'MEMO'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = () => {
    const allAnalyses = savedAnalysisService.getAll();
    setAnalyses(allAnalyses);
  };

  const filteredAnalyses = analyses
    .filter(analysis => {
      const matchesType = selectedType === 'ALL' || analysis.type === selectedType;
      const matchesSearch = !searchQuery || 
        analysis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analysis.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analysis.companySymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analysis.notes.quickTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      
      if (sortBy === 'date') {
        return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      savedAnalysisService.delete(id);
      loadAnalyses();
      toast({
        title: "Analysis Deleted",
        description: "The analysis has been removed from your saved analyses.",
      });
    }
  };

  const handlePin = (id: string, isPinned: boolean) => {
    savedAnalysisService.update(id, { isPinned: !isPinned });
    loadAnalyses();
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'border-l-green-500';
      case 'bearish':
        return 'border-l-red-500';
      default:
        return 'border-l-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Saved Analyses</CardTitle>
                <p className="text-slate-300">Manage and review your DCF, Comps, and Investment Memo analyses</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {analyses.length} Saved
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search analyses, companies, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
              <TabsList className="bg-slate-700 border-slate-600">
                <TabsTrigger value="ALL" className="data-[state=active]:bg-slate-600 text-white">
                  All
                </TabsTrigger>
                <TabsTrigger value="DCF" className="data-[state=active]:bg-slate-600 text-white">
                  DCF
                </TabsTrigger>
                <TabsTrigger value="COMPS" className="data-[state=active]:bg-slate-600 text-white">
                  Comps
                </TabsTrigger>
                <TabsTrigger value="MEMO" className="data-[state=active]:bg-slate-600 text-white">
                  Memos
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === 'date' ? 'title' : 'date')}
              className="border-slate-600 text-slate-300"
            >
              <Filter className="w-4 h-4 mr-2" />
              {sortBy === 'date' ? 'Sort by Date' : 'Sort by Title'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analyses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAnalyses.map((analysis) => (
          <Card 
            key={analysis.id} 
            className={`bg-slate-800 border-slate-700 border-l-4 ${getSentimentColor(analysis.notes.sentiment)} hover:bg-slate-700/50 transition-colors cursor-pointer`}
            onClick={() => onLoadAnalysis?.(analysis)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {analysis.type === 'DCF' ? (
                      <Calculator className="w-4 h-4 text-blue-400" />
                    ) : analysis.type === 'COMPS' ? (
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-purple-400" />
                    )}
                    <Badge 
                      variant="secondary" 
                      className={
                        analysis.type === 'DCF' ? 'bg-blue-500/20 text-blue-300' :
                        analysis.type === 'COMPS' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-purple-500/20 text-purple-300'
                      }
                    >
                      {analysis.type}
                    </Badge>
                    {getSentimentIcon(analysis.notes.sentiment)}
                  </div>
                  <CardTitle className="text-white text-lg leading-tight">{analysis.title}</CardTitle>
                  <p className="text-slate-400 text-sm mt-1">
                    {analysis.companyName} ({analysis.companySymbol})
                  </p>
                </div>
                <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePin(analysis.id, analysis.isPinned)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                  >
                    {analysis.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(analysis.id)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Quick Tags */}
              {analysis.notes.quickTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {analysis.notes.quickTags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-300">
                      {tag}
                    </Badge>
                  ))}
                  {analysis.notes.quickTags.length > 3 && (
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      +{analysis.notes.quickTags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Investment Thesis Preview */}
              {analysis.notes.freeFormSections.investmentThesis && (
                <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                  {analysis.notes.freeFormSections.investmentThesis}
                </p>
              )}

              {/* Date */}
              <div className="flex items-center text-xs text-slate-500">
                <Calendar className="w-3 h-3 mr-1" />
                {analysis.dateModified.toLocaleDateString()}
                {analysis.isPinned && (
                  <Badge variant="outline" className="ml-2 text-xs border-amber-600 text-amber-400">
                    Pinned
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnalyses.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Analyses Found</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery ? 'No analyses match your search criteria.' : 'Start by running a DCF or Comps analysis and save it for future reference.'}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')} variant="outline" className="border-slate-600 text-slate-300">
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedAnalysesDashboard;
