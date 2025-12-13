import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import MyScriptsPage from "./pages/creator/MyScriptsPage";
import ScriptDetailPage from "./pages/creator/ScriptDetailPage";
import FinancingDashboardPage from "./pages/creator/FinancingDashboardPage";
import DiscoverOpportunitiesPage from "./pages/buyer/DiscoverOpportunitiesPage";
import MyBidsReservationsPage from "./pages/buyer/MyBidsReservationsPage";
import DealApprovalPage from "./pages/buyer/DealApprovalPage";
import MyProductsPage from "./pages/merchant/MyProductsPage";
import InventoryPage from "./pages/operator/InventoryPage";
import WorkflowMonitoringPage from "./pages/operator/WorkflowMonitoringPage";
import FinancingPage from "./pages/operator/FinancingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Protected Routes inside the App Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Shared Routes */}
                <Route path="/deals/:bidId" element={<DealApprovalPage />} />

                {/* Creator Routes */}
                <Route path="/creator/scripts" element={<MyScriptsPage />} />
                <Route path="/creator/scripts/:scriptId" element={<ScriptDetailPage />} />
                <Route path="/creator/dashboard" element={<FinancingDashboardPage />} />

                {/* Buyer (Advertiser & Merchant) Routes */}
                <Route path="/discover" element={<DiscoverOpportunitiesPage />} />
                <Route path="/buyer/bids" element={<MyBidsReservationsPage />} />
                
                {/* Merchant-Only Routes */}
                <Route path="/merchant/products" element={<MyProductsPage />} />

                {/* Operator Routes */}
                <Route path="/operator/inventory" element={<InventoryPage />} />
                <Route path="/operator/workflow" element={<WorkflowMonitoringPage />} />
                <Route path="/operator/financing" element={<FinancingPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;