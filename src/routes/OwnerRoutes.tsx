
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const OwnerRoutes: React.FC = () => {
  const { user, loading, isOwner, refreshUserRole } = useAuth();
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkOwnerRole = async () => {
      if (user && isMounted) {
        try {
          await refreshUserRole();
        } catch (error) {
          console.error('Error refreshing role:', error);
        } finally {
          if (isMounted) {
            setChecking(false);
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
  }, [user, refreshUserRole]);
  
  if (loading || checking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-rv-burgundy mb-3" />
        <p className="text-gray-700 font-medium">Verifying owner access...</p>
      </div>
    );
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
