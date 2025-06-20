import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DCFAssumptions } from '../types/financial';
import { Settings, TrendingUp, DollarSign } from 'lucide-react';

interface AssumptionsPanelProps {
  assumptions: DCFAssumptions;
  onAssumptionsChange: (assumptions: DCFAssumptions) => void;
}

const AssumptionsPanel: React.FC<AssumptionsPanelProps> = ({
  assumptions,
  onAssumptionsChange
}) => {
  const updateAssumption = (field: keyof DCFAssumptions, value: any) => {
    onAssumptionsChange({
      ...assumptions,
      [field]: value
    });
  };

  const updateGrowthRate = (index: number, value: string) => {
    const newRates = [...assumptions.revenueGrowthRates];
    newRates[index] = parseFloat(value) / 100 || 0;
    updateAssumption('revenueGrowthRates', newRates);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-[#333] rounded-t-lg">
        <CardTitle className="text-lg flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          DCF Assumptions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Revenue Growth Rates */}
        <div className="space-y-3">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
            <Label className="font-medium">Revenue Growth Rates (%)</Label>
          </div>
          {assumptions.revenueGrowthRates.map((rate, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Label className="w-16 text-sm">Year {index + 1}:</Label>
              <Input
                type="number"
                value={(rate * 100).toFixed(1)}
                onChange={(e) => updateGrowthRate(index, e.target.value)}
                className="h-8 text-sm"
                step="0.1"
              />
              <span className="text-xs text-[#777]">%</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Operating Assumptions */}
        <div className="space-y-3">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
            <Label className="font-medium">Operating Assumptions</Label>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">EBIT Margin (%)</Label>
            <Input
              type="number"
              value={(assumptions.ebitMargin * 100).toFixed(1)}
              onChange={(e) => updateAssumption('ebitMargin', parseFloat(e.target.value) / 100 || 0)}
              className="h-8 text-sm"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Tax Rate (%)</Label>
            <Input
              type="number"
              value={(assumptions.taxRate * 100).toFixed(1)}
              onChange={(e) => updateAssumption('taxRate', parseFloat(e.target.value) / 100 || 0)}
              className="h-8 text-sm"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">D&A as % of Revenue</Label>
            <Input
              type="number"
              value={(assumptions.depreciation * 100).toFixed(1)}
              onChange={(e) => updateAssumption('depreciation', parseFloat(e.target.value) / 100 || 0)}
              className="h-8 text-sm"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">CAPEX as % of Revenue</Label>
            <Input
              type="number"
              value={(assumptions.capexRate * 100).toFixed(1)}
              onChange={(e) => updateAssumption('capexRate', parseFloat(e.target.value) / 100 || 0)}
              className="h-8 text-sm"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">NWC Change as % of Revenue</Label>
            <Input
              type="number"
              value={(assumptions.nwcRate * 100).toFixed(1)}
              onChange={(e) => updateAssumption('nwcRate', parseFloat(e.target.value) / 100 || 0)}
              className="h-8 text-sm"
              step="0.1"
            />
          </div>
        </div>

        <Separator />

        {/* Terminal Value & WACC */}
        <div className="space-y-3">
          <Label className="font-medium">Terminal & WACC</Label>
          
          <div className="space-y-2">
            <Label className="text-sm">Terminal Growth Rate (%)</Label>
            <Input
              type="number"
              value={(assumptions.terminalGrowthRate * 100).toFixed(1)}
              onChange={(e) => updateAssumption('terminalGrowthRate', parseFloat(e.target.value) / 100 || 0)}
              className="h-8 text-sm"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Risk-Free Rate (%)</Label>
            <Input
              type="number"
              value={(assumptions.riskFreeRate * 100).toFixed(1)}
              onChange={(e) => updateAssumption('riskFreeRate', parseFloat(e.target.value) / 100 || 0)}
              className="h-8 text-sm"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Market Risk Premium (%)</Label>
            <Input
              type="number"
              value={(assumptions.marketRiskPremium * 100).toFixed(1)}
              onChange={(e) => updateAssumption('marketRiskPremium', parseFloat(e.target.value) / 100 || 0)}
              className="h-8 text-sm"
              step="0.1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssumptionsPanel;
