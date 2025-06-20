import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DCFAnalyzer from "./components/DCFAnalyzer";
import CompsAnalyzer from "./components/CompsAnalyzer";
import InvestmentMemoGenerator from "./components/InvestmentMemoGenerator";
import SavedAnalysesDashboard from "./components/SavedAnalysesDashboard";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout><DCFAnalyzer /></DashboardLayout>} path="/dcf" />
          <Route element={<DashboardLayout><CompsAnalyzer /></DashboardLayout>} path="/comps" />
          <Route element={<DashboardLayout><InvestmentMemoGenerator /></DashboardLayout>} path="/memo" />
          <Route element={<DashboardLayout><SavedAnalysesDashboard /></DashboardLayout>} path="/saved" />
          <Route path="/" element={<Navigate to="/dcf" replace />} />
          <Route path="*" element={<DashboardLayout><NotFound /></DashboardLayout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
