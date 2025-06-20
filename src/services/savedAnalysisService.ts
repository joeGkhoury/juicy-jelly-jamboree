
import { SavedAnalysis, SaveAnalysisData, AnalysisNotes } from '../types/savedAnalysis';

const STORAGE_KEY = 'saved_analyses';

// Default note structure
const createDefaultNotes = (): AnalysisNotes => ({
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

export const savedAnalysisService = {
  // Get all saved analyses
  getAll: (): SavedAnalysis[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const analyses = JSON.parse(stored);
      // Convert date strings back to Date objects
      return analyses.map((analysis: any) => ({
        ...analysis,
        dateCreated: new Date(analysis.dateCreated),
        dateModified: new Date(analysis.dateModified)
      }));
    } catch (error) {
      console.error('Error loading saved analyses:', error);
      return [];
    }
  },

  // Save new analysis
  save: (data: SaveAnalysisData, notes: AnalysisNotes): SavedAnalysis => {
    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      ...data,
      dateCreated: new Date(),
      dateModified: new Date(),
      notes,
      isPinned: false
    };

    const existing = savedAnalysisService.getAll();
    const updated = [newAnalysis, ...existing];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newAnalysis;
  },

  // Update existing analysis
  update: (id: string, updates: Partial<SavedAnalysis>): SavedAnalysis | null => {
    const analyses = savedAnalysisService.getAll();
    const index = analyses.findIndex(a => a.id === id);
    
    if (index === -1) return null;
    
    const updated = {
      ...analyses[index],
      ...updates,
      dateModified: new Date()
    };
    
    analyses[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
    return updated;
  },

  // Delete analysis
  delete: (id: string): boolean => {
    const analyses = savedAnalysisService.getAll();
    const filtered = analyses.filter(a => a.id !== id);
    
    if (filtered.length === analyses.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Get by ID
  getById: (id: string): SavedAnalysis | null => {
    const analyses = savedAnalysisService.getAll();
    return analyses.find(a => a.id === id) || null;
  },

  // Search and filter
  search: (query: string, type?: 'DCF' | 'COMPS'): SavedAnalysis[] => {
    const analyses = savedAnalysisService.getAll();
    const lowerQuery = query.toLowerCase();
    
    return analyses.filter(analysis => {
      const matchesType = !type || analysis.type === type;
      const matchesQuery = !query || 
        analysis.title.toLowerCase().includes(lowerQuery) ||
        analysis.companyName.toLowerCase().includes(lowerQuery) ||
        analysis.companySymbol.toLowerCase().includes(lowerQuery) ||
        analysis.notes.freeFormSections.investmentThesis.toLowerCase().includes(lowerQuery) ||
        analysis.notes.freeFormSections.otherNotes.toLowerCase().includes(lowerQuery) ||
        analysis.notes.quickTags.some(tag => tag.toLowerCase().includes(lowerQuery));
      
      return matchesType && matchesQuery;
    });
  }
};

// Predefined quick tags for suggestions
export const SUGGESTED_TAGS = [
  'Great margins',
  'High ROE',
  'Strong FCF',
  'Weak balance sheet',
  'Moat detected',
  'Valuation discrepancy',
  'High growth',
  'Dividend stock',
  'Cyclical business',
  'Recession resistant',
  'Management quality',
  'Competitive advantage',
  'High debt',
  'Share buybacks',
  'Market leader',
  'Undervalued',
  'Overvalued',
  'Quality business'
];
