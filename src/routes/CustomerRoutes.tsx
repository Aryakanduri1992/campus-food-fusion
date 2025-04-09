
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/LoadingState';

const CustomerRoutes: React.FC = () => {
  const { user, loading, isOwner, isDeliveryPartner } = useAuth();
  const [checking, setChecking] = useState(false);
  
  // Handle role-based redirects
  if (loading) {
    return <LoadingState message="Loading..." />;
  }
  
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
