
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
  const { user, loading, isOwner, refreshUserRole } = useAuth();
  
  // Refresh user role when this component mounts
  React.useEffect(() => {
    if (user) {
      refreshUserRole();
    }
  }, [user, refreshUserRole]);
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" replace />;
  
  console.log("OwnerRoute - Current userRole check:", isOwner);
  
  if (!isOwner) {
    console.log("Access denied: User does not have owner role");
    return <Navigate to="/" replace />;
  }
  
  console.log("Access granted: User has owner role");
  return <>{children}</>;
};

// Delivery partner route - for users with delivery_partner role or emails registered as delivery partners
const DeliveryPartnerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isDeliveryPartner, isDeliveryPartnerEmail, refreshUserRole } = useAuth();
  
  // Refresh user role when this component mounts
  React.useEffect(() => {
    if (user) {
      refreshUserRole();
    }
  }, [user, refreshUserRole]);
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" replace />;
  
  console.log("DeliveryPartnerRoute check - Role:", isDeliveryPartner, "Email:", isDeliveryPartnerEmail);
  
  // Allow access if either they have the delivery_partner role OR their email is registered as a delivery partner
  if (!isDeliveryPartner && !isDeliveryPartnerEmail) {
    console.log("Access denied: User is not a delivery partner");
    return <Navigate to="/" replace />;
  }
  
  console.log("Access granted: User is a delivery partner");
  return <>{children}</>;
};

// Component to handle automatic redirection for delivery partners
const AutoRedirect = () => {
  const { user, loading, isDeliveryPartner, isDeliveryPartnerEmail, refreshUserRole } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user) {
      // Make sure we have the latest user role
      refreshUserRole().then(() => {
        // Check if user should be redirected to delivery dashboard
        if (isDeliveryPartner || isDeliveryPartnerEmail) {
          console.log('Auto-redirecting delivery partner to dashboard');
          navigate('/delivery');
        }
      });
    }
  }, [user, loading, navigate, isDeliveryPartner, isDeliveryPartnerEmail, refreshUserRole]);
  
  return null;
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
              <AutoRedirect />
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
