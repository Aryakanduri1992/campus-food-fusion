
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AutoRedirect = () => {
  const { user, loading, isDeliveryPartner, isDeliveryPartnerEmail, isOwner, refreshUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const handleRedirection = async () => {
      if (loading) return;
      
      if (user) {
        try {
          // Make sure we have the latest user role
          await refreshUserRole();
          
          const currentPath = location.pathname;
          
          // Only redirect if user is on the home page or in legacy customer routes
          if (currentPath === '/' || 
              currentPath === '/cart' || 
              currentPath === '/orders' || 
              currentPath === '/payment' || 
              currentPath === '/location') {
            
            // Redirect based on user role
            if (isOwner) {
              console.log('Auto-redirecting owner to dashboard');
              navigate('/owner', { replace: true });
            } else if (isDeliveryPartner || isDeliveryPartnerEmail) {
              console.log('Auto-redirecting delivery partner to dashboard');
              navigate('/delivery', { replace: true });
            } else {
              // Regular customers stay on customer routes
              if (currentPath === '/') {
                console.log('Auto-redirecting customer to orders');
                navigate('/customer/orders', { replace: true });
              }
            }
          }
        } catch (error) {
          console.error('Error during auto-redirect:', error);
        }
      }
    };
    
    handleRedirection();
  }, [user, loading, navigate, isDeliveryPartner, isDeliveryPartnerEmail, isOwner, refreshUserRole, location.pathname]);
  
  return null;
};

export default AutoRedirect;
