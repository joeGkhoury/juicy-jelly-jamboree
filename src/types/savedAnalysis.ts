
export interface SavedAnalysis {
  id: string;
  title: string;
  type: 'DCF' | 'COMPS' | 'MEMO';
  companySymbol: string;
  companyName: string;
  dateCreated: Date;
  dateModified: Date;
  
  // Analysis data
  inputData: any; // Financial data used
  assumptions?: any; // DCF assumptions or other parameters
  results: any; // DCF results, comps results, or memo content
  
  // Note-taking system
  notes: AnalysisNotes;
  
  // Quick access
  isPinned: boolean;
}

export interface AnalysisNotes {
  quickTags: string[];
  freeFormSections: {
    investmentThesis: string;
    risks: string;
    catalysts: string;
    targetPrice: string;
    otherNotes: string;
  };
  sentiment: 'bullish' | 'neutral' | 'bearish';
}

export interface SaveAnalysisData {
  title: string;
  type: 'DCF' | 'COMPS' | 'MEMO';
  companySymbol: string;
  companyName: string;
  inputData: any;
  assumptions?: any;
  results: any;
}
