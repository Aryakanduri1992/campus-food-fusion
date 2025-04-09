
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth'
}) => {
  const { user, loading, refreshUserRole } = useAuth();
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        try {
          await refreshUserRole();
        } catch (error) {
          console.error("Error refreshing user role:", error);
        } finally {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    };
    
    checkAuth();
  }, [user, refreshUserRole]);
  
  if (loading || checking) {
    return <LoadingState message="Verifying access..." />;
  }
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
