
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp } from 'lucide-react';
import { fetchStockData } from '../services/stockDataService';
import { FinancialData } from '../types/financial';
import { useToast } from '@/hooks/use-toast';

interface StockInputProps {
  onStockSelect: (ticker: string, data: FinancialData) => void;
}

const StockInput: React.FC<StockInputProps> = ({ onStockSelect }) => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    try {
      console.log(`Fetching data for ticker: ${ticker.toUpperCase()}`);
      const data = await fetchStockData(ticker.toUpperCase());
      console.log('Stock data received:', data);
      onStockSelect(ticker.toUpperCase(), data);
      toast({
        title: "Success",
        description: `Financial data loaded for ${ticker.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stock data. Please check the ticker symbol and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter stock ticker (e.g., AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          className="flex-1 text-lg h-12"
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={loading || !ticker.trim()}
          className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-slate-600 flex items-center mr-2">
          <TrendingUp className="w-4 h-4 mr-1" />
          Popular:
        </span>
        {popularStocks.map((stock) => (
          <Button
            key={stock}
            variant="outline"
            size="sm"
            onClick={() => setTicker(stock)}
            className="text-xs hover:bg-blue-50 hover:border-blue-300"
            disabled={loading}
          >
            {stock}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StockInput;
