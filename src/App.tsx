
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import routes from "@/routes";
import AutoRedirect from "@/components/AutoRedirect";

// Create a query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// AppRoutes component to handle all routes with error boundary
const AppRoutes = () => {
  const routeElements = useRoutes(routes);
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      {routeElements}
    </Suspense>
  );
};

// Main App Component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter basename="/campus-food-fusion">
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <AutoRedirect />
              <main className="flex-grow">
                <AppRoutes />
              </main>
            </div>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
