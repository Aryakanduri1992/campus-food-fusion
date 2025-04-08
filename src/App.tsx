
import React from "react";
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

const queryClient = new QueryClient();

// AppRoutes component to handle all routes
const AppRoutes = () => {
  const routeElements = useRoutes(routes);
  return routeElements;
};

// Main App Component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
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
