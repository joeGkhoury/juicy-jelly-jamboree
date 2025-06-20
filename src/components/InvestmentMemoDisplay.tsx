import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Edit, 
  Download, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Shield,
  Target,
  BarChart3
} from 'lucide-react';
import type { InvestmentMemo } from '../types/investmentMemo';

interface InvestmentMemoDisplayProps {
  memo: InvestmentMemo;
  companyName: string;
  ticker: string;
}

const InvestmentMemoDisplay = ({ memo, companyName, ticker }: InvestmentMemoDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableMemo, setEditableMemo] = useState<InvestmentMemo>(memo);

  const handleSaveEdit = () => {
    setIsEditing(false);
    // The parent component will handle saving through the SaveAnalysisDialog
  };

  const handleExportMarkdown = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticker}_investment_memo.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMarkdown = () => {
    return `# ${companyName} (${ticker}) - Investment Memo

## Company Summary
${editableMemo.companySummary}

## Financial Overview
${editableMemo.financialOverview}

## Valuation Summary
${editableMemo.valuationSummary}

## Investment Thesis
${editableMemo.investmentThesis}

## Risk Factors
${editableMemo.riskFactors}

## Catalysts
${editableMemo.catalysts}

## Moat Analysis
${editableMemo.moatAnalysis}

---
*Generated on ${new Date().toLocaleDateString()}*
`;
  };

  const updateSection = (section: keyof InvestmentMemo, value: string) => {
    setEditableMemo(prev => ({ ...prev, [section]: value }));
  };

  const renderEditableSection = (
    title: string,
    icon: React.ReactNode,
    section: keyof InvestmentMemo,
    placeholder: string
  ) => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={String(editableMemo[section])}
            onChange={(e) => updateSection(section, e.target.value)}
            placeholder={placeholder}
            className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
            rows={6}
          />
        ) : (
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
              {String(editableMemo[section])}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Utility: Convert markdown-like syntax to HTML for PDF
  const markdownToHtml = (text: string) => {
    let html = text;
    // Headings
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Unordered lists
    html = html.replace(/(^|\n)[\-\*] (.*?)(?=\n|$)/g, '$1<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // Tables (simple pipe tables)
    html = html.replace(/\|([^\n]*)\|/g, '<td>$1</td>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    return html;
  };

  // PDF Export logic
  const handleExportPDF = useCallback(() => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${companyName} (${ticker}) - Investment Memo</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 32px; color: #222; background: #fff; }
          h1, h2, h3 { color: #3b82f6; margin-bottom: 0.5em; }
          h1 { font-size: 2.2em; }
          h2 { font-size: 1.5em; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.2em; }
          h3 { font-size: 1.2em; margin-top: 1.5em; }
          .section { margin-bottom: 2em; }
          .section-title { font-size: 1.3em; font-weight: bold; color: #1e293b; margin-bottom: 0.5em; }
          ul { margin: 0.5em 0 0.5em 1.5em; }
          li { margin-bottom: 0.3em; }
          table { border-collapse: collapse; width: 100%; margin: 1em 0; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f1f5f9; }
          .meta { color: #64748b; font-size: 0.95em; margin-bottom: 1.5em; }
          .footer { color: #64748b; font-size: 0.9em; margin-top: 2em; border-top: 1px solid #e5e7eb; padding-top: 1em; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Investment Memo: ${companyName} (${ticker})</h1>
        <div class="meta">Generated on ${memo.generatedAt instanceof Date ? memo.generatedAt.toLocaleDateString() : new Date(memo.generatedAt).toLocaleDateString()}</div>
        <div class="section">
          <div class="section-title">Company Summary</div>
          ${markdownToHtml(editableMemo.companySummary)}
        </div>
        <div class="section">
          <div class="section-title">Financial Overview</div>
          ${markdownToHtml(editableMemo.financialOverview)}
        </div>
        <div class="section">
          <div class="section-title">Valuation Summary</div>
          ${markdownToHtml(editableMemo.valuationSummary)}
        </div>
        <div class="section">
          <div class="section-title">Investment Thesis</div>
          ${markdownToHtml(editableMemo.investmentThesis)}
        </div>
        <div class="section">
          <div class="section-title">Risk Factors</div>
          ${markdownToHtml(editableMemo.riskFactors)}
        </div>
        <div class="section">
          <div class="section-title">Catalysts</div>
          ${markdownToHtml(editableMemo.catalysts)}
        </div>
        <div class="section">
          <div class="section-title">Moat Analysis</div>
          ${markdownToHtml(editableMemo.moatAnalysis)}
        </div>
        <div class="footer">
          <p>This investment memo was generated by AI and is for informational purposes only.</p>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  }, [companyName, ticker, editableMemo, memo.generatedAt]);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card className="bg-gradient-to-r from-purple-800 to-indigo-800 border-purple-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-white" />
              <div>
                <CardTitle className="text-white text-xl">
                  {companyName} ({ticker}) - Investment Memo
                </CardTitle>
                <p className="text-purple-200 text-sm">
                  Generated on {memo.generatedAt instanceof Date ? memo.generatedAt.toLocaleDateString() : new Date(memo.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-purple-400 text-purple-200 hover:bg-purple-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                {isEditing ? 'View' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="border-blue-400 text-blue-600 hover:bg-blue-100"
              >
                <Download className="w-4 h-4 mr-1" />
                Export as PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Memo Sections */}
      <div className="space-y-6">
        {renderEditableSection(
          "Company Summary",
          <Building2 className="w-5 h-5 text-blue-400" />,
          "companySummary",
          "Business model, core products/services, and market positioning..."
        )}

        {renderEditableSection(
          "Financial Overview",
          <BarChart3 className="w-5 h-5 text-green-400" />,
          "financialOverview",
          "Revenue trends, profitability metrics, and balance sheet analysis..."
        )}

        {renderEditableSection(
          "Valuation Summary",
          <DollarSign className="w-5 h-5 text-yellow-400" />,
          "valuationSummary",
          "DCF analysis, comparable company multiples, and valuation ranges..."
        )}

        {renderEditableSection(
          "Investment Thesis",
          <TrendingUp className="w-5 h-5 text-emerald-400" />,
          "investmentThesis",
          "Core reasons why this is a compelling investment opportunity..."
        )}

        {renderEditableSection(
          "Risk Factors",
          <AlertTriangle className="w-5 h-5 text-red-400" />,
          "riskFactors",
          "Key risks and potential downsides to consider..."
        )}

        {renderEditableSection(
          "Catalysts",
          <Zap className="w-5 h-5 text-orange-400" />,
          "catalysts",
          "Upcoming events and triggers that could drive stock performance..."
        )}

        {renderEditableSection(
          "Moat Analysis",
          <Shield className="w-5 h-5 text-purple-400" />,
          "moatAnalysis",
          "Competitive advantages and durability of business model..."
        )}
      </div>

      {/* Save Changes Button (when editing) */}
      {isEditing && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <Button 
              onClick={handleSaveEdit}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestmentMemoDisplay;
