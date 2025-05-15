
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AutoRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOwner, isDeliveryPartner, refreshUserRole } = useAuth();
  
  useEffect(() => {
    // Skip auto-redirection for auth page and public pages
    if (location.pathname.includes('/auth') || 
        location.pathname === '/' || 
        location.pathname === '/menu') {
      return;
    }
    
    // Only redirect if user is authenticated
    if (user) {
      const handleRedirection = async () => {
        try {
          // Refresh the user role to ensure we have the latest data
          await refreshUserRole();
          
          // Role-specific redirects only if on incorrect pages
          if (isOwner && !location.pathname.startsWith('/owner')) {
            navigate('/owner');
          } else if (isDeliveryPartner && !location.pathname.startsWith('/delivery')) {
            navigate('/delivery');
          }
          // Remove the customer redirect as it's causing issues
        } catch (error) {
          console.error('Error in auto redirect:', error);
        }
      };
      
      handleRedirection();
    }
  }, [user, isOwner, isDeliveryPartner, navigate, location.pathname, refreshUserRole]);
  
  return null;
};

export default AutoRedirect;
