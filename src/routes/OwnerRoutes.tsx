
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LoadingState from '@/components/LoadingState';

const OwnerRoutes: React.FC = () => {
  const { user, loading, isOwner, refreshUserRole } = useAuth();
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkOwnerRole = async () => {
      if (user && isMounted) {
        try {
          await refreshUserRole();
          
          // Check access after role refresh
          if (isMounted) {
            setChecking(false);
            
            if (!isOwner) {
              setShowAccessDenied(true);
              toast({
                title: "Access Denied",
                description: "You don't have permission to access owner dashboard",
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error('Error refreshing role:', error);
          if (isMounted) {
            setChecking(false);
            toast({
              title: "Error",
              description: "Failed to verify your owner status",
              variant: "destructive"
            });
          }
        }
      } else if (isMounted) {
        setChecking(false);
      }
    };
    
    checkOwnerRole();
    
    return () => {
      isMounted = false;
    };
  }, [user, refreshUserRole, isOwner, toast]);
  
  if (loading || checking) {
    return <LoadingState message="Verifying owner access..." />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (showAccessDenied) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default OwnerRoutes;
