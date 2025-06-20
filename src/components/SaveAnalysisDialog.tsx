import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, TrendingUp, TrendingDown, Minus, X, Plus } from 'lucide-react';
import { SaveAnalysisData, AnalysisNotes } from '../types/savedAnalysis';
import { savedAnalysisService, SUGGESTED_TAGS } from '../services/savedAnalysisService';
import { useToast } from '@/hooks/use-toast';

interface SaveAnalysisDialogProps {
  analysisData: SaveAnalysisData;
  children: React.ReactNode;
}

const SaveAnalysisDialog = ({ analysisData, children }: SaveAnalysisDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`${analysisData.companyName} ${analysisData.type} Analysis`);
  const [notes, setNotes] = useState<AnalysisNotes>({
    quickTags: [],
    freeFormSections: {
      investmentThesis: '',
      risks: '',
      catalysts: '',
      targetPrice: '',
      otherNotes: ''
    },
    sentiment: 'neutral'
  });
  const [customTag, setCustomTag] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your analysis",
        variant: "destructive"
      });
      return;
    }

    try {
      savedAnalysisService.save({
        ...analysisData,
        title: title.trim()
      }, notes);

      toast({
        title: "Analysis Saved",
        description: `${analysisData.type} analysis for ${analysisData.companyName} has been saved successfully`,
      });

      setOpen(false);
      // Reset form
      setTitle(`${analysisData.companyName} ${analysisData.type} Analysis`);
      setNotes({
        quickTags: [],
        freeFormSections: {
          investmentThesis: '',
          risks: '',
          catalysts: '',
          targetPrice: '',
          otherNotes: ''
        },
        sentiment: 'neutral'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addQuickTag = (tag: string) => {
    if (!notes.quickTags.includes(tag)) {
      setNotes(prev => ({
        ...prev,
        quickTags: [...prev.quickTags, tag]
      }));
    }
  };

  const removeQuickTag = (tag: string) => {
    setNotes(prev => ({
      ...prev,
      quickTags: prev.quickTags.filter(t => t !== tag)
    }));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !notes.quickTags.includes(customTag.trim())) {
      addQuickTag(customTag.trim());
      setCustomTag('');
    }
  };

  const updateFreeFormSection = (section: keyof AnalysisNotes['freeFormSections'], value: string) => {
    setNotes(prev => ({
      ...prev,
      freeFormSections: {
        ...prev.freeFormSections,
        [section]: value
      }
    }));
  };

  const setSentiment = (sentiment: 'bullish' | 'neutral' | 'bearish') => {
    setNotes(prev => ({ ...prev, sentiment }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Save className="w-5 h-5 text-emerald-400" />
            Save {analysisData.type} Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-[#333]">Analysis Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-700 border-slate-600 text-[#333]"
                placeholder="Give your analysis a memorable title"
              />
            </div>

            <div className="text-sm text-[#777]">
              Company: {analysisData.companyName} ({analysisData.companySymbol}) • Type: {analysisData.type}
            </div>
          </div>

          {/* Sentiment */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#333] text-sm">Investment Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant={notes.sentiment === 'bullish' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSentiment('bullish')}
                  className={notes.sentiment === 'bullish' ? 'bg-green-600 hover:bg-green-700' : 'border-slate-600 text-[#333]'}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Bullish
                </Button>
                <Button
                  variant={notes.sentiment === 'neutral' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSentiment('neutral')}
                  className={notes.sentiment === 'neutral' ? 'bg-slate-600 hover:bg-slate-700' : 'border-slate-600 text-[#333]'}
                >
                  <Minus className="w-4 h-4 mr-1" />
                  Neutral
                </Button>
                <Button
                  variant={notes.sentiment === 'bearish' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSentiment('bearish')}
                  className={notes.sentiment === 'bearish' ? 'bg-red-600 hover:bg-red-700' : 'border-slate-600 text-[#333]'}
                >
                  <TrendingDown className="w-4 h-4 mr-1" />
                  Bearish
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tags */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#333] text-sm">Quick Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Tags */}
              {notes.quickTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {notes.quickTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-emerald-600 text-[#333]">
                      {tag}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeQuickTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add Custom Tag */}
              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom tag..."
                  className="bg-slate-600 border-slate-500 text-[#333] flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                />
                <Button size="sm" onClick={addCustomTag} disabled={!customTag.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Suggested Tags */}
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.filter(tag => !notes.quickTags.includes(tag)).slice(0, 12).map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer border-slate-500 text-[#777] hover:bg-slate-600"
                    onClick={() => addQuickTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Structured Notes */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#333] text-sm">Analysis Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#333] text-sm">Investment Thesis</Label>
                <Textarea
                  value={notes.freeFormSections.investmentThesis}
                  onChange={(e) => updateFreeFormSection('investmentThesis', e.target.value)}
                  placeholder="Why is this a compelling investment opportunity?"
                  className="bg-slate-600 border-slate-500 text-[#333] mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-[#333] text-sm">Key Risks</Label>
                <Textarea
                  value={notes.freeFormSections.risks}
                  onChange={(e) => updateFreeFormSection('risks', e.target.value)}
                  placeholder="What are the main risks and concerns?"
                  className="bg-slate-600 border-slate-500 text-[#333] mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-[#333] text-sm">Catalysts to Monitor</Label>
                <Textarea
                  value={notes.freeFormSections.catalysts}
                  onChange={(e) => updateFreeFormSection('catalysts', e.target.value)}
                  placeholder="What events or metrics should you watch?"
                  className="bg-slate-600 border-slate-500 text-[#333] mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-[#333] text-sm">Target Price & Valuation</Label>
                <Textarea
                  value={notes.freeFormSections.targetPrice}
                  onChange={(e) => updateFreeFormSection('targetPrice', e.target.value)}
                  placeholder="Your price target and valuation thoughts"
                  className="bg-slate-600 border-slate-500 text-[#333] mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-[#333] text-sm">Additional Notes</Label>
                <Textarea
                  value={notes.freeFormSections.otherNotes}
                  onChange={(e) => updateFreeFormSection('otherNotes', e.target.value)}
                  placeholder="Any other thoughts or observations"
                  className="bg-slate-600 border-slate-500 text-[#333] mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-[#333]">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save Analysis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveAnalysisDialog;
