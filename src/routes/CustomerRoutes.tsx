
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const CustomerRoutes: React.FC = () => {
  const { user, loading, isOwner, isDeliveryPartner } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-rv-burgundy mb-2" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect owners and delivery partners to their respective dashboards
  if (isOwner) {
    return <Navigate to="/owner" replace />;
  }
  
  if (isDeliveryPartner) {
    return <Navigate to="/delivery" replace />;
  }
  
  // Regular customer can access customer routes
  return <Outlet />;
};

export default CustomerRoutes;
