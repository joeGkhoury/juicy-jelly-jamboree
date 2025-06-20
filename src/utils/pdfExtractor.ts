
import { FinancialData } from '../types/financial';

// Helper function to clean and parse financial numbers
const parseFinancialNumber = (str: string): number => {
  if (!str) return 0;
  // Remove $, commas, spaces, and handle parentheses for negative numbers
  const cleanedStr = str.trim().replace(/\$/g, '').replace(/,/g, '').replace(/\s/g, '');
  if (cleanedStr === '—' || cleanedStr === '-' || cleanedStr === '' || cleanedStr === 'N/A') return 0;

  const isNegative = cleanedStr.startsWith('(') && cleanedStr.endsWith(')');
  const numberStr = isNegative ? cleanedStr.substring(1, cleanedStr.length - 1) : cleanedStr;
  
  const value = parseFloat(numberStr);
  return isNaN(value) ? 0 : (isNegative ? -value : value);
};

// Find unit multiplier from document headers
const findDocumentUnits = (text: string): { multiplier: number, unit: string } => {
  const lines = text.split('\n').slice(0, 100); // Check first 100 lines for unit declarations
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Look for common unit declarations in 10-K headers
    if (lowerLine.includes('in thousands') || lowerLine.includes('(in thousands)')) {
      console.log('Found thousands unit declaration:', line);
      return { multiplier: 1000, unit: 'thousands' };
    }
    if (lowerLine.includes('in millions') || lowerLine.includes('(in millions)')) {
      console.log('Found millions unit declaration:', line);
      return { multiplier: 1000000, unit: 'millions' };
    }
    if (lowerLine.includes('in billions') || lowerLine.includes('(in billions)')) {
      console.log('Found billions unit declaration:', line);
      return { multiplier: 1000000000, unit: 'billions' };
    }
  }
  
  // Default assumption for 10-K reports
  return { multiplier: 1000, unit: 'thousands' };
};

// Extract specific financial statement sections
const extractFinancialStatements = (text: string) => {
  const lines = text.split('\n');
  let incomeStatementSection = '';
  let balanceSheetSection = '';
  let cashFlowSection = '';
  
  let currentSection = '';
  let sectionStarted = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    
    // Identify Income Statement
    if (line.includes('consolidated statements of operations') || 
        line.includes('consolidated statements of income') ||
        line.includes('consolidated income statements') ||
        (line.includes('statements of operations') && !line.includes('cash'))) {
      currentSection = 'income';
      sectionStarted = true;
      console.log(`Found Income Statement at line ${i}: ${lines[i]}`);
      continue;
    }
    
    // Identify Balance Sheet
    if (line.includes('consolidated balance sheets') || 
        line.includes('consolidated balance sheet') ||
        line.includes('balance sheets')) {
      currentSection = 'balance';
      sectionStarted = true;
      console.log(`Found Balance Sheet at line ${i}: ${lines[i]}`);
      continue;
    }
    
    // Identify Cash Flow Statement
    if (line.includes('consolidated statements of cash flows') || 
        line.includes('statements of cash flows')) {
      currentSection = 'cashflow';
      sectionStarted = true;
      console.log(`Found Cash Flow Statement at line ${i}: ${lines[i]}`);
      continue;
    }
    
    // Stop collecting when we hit notes or next major section
    if (sectionStarted && (line.includes('notes to') || 
        line.includes('see accompanying notes') ||
        line.includes('the accompanying notes'))) {
      sectionStarted = false;
      currentSection = '';
      continue;
    }
    
    // Collect lines for current section
    if (sectionStarted && currentSection) {
      const originalLine = lines[i];
      if (currentSection === 'income') {
        incomeStatementSection += originalLine + '\n';
      } else if (currentSection === 'balance') {
        balanceSheetSection += originalLine + '\n';
      } else if (currentSection === 'cashflow') {
        cashFlowSection += originalLine + '\n';
      }
    }
  }
  
  console.log('Income Statement length:', incomeStatementSection.length);
  console.log('Balance Sheet length:', balanceSheetSection.length);
  console.log('Cash Flow length:', cashFlowSection.length);
  
  return {
    incomeStatement: incomeStatementSection,
    balanceSheet: balanceSheetSection,
    cashFlow: cashFlowSection
  };
};

// Extract value from a specific statement using multiple patterns
const extractFromStatement = (statement: string, patterns: string[], multiplier: number): number => {
  if (!statement) return 0;
  
  const lines = statement.split('\n');
  
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'i');
    
    for (const line of lines) {
      if (regex.test(line)) {
        console.log(`Found match for "${pattern}": ${line.substring(0, 100)}...`);
        
        // Extract numbers from the line - look for the first substantial number
        const numberMatches = line.match(/\$?\s*\(?\s*(\d{1,3}(?:,\d{3})+|\d+)\s*\)?/g);
        if (numberMatches) {
          // Filter out years and small percentages
          const numbers = numberMatches
            .map(m => parseFinancialNumber(m))
            .filter(n => n > 1000 && !(n > 1900 && n < 2100)); // Remove years and small numbers
          
          if (numbers.length > 0) {
            const value = Math.max(...numbers); // Take the largest number (usually the main figure)
            console.log(`Extracted value: ${value}, will multiply by ${multiplier}`);
            return value * multiplier;
          }
        }
      }
    }
  }
  
  return 0;
};

