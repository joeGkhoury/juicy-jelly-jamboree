
import * as XLSX from 'xlsx';
import { FinancialData, DCFResults, DCFAssumptions } from '../types/financial';

export const generateDCFExcel = (
  financialData: FinancialData,
  dcfResults: DCFResults,
  assumptions: DCFAssumptions
) => {
  const workbook = XLSX.utils.book_new();

  // Company Overview Sheet
  const companyData = [
    ['DISCOUNTED CASH FLOW ANALYSIS'],
    [''],
    ['Company Information'],
    ['Company:', financialData.companyName, '', '', 'Analysis Date:', new Date().toLocaleDateString()],
    ['Ticker:', financialData.symbol, '', '', 'Currency:', 'USD'],
    [''],
    ['CURRENT MARKET DATA'],
    ['Current Share Price', financialData.currentPrice],
    ['Shares Outstanding (M)', financialData.sharesOutstanding / 1000000],
    ['Market Capitalization ($M)', financialData.marketCap / 1000000],
    ['Enterprise Value ($M)', dcfResults.enterpriseValue / 1000000],
    [''],
    ['KEY ASSUMPTIONS'],
    ['WACC', dcfResults.wacc],
    ['Terminal Growth Rate', assumptions.terminalGrowthRate],
    ['Tax Rate', assumptions.taxRate],
    ['Risk-free Rate', assumptions.riskFreeRate],
    ['Market Risk Premium', assumptions.marketRiskPremium],
    ['Beta', financialData.beta]
  ];

  // DCF Model Sheet with corrected formulas
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear + i + 1);
  
  // Create the DCF model data structure with proper formulas
  const dcfModelData = [];
  
  // Headers
  dcfModelData.push(['DISCOUNTED CASH FLOW MODEL']);
  dcfModelData.push(['(All figures in $ millions)']);
  dcfModelData.push(['']);
  dcfModelData.push(['', 'Historical', ...years.map(y => y.toString())]);
  dcfModelData.push(['', currentYear - 1, ...years]);
  dcfModelData.push(['']);
  
  // REVENUE PROJECTIONS section
  dcfModelData.push(['REVENUE PROJECTIONS']);
  dcfModelData.push(['Revenue', financialData.revenue / 1000000, 
    { f: 'B8*(1+C9)' }, { f: 'C8*(1+D9)' }, { f: 'D8*(1+E9)' }, { f: 'E8*(1+F9)' }, { f: 'F8*(1+G9)' }]);
  dcfModelData.push(['Revenue Growth %', '', 
    assumptions.revenueGrowthRates[0], assumptions.revenueGrowthRates[1], 
    assumptions.revenueGrowthRates[2], assumptions.revenueGrowthRates[3], assumptions.revenueGrowthRates[4]]);
  dcfModelData.push(['']);
  
  // PROFITABILITY section
  dcfModelData.push(['PROFITABILITY']);
  dcfModelData.push(['EBIT', financialData.ebit / 1000000, 
    { f: 'C8*C13' }, { f: 'D8*D13' }, { f: 'E8*E13' }, { f: 'F8*F13' }, { f: 'G8*G13' }]);
  dcfModelData.push(['EBIT Margin %', (financialData.ebit / financialData.revenue), 
    assumptions.ebitMargin, assumptions.ebitMargin, assumptions.ebitMargin, assumptions.ebitMargin, assumptions.ebitMargin]);
  dcfModelData.push(['Tax Rate', assumptions.taxRate, 
    assumptions.taxRate, assumptions.taxRate, assumptions.taxRate, assumptions.taxRate, assumptions.taxRate]);
  dcfModelData.push(['NOPAT', (financialData.ebit * (1 - assumptions.taxRate)) / 1000000, 
    { f: 'C12*(1-C14)' }, { f: 'D12*(1-D14)' }, { f: 'E12*(1-E14)' }, { f: 'F12*(1-F14)' }, { f: 'G12*(1-G14)' }]);
  dcfModelData.push(['']);
  
  // FREE CASH FLOW CALCULATION section
  dcfModelData.push(['FREE CASH FLOW CALCULATION']);
  dcfModelData.push(['NOPAT', { f: 'B15' }, { f: 'C15' }, { f: 'D15' }, { f: 'E15' }, { f: 'F15' }, { f: 'G15' }]);
  dcfModelData.push(['Add: Depreciation & Amortization', financialData.depreciation / 1000000, 
    { f: 'C8*C23' }, { f: 'D8*D23' }, { f: 'E8*E23' }, { f: 'F8*F23' }, { f: 'G8*G23' }]);
  dcfModelData.push(['Less: Capital Expenditures', -(financialData.capex / 1000000), 
    { f: '-C8*C24' }, { f: '-D8*D24' }, { f: '-E8*E24' }, { f: '-F8*F24' }, { f: '-G8*G24' }]);
  dcfModelData.push(['Less: Change in NWC', 0, 
    { f: '-C8*C25' }, { f: '-D8*D25' }, { f: '-E8*E25' }, { f: '-F8*F25' }, { f: '-G8*G25' }]);
  dcfModelData.push(['']);
  
  // Assumption rates
  dcfModelData.push(['D&A Rate', '', assumptions.depreciation]);
  dcfModelData.push(['CapEx Rate', '', assumptions.capexRate]);
  dcfModelData.push(['NWC Rate', '', assumptions.nwcRate]);
  dcfModelData.push(['']);
  
  // Free Cash Flow calculation
  dcfModelData.push(['Free Cash Flow', '', 
    { f: 'C18+C19+C20+C21' }, { f: 'D18+D19+D20+D21' }, { f: 'E18+E19+E20+E21' }, { f: 'F18+F19+F20+F21' }, { f: 'G18+G19+G20+G21' }]);
  dcfModelData.push(['']);
  
  // VALUATION section
  dcfModelData.push(['VALUATION']);
  dcfModelData.push(['WACC', '', dcfResults.wacc]);
  dcfModelData.push(['Terminal Growth Rate', '', assumptions.terminalGrowthRate]);
  dcfModelData.push(['Discount Factor', '', 
    { f: '1/(1+C30)^1' }, { f: '1/(1+C30)^2' }, { f: '1/(1+C30)^3' }, { f: '1/(1+C30)^4' }, { f: '1/(1+C30)^5' }]);
  dcfModelData.push(['Present Value of FCF', '', 
    { f: 'C27*C32' }, { f: 'D27*D32' }, { f: 'E27*E32' }, { f: 'F27*F32' }, { f: 'G27*G32' }]);
  dcfModelData.push(['']);
  
  // Terminal Value and final calculations
  dcfModelData.push(['Terminal Value', '', '', '', '', '', { f: 'G27*(1+C31)/(C30-C31)' }]);
  dcfModelData.push(['PV of Terminal Value', '', '', '', '', '', { f: 'G35*G32' }]);
  dcfModelData.push(['Sum of PV of FCFs', '', { f: 'SUM(C33:G33)' }]);
  dcfModelData.push(['Enterprise Value', '', { f: 'C37+G36' }]);
  dcfModelData.push(['']);
  
  // Equity Value calculation
  dcfModelData.push(['Less: Net Debt', '', financialData.totalDebt / 1000000]);
  dcfModelData.push(['Add: Cash & Equivalents', '', financialData.cash / 1000000]);
  dcfModelData.push(['Equity Value', '', { f: 'C38-C40+C41' }]);
  dcfModelData.push(['']);
  
  // Per share calculations
  dcfModelData.push(['Shares Outstanding (M)', '', financialData.sharesOutstanding / 1000000]);
  dcfModelData.push(['Value per Share', '', { f: 'C42/C44' }]);
  dcfModelData.push(['Current Share Price', '', financialData.currentPrice]);
  dcfModelData.push(['Upside/(Downside)', '', { f: '(C45-C46)/C46' }]);

  // WACC Calculation Sheet
  const waccData = [
    ['WEIGHTED AVERAGE COST OF CAPITAL (WACC)'],
    [''],
    ['CAPITAL STRUCTURE'],
    ['Market Value of Equity ($M)', financialData.marketCap / 1000000],
    ['Market Value of Debt ($M)', financialData.totalDebt / 1000000],
    ['Total Capital ($M)', { f: 'B4+B5' }],
    [''],
    ['Weight of Equity', { f: 'B4/B6' }],
    ['Weight of Debt', { f: 'B5/B6' }],
    [''],
    ['COST COMPONENTS'],
    ['Risk-free Rate', assumptions.riskFreeRate],
    ['Beta', financialData.beta],
    ['Market Risk Premium', assumptions.marketRiskPremium],
    ['Cost of Equity', { f: 'B12+(B13*B14)' }],
    [''],
    ['Pre-tax Cost of Debt', 0.04],
    ['Tax Rate', assumptions.taxRate],
    ['After-tax Cost of Debt', { f: 'B17*(1-B18)' }],
    [''],
    ['WACC CALCULATION'],
    ['WACC', { f: '(B8*B15)+(B9*B19)' }]
  ];

  // Create sheets from data
  const companySheet = XLSX.utils.aoa_to_sheet(companyData);
  const dcfSheet = XLSX.utils.aoa_to_sheet(dcfModelData);
  const waccSheet = XLSX.utils.aoa_to_sheet(waccData);

  // Professional styling function
  const applyProfessionalStyling = (ws: any) => {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:G50');
    
    // Set generous column widths
    ws['!cols'] = [
      { wch: 30 }, // Column A - wider for labels
      { wch: 18 }, // Column B
      { wch: 18 }, // Column C
      { wch: 18 }, // Column D
      { wch: 18 }, // Column E
      { wch: 18 }, // Column F
      { wch: 18 }  // Column G
    ];

    // Set row heights for better readability
    const rowHeights = [];
    for (let i = 0; i <= range.e.r; i++) {
      rowHeights.push({ hpt: 25 }); // 25 points height
    }
    ws['!rows'] = rowHeights;

    // Apply cell styles
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cell_address]) continue;
        
        const cell = ws[cell_address];
        
        // Initialize cell style
        if (!cell.s) cell.s = {};
        
        // Title row styling (first row) - Dark Blue Header
        if (R === 0) {
          cell.s = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1F4E79" } }, // Dark blue
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "medium", color: { rgb: "000000" } },
              bottom: { style: "medium", color: { rgb: "000000" } },
              left: { style: "medium", color: { rgb: "000000" } },
              right: { style: "medium", color: { rgb: "000000" } }
            }
          };
        }
        // Section headers - Medium Blue
        else if (cell.v && typeof cell.v === 'string' && 
                (cell.v.includes('CURRENT MARKET') || cell.v.includes('KEY ASSUMPTIONS') || 
                 cell.v.includes('REVENUE PROJECTIONS') || cell.v.includes('PROFITABILITY') || 
                 cell.v.includes('FREE CASH FLOW') || cell.v.includes('VALUATION') ||
                 cell.v.includes('CAPITAL STRUCTURE') || cell.v.includes('COST COMPONENTS') ||
                 cell.v.includes('WACC CALCULATION') || cell.v.includes('Company Information'))) {
          cell.s = {
            font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } }, // Medium blue
            alignment: { horizontal: "left", vertical: "center" },
            border: {
              top: { style: "medium", color: { rgb: "000000" } },
              bottom: { style: "medium", color: { rgb: "000000" } },
              left: { style: "medium", color: { rgb: "000000" } },
              right: { style: "medium", color: { rgb: "000000" } }
            }
          };
        }
        // Year headers - Light Blue
        else if (R === 3 || R === 4) {
          cell.s = {
            font: { bold: true, sz: 10, color: { rgb: "1F4E79" } },
            fill: { fgColor: { rgb: "D9E2F3" } }, // Light blue
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "4472C4" } },
              bottom: { style: "thin", color: { rgb: "4472C4" } },
              left: { style: "thin", color: { rgb: "4472C4" } },
              right: { style: "thin", color: { rgb: "4472C4" } }
            }
          };
        }
        // Data cells with proper formatting
        else if ((cell.v !== '' && cell.v !== undefined && cell.v !== null) || cell.f) {
          let numFmt = "General";
          let fontColor = "000000";
          let fillColor = "FFFFFF";
          
          // Format numbers appropriately
          if (typeof cell.v === 'number' || cell.f) {
            if (cell.v && cell.v < 1 && cell.v > -1 && cell.v !== 0) {
              numFmt = "0.0%"; // Percentage format
            } else if (cell.v && Math.abs(cell.v) >= 1000) {
              numFmt = "#,##0.0"; // Large numbers with one decimal
            } else {
              numFmt = "#,##0.00"; // Regular numbers with two decimals
            }
            
            // Color negative numbers red
            if (cell.v && cell.v < 0) {
              fontColor = "C5504B";
            }
          }
          
          // Highlight key result rows
          if (C === 0 && typeof cell.v === 'string') {
            if (cell.v.includes('Value per Share') || cell.v.includes('Enterprise Value') || 
                cell.v.includes('Equity Value') || cell.v.includes('Free Cash Flow') ||
                cell.v.includes('WACC') || cell.v.includes('Upside')) {
              fillColor = "FFE699"; // Light yellow highlight
              fontColor = "1F4E79"; // Dark blue text
            }
          }
          
          cell.s = {
            font: { sz: 10, color: { rgb: fontColor }, bold: fillColor !== "FFFFFF" },
            fill: { fgColor: { rgb: fillColor } },
            alignment: { 
              horizontal: C === 0 ? "left" : "right", 
              vertical: "center" 
            },
            border: {
              top: { style: "thin", color: { rgb: "D0D0D0" } },
              bottom: { style: "thin", color: { rgb: "D0D0D0" } },
              left: { style: "thin", color: { rgb: "D0D0D0" } },
              right: { style: "thin", color: { rgb: "D0D0D0" } }
            },
            numFmt: numFmt
          };
        }
        // Empty or label cells
        else {
          cell.s = {
            font: { sz: 10, color: { rgb: "000000" } },
            alignment: { horizontal: "left", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "E0E0E0" } },
              bottom: { style: "thin", color: { rgb: "E0E0E0" } },
              left: { style: "thin", color: { rgb: "E0E0E0" } },
              right: { style: "thin", color: { rgb: "E0E0E0" } }
            }
          };
        }
      }
    }
    
    // Merge title cells for better presentation
    if (ws['A1']) {
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
    }
  };

  // Apply styling to all sheets
  applyProfessionalStyling(companySheet);
  applyProfessionalStyling(dcfSheet);
  applyProfessionalStyling(waccSheet);

  // Add sheets to workbook
  XLSX.utils.book_append_sheet(workbook, companySheet, "Company Overview");
  XLSX.utils.book_append_sheet(workbook, dcfSheet, "DCF Model");
  XLSX.utils.book_append_sheet(workbook, waccSheet, "WACC Calculation");

  // Generate filename
  const filename = `DCF_Analysis_${financialData.symbol}_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Write and download file
  XLSX.writeFile(workbook, filename);
};
