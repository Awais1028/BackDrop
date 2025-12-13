import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import MyScriptsPage from "./pages/creator/MyScriptsPage";

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
            <Route path="/register" element={<AuthPage />} /> {/* Can reuse AuthPage for register */}

            <Route element={<Layout />}>
              <Route path="/" element={<Index />} /> {/* Public home page */}
              
              {/* Protected Creator Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Creator"]} />}>
                <Route path="/creator/scripts" element={<MyScriptsPage />} />
                {/* Add other Creator routes here */}
              </Route>

              {/* Protected Advertiser Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Advertiser"]} />}>
                {/* <Route path="/discover" element={<DiscoverOpportunitiesPage />} /> */}
                {/* Add other Advertiser routes here */}
              </Route>

              {/* Protected Merchant Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Merchant"]} />}>
                {/* <Route path="/discover" element={<DiscoverOpportunitiesPage />} /> */}
                {/* <Route path="/merchant/products" element={<MyProductsPage />} /> */}
                {/* Add other Merchant routes here */}
              </Route>

              {/* Protected Operator Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Operator"]} />}>
                {/* <Route path="/operator/inventory" element={<InventoryPage />} /> */}
                {/* Add other Operator routes here */}
              </Route>
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