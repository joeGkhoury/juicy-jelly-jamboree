import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DCFAnalyzer from "./components/DCFAnalyzer";
import CompsAnalyzer from "./components/CompsAnalyzer";
import InvestmentMemoGenerator from "./components/InvestmentMemoGenerator";
import SavedAnalysesDashboard from "./components/SavedAnalysesDashboard";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
>>>>>>> 1e23601a9603609c9e5683c1f61df3af83a8fc68

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
<<<<<<< HEAD
          <Route element={<DashboardLayout><DCFAnalyzer /></DashboardLayout>} path="/dcf" />
          <Route element={<DashboardLayout><CompsAnalyzer /></DashboardLayout>} path="/comps" />
          <Route element={<DashboardLayout><InvestmentMemoGenerator /></DashboardLayout>} path="/memo" />
          <Route element={<DashboardLayout><SavedAnalysesDashboard /></DashboardLayout>} path="/saved" />
          <Route path="/" element={<Navigate to="/dcf" replace />} />
          <Route path="*" element={<DashboardLayout><NotFound /></DashboardLayout>} />
=======
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
>>>>>>> 1e23601a9603609c9e5683c1f61df3af83a8fc68
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
