
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Key, Database } from 'lucide-react';
import { API_CONFIG } from '../config/api';

const ApiStatus: React.FC = () => {
  const isUsingDemo = API_CONFIG.API_KEY === 'demo';

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-blue-800">
          <Database className="w-5 h-5 mr-2" />
          Financial Data API Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-700">API Provider:</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Financial Modeling Prep
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-700">API Key Status:</span>
          <Badge variant={isUsingDemo ? "destructive" : "default"}>
            {isUsingDemo ? "Demo (Limited)" : "Live API Key Active"}
          </Badge>
        </div>

        {!isUsingDemo && (
          <Alert className="border-green-200 bg-green-50">
            <Key className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              <strong>✅ Live API Connected!</strong>
              <br />
              You're using a real API key and fetching live financial data.
              <br />
              API Key: {API_CONFIG.API_KEY.substring(0, 8)}...
            </AlertDescription>
          </Alert>
        )}

        {isUsingDemo && (
          <Alert className="border-orange-200 bg-orange-50">
            <Key className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              You're using the demo API key with limited requests (250/day). 
              <br />
              <strong>To get unlimited access:</strong>
              <br />
              1. Sign up for free at{' '}
              <a 
                href="https://financialmodelingprep.com/developer/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center"
              >
                Financial Modeling Prep <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <br />
              2. Get your API key
              <br />
              3. Replace 'demo' in <code>src/config/api.ts</code> with your key
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-blue-600">
          <p><strong>Supported tickers:</strong> All major US stocks (NYSE, NASDAQ)</p>
          <p><strong>Data includes:</strong> Real-time prices, financial statements, key metrics</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatus;
