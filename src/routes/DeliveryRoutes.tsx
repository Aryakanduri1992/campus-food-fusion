
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LoadingState from '@/components/LoadingState';

const DeliveryRoutes: React.FC = () => {
  const { user, loading, isDeliveryPartner, isDeliveryPartnerEmail, refreshUserRole } = useAuth();
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    const checkDeliveryRole = async () => {
      if (user) {
        await refreshUserRole();
        setChecking(false);
      } else {
        setChecking(false);
      }
    };
    
    checkDeliveryRole();
  }, [user, refreshUserRole]);
  
  if (loading || checking) {
    return <LoadingState message="Verifying delivery partner access..." />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!isDeliveryPartner && !isDeliveryPartnerEmail) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access delivery dashboard",
      variant: "destructive"
    });
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default DeliveryRoutes;
