import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
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
import MyProductsPage from "./pages/merchant/MyProductsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              
              {/* Protected Creator & Operator Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Creator", "Operator"]} />}>
                <Route path="/creator/scripts" element={<MyScriptsPage />} />
                <Route path="/creator/scripts/:scriptId" element={<ScriptDetailPage />} />
                <Route path="/creator/dashboard" element={<FinancingDashboardPage />} />
              </Route>

              {/* Protected Shared Buyer (Advertiser & Merchant) Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Advertiser", "Merchant"]} />}>
                <Route path="/discover" element={<DiscoverOpportunitiesPage />} />
                <Route path="/buyer/bids" element={<MyBidsReservationsPage />} />
              </Route>

              {/* Protected Merchant-Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Merchant"]} />}>
                <Route path="/merchant/products" element={<MyProductsPage />} />
              </Route>

              {/* Protected Operator Routes (Add specific operator pages here later) */}
              {/* 
              <Route element={<ProtectedRoute allowedRoles={["Operator"]} />}>
                <Route path="/operator/inventory" element={<InventoryPage />} /> 
              </Route> 
              */}
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;