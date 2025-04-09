
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AutoRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOwner, isDeliveryPartner, refreshUserRole } = useAuth();
  
  useEffect(() => {
    const handleRedirection = async () => {
      if (user) {
        // Refresh the user role to ensure we have the latest data
        await refreshUserRole();
        
        // Skip redirection if on the home page or specific paths that should be accessible regardless of role
        if (location.pathname === '/' || location.pathname === '/menu') {
          return;
        }
        
        // If the user is not on their appropriate dashboard, redirect them
        if (isOwner && !location.pathname.startsWith('/owner')) {
          navigate('/owner');
        } else if (isDeliveryPartner && !location.pathname.startsWith('/delivery')) {
          navigate('/delivery');
        } else if (!isOwner && !isDeliveryPartner && location.pathname === '/') {
          // Only redirect customers from root to orders if they're on the root path
          // and aren't being redirected elsewhere
          console.log('Auto-redirecting customer to orders');
          navigate('/customer/orders');
        }
      }
    };
    
    handleRedirection();
  }, [user, isOwner, isDeliveryPartner, navigate, location.pathname, refreshUserRole]);
  
  return null;
};

export default AutoRedirect;
