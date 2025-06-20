import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, MessageSquare, Target, AlertTriangle, Zap } from 'lucide-react';
import { AnalysisNotes } from '../types/savedAnalysis';

interface SavedAnalysisNotesProps {
  notes: AnalysisNotes;
  companyName: string;
}

const SavedAnalysisNotes = ({ notes, companyName }: SavedAnalysisNotesProps) => {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'border-l-green-500 bg-green-500/5';
      case 'bearish':
        return 'border-l-red-500 bg-red-500/5';
      default:
        return 'border-l-slate-500 bg-slate-500/5';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'Bullish';
      case 'bearish':
        return 'Bearish';
      default:
        return 'Neutral';
    }
  };

  return (
    <Card className={`bg-white border-slate-700 border-l-4 ${getSentimentColor(notes.sentiment)} animate-fade-in`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#333] flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Analysis Notes for {companyName}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getSentimentIcon(notes.sentiment)}
            <Badge 
              variant="outline" 
              className={`${
                notes.sentiment === 'bullish' ? 'border-green-500/50 text-green-400' :
                notes.sentiment === 'bearish' ? 'border-red-500/50 text-red-400' :
                'border-slate-500/50 text-slate-400'
              }`}
            >
              {getSentimentText(notes.sentiment)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Tags */}
        {notes.quickTags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[#777] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Quick Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {notes.quickTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Investment Thesis */}
        {notes.freeFormSections.investmentThesis && (
          <div>
            <h4 className="text-sm font-medium text-[#777] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Investment Thesis
            </h4>
            <div className="bg-white/50 rounded-lg p-4 border border-slate-600">
              <p className="text-[#333] leading-relaxed whitespace-pre-wrap">
                {notes.freeFormSections.investmentThesis}
              </p>
            </div>
          </div>
        )}

        {/* Risks */}
        {notes.freeFormSections.risks && (
          <div>
            <h4 className="text-sm font-medium text-[#777] mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Key Risks
            </h4>
            <div className="bg-white/50 rounded-lg p-4 border border-slate-600">
              <p className="text-[#333] leading-relaxed whitespace-pre-wrap">
                {notes.freeFormSections.risks}
              </p>
            </div>
          </div>
        )}

        {/* Catalysts */}
        {notes.freeFormSections.catalysts && (
          <div>
            <h4 className="text-sm font-medium text-[#777] mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Catalysts to Monitor
            </h4>
            <div className="bg-white/50 rounded-lg p-4 border border-slate-600">
              <p className="text-[#333] leading-relaxed whitespace-pre-wrap">
                {notes.freeFormSections.catalysts}
              </p>
            </div>
          </div>
        )}

        {/* Target Price */}
        {notes.freeFormSections.targetPrice && (
          <div>
            <h4 className="text-sm font-medium text-[#777] mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Target Price
            </h4>
            <div className="bg-white/50 rounded-lg p-4 border border-slate-600">
              <p className="text-[#333] leading-relaxed whitespace-pre-wrap">
                {notes.freeFormSections.targetPrice}
              </p>
            </div>
          </div>
        )}

        {/* Other Notes */}
        {notes.freeFormSections.otherNotes && (
          <div>
            <h4 className="text-sm font-medium text-[#777] mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Additional Notes
            </h4>
            <div className="bg-white/50 rounded-lg p-4 border border-slate-600">
              <p className="text-[#333] leading-relaxed whitespace-pre-wrap">
                {notes.freeFormSections.otherNotes}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedAnalysisNotes;
