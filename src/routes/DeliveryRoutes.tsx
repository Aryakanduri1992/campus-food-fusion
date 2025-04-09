
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
        try {
          await refreshUserRole();
        } catch (error) {
          console.error("Error refreshing user role:", error);
          toast({
            title: "Error",
            description: "Failed to verify your delivery partner status",
            variant: "destructive"
          });
        } finally {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    };
    
    checkDeliveryRole();
  }, [user, refreshUserRole, toast]);
  
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
