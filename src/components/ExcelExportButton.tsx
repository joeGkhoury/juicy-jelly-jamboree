import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from 'lucide-react';
import { FinancialData, DCFResults, DCFAssumptions } from '../types/financial';
import { generateDCFExcel } from '../utils/excelExport';
import { useToast } from '@/hooks/use-toast';

interface ExcelExportButtonProps {
  financialData: FinancialData;
  dcfResults: DCFResults;
  assumptions: DCFAssumptions;
  disabled?: boolean;
}

const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  financialData,
  dcfResults,
  assumptions,
  disabled = false
}) => {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      generateDCFExcel(financialData, dcfResults, assumptions);
      toast({
        title: "Excel file exported successfully!",
        description: `DCF analysis for ${financialData.companyName} has been downloaded.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating the Excel file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled}
      className="bg-green-600 hover:bg-green-700 text-[#333]"
      size="lg"
    >
      <FileSpreadsheet className="w-4 h-4 mr-2" />
      <Download className="w-4 h-4 mr-2" />
      Export DCF to Excel
    </Button>
  );
};

export default ExcelExportButton;
