import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage"; // Import the new HomePage
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
import MyProductsPage from "./pages/merchant/MyProductsPage"; // Import MyProductsPage

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
              <Route path="/" element={<HomePage />} /> {/* Use HomePage for the root route */}
              
              {/* Protected Creator Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Creator"]} />}>
                <Route path="/creator/scripts" element={<MyScriptsPage />} />
                <Route path="/creator/scripts/:scriptId" element={<ScriptDetailPage />} />
                <Route path="/creator/dashboard" element={<FinancingDashboardPage />} />
              </Route>

              {/* Protected Advertiser Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Advertiser"]} />}>
                <Route path="/discover" element={<DiscoverOpportunitiesPage />} />
                <Route path="/buyer/bids" element={<MyBidsReservationsPage />} />
              </Route>

              {/* Protected Merchant Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Merchant"]} />}>
                <Route path="/discover" element={<DiscoverOpportunitiesPage />} />
                <Route path="/buyer/bids" element={<MyBidsReservationsPage />} />
                <Route path="/merchant/products" element={<MyProductsPage />} /> {/* Merchant Products Page */}
              </Route>

              {/* Protected Operator Routes (Commented out for Creator-only focus) */}
              {/* <Route element={<ProtectedRoute allowedRoles={["Operator"]} />}>
                <Route path="/operator/inventory" element={<MyScriptsPage />} /> 
                <Route path="/operator/workflow" element={<MyScriptsPage />} />
                <Route path="/operator/financing" element={<FinancingDashboardPage />} />
              </Route> */}
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