
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const CustomerRoutes: React.FC = () => {
  const { user, loading, isOwner, isDeliveryPartner } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
