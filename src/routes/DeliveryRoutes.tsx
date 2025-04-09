
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LoadingState from '@/components/LoadingState';

const DeliveryRoutes: React.FC = () => {
  const { user, loading, isDeliveryPartner, isDeliveryPartnerEmail, refreshUserRole } = useAuth();
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  
  useEffect(() => {
    const checkDeliveryRole = async () => {
      if (user) {
        try {
          await refreshUserRole();
          setChecking(false);
          
          // Check access after role refresh
          if (!isDeliveryPartner && !isDeliveryPartnerEmail) {
            setShowAccessDenied(true);
            toast({
              title: "Access Denied",
              description: "You don't have permission to access delivery dashboard",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error refreshing user role:", error);
          setChecking(false);
          toast({
            title: "Error",
            description: "Failed to verify your delivery partner status",
            variant: "destructive"
          });
        }
      } else {
        setChecking(false);
      }
    };
    
    checkDeliveryRole();
  }, [user, refreshUserRole, isDeliveryPartner, isDeliveryPartnerEmail, toast]);
  
  if (loading || checking) {
    return <LoadingState message="Verifying delivery partner access..." />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (showAccessDenied) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default DeliveryRoutes;
