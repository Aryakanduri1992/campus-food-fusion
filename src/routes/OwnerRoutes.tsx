
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const OwnerRoutes: React.FC = () => {
  const { user, loading, isOwner, refreshUserRole } = useAuth();
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    const checkOwnerRole = async () => {
      if (user) {
        await refreshUserRole();
        setChecking(false);
      } else {
        setChecking(false);
      }
    };
    
    checkOwnerRole();
  }, [user, refreshUserRole]);
  
  if (loading || checking) {
    return <div className="flex items-center justify-center h-screen">Verifying owner access...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!isOwner) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access owner dashboard",
      variant: "destructive"
    });
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default OwnerRoutes;
