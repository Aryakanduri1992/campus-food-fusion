
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Cart from "@/pages/Cart";
import Orders from "@/pages/Orders";
import Payment from "@/pages/Payment";
import Location from "@/pages/Location";
import Owner from "@/pages/Owner";
import DeliveryPartner from "@/pages/DeliveryPartner";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

// Owner route component - only for users with owner role
const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, userRole, refreshUserRole } = useAuth();
  
  // Refresh user role when this component mounts
  React.useEffect(() => {
    if (user) {
      refreshUserRole();
    }
  }, [user, refreshUserRole]);
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" replace />;
  
  console.log("OwnerRoute - Current userRole:", userRole);
  
  if (userRole !== 'owner') {
    console.log("Access denied: User does not have owner role");
    return <Navigate to="/" replace />;
  }
  
  console.log("Access granted: User has owner role");
  return <>{children}</>;
};

// Delivery partner route - for users with delivery_partner role
const DeliveryPartnerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, userRole, refreshUserRole } = useAuth();
  
  // Refresh user role when this component mounts
  React.useEffect(() => {
    if (user) {
      refreshUserRole();
    }
  }, [user, refreshUserRole]);
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" replace />;
  
  if (userRole !== 'delivery_partner') return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/location" element={
                    <ProtectedRoute>
                      <Location />
                    </ProtectedRoute>
                  } />
                  <Route path="/payment" element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/owner" element={
                    <OwnerRoute>
                      <Owner />
                    </OwnerRoute>
                  } />
                  <Route path="/delivery" element={
                    <DeliveryPartnerRoute>
                      <DeliveryPartner />
                    </DeliveryPartnerRoute>
                  } />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