// Find shares outstanding (usually in millions or billions)
const findSharesOutstanding = (text: string): number => {
  const lines = text.split('\n');
  
  const patterns = [
    'shares outstanding',
    'common stock outstanding',
    'shares of common stock outstanding',
    'weighted average shares outstanding'
  ];
  
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'i');
    
    for (const line of lines) {
      if (regex.test(line)) {
        console.log(`Found shares pattern: ${line.substring(0, 100)}...`);
        
        const numberMatches = line.match(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/g);
        if (numberMatches) {
          const numbers = numberMatches.map(m => parseFloat(m.replace(/,/g, '')));
          // Shares are usually in millions or billions, so look for numbers > 100
          const validNumbers = numbers.filter(n => n > 100 && n < 100000);
          if (validNumbers.length > 0) {
            // Assume it's in millions if it's a reasonable share count
            const shares = Math.max(...validNumbers) * 1000000;
            console.log(`Found shares outstanding: ${shares}`);
            return shares;
          }
        }
      }
    }
  }
  
  return 0;
};

// Find market cap from document text
const findMarketCap = (text: string): { value: number, unit: string } => {
  const lines = text.split('\n');
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('aggregate market value') || lowerLine.includes('market value')) {
      console.log(`Found market cap line: ${line}`);
      
      const match = line.match(/\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(billion|million|thousand)/i);
      if (match) {
        const value = parseFloat(match[1].replace(/,/g, ''));
        const unit = match[2].toLowerCase();
        let multiplier = 1;
        
        if (unit === 'billion') multiplier = 1000000000;
        else if (unit === 'million') multiplier = 1000000;
        else if (unit === 'thousand') multiplier = 1000;
        
        return { value: value * multiplier, unit: unit };
      }
    }
  }
  
  return { value: 0, unit: 'not found' };
};

export const extractDataFromText = (text: string): { data: Partial<FinancialData>, units: Record<string, string> } => {
  console.log("Starting focused 10-K parsing...");
  
  // First, determine the document's unit scale
  const documentUnits = findDocumentUnits(text);
  console.log(`Document units detected: ${documentUnits.unit} (${documentUnits.multiplier}x)`);
  
  // Extract financial statement sections
  const statements = extractFinancialStatements(text);
  
  // Extract from Income Statement
  const revenue = extractFromStatement(statements.incomeStatement, [
    'total revenues?',
    'net revenues?',
    'total net sales',
    'net sales',
    'total sales'
  ], documentUnits.multiplier);
  
  const netIncome = extractFromStatement(statements.incomeStatement, [
    'net income(?! \\(loss\\))',
    'net earnings',
    'consolidated net income',
    'income attributable'
  ], documentUnits.multiplier);
  
  const ebit = extractFromStatement(statements.incomeStatement, [
    'operating income',
    'income from operations',
    'operating profit',
    'operating earnings'
  ], documentUnits.multiplier);
  
  // Extract from Balance Sheet
  const totalAssets = extractFromStatement(statements.balanceSheet, [
    'total assets'
  ], documentUnits.multiplier);
  
  const totalDebt = extractFromStatement(statements.balanceSheet, [
    'total liabilities',
    'total debt'
  ], documentUnits.multiplier);
  
  const totalEquity = extractFromStatement(statements.balanceSheet, [
    'total stockholders.? equity',
    'total shareholders.? equity',
    'total equity'
  ], documentUnits.multiplier);
  
  const cash = extractFromStatement(statements.balanceSheet, [
    'cash and cash equivalents',
    'cash and equivalents',
    'cash, cash equivalents'
  ], documentUnits.multiplier);
  
  // Extract from Cash Flow Statement
  const depreciation = extractFromStatement(statements.cashFlow, [
    'depreciation and amortization',
    'depreciation, depletion and amortization'
  ], documentUnits.multiplier);
  
  const capex = extractFromStatement(statements.cashFlow, [
    'capital expenditures',
    'purchases of property, plant and equipment',
    'acquisitions of property and equipment'
  ], documentUnits.multiplier);
  
  // Extract shares outstanding and market cap
  const sharesOutstanding = findSharesOutstanding(text);
  const marketCapResult = findMarketCap(text);
  
  const extractedData = {
    revenue,
    netIncome,
    ebit,
    totalAssets,
    totalDebt,
    totalEquity,
    cash,
    sharesOutstanding,
    depreciation,
    capex,
    marketCap: marketCapResult.value,
  };
  
  const units = {
    revenue: documentUnits.unit,
    netIncome: documentUnits.unit,
    ebit: documentUnits.unit,
    totalAssets: documentUnits.unit,
    totalDebt: documentUnits.unit,
    totalEquity: documentUnits.unit,
    cash: documentUnits.unit,
    sharesOutstanding: 'shares',
    depreciation: documentUnits.unit,
    capex: documentUnits.unit,
    marketCap: marketCapResult.unit,
  };
  
  console.log("Extraction results:", extractedData);
  console.log("Units:", units);
  
  return { data: extractedData, units };
};
