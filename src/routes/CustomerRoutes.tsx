
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const CustomerRoutes: React.FC = () => {
  const { user, isOwner, isDeliveryPartner } = useAuth();
  
  // Redirect owners and delivery partners to their respective dashboards
  if (user && isOwner) {
    return <Navigate to="/owner" replace />;
  }
  
  if (user && isDeliveryPartner) {
    return <Navigate to="/delivery" replace />;
  }
  
  // Non-authenticated users can access cart (we'll check for auth only during checkout)
  return <Outlet />;
};

export default CustomerRoutes;
