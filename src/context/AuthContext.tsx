
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthContextType } from './auth/types';
import { useUserRoles } from './auth/useUserRoles';
import { signOut as authSignOut } from './auth/authService';

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
  checkUserRole: async () => null,
  refreshUserRole: async () => {},
  isDeliveryPartner: false,
  isOwner: false,
  isDeliveryPartnerEmail: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const {
    userRole,
    setUserRole,
    isDeliveryPartner,
    setIsDeliveryPartner,
    isOwner,
    setIsOwner,
    isDeliveryPartnerEmail,
    setIsDeliveryPartnerEmail,
    checkUserRole,
    refreshUserRole,
    isOwnerEmail
  } = useUserRoles(user);

  useEffect(() => {
    let isMounted = true;
    console.log('Auth provider initialized');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Check if this is an owner email
            if (session.user.email && isOwnerEmail(session.user.email)) {
              console.log('Owner email detected during auth change:', session.user.email);
              setIsOwner(true);
            }
            
            const role = await checkUserRole();
            console.log('User role from auth state change:', role);
            setUserRole(role);
            
            // Update convenience flags
            setIsDeliveryPartner(role === 'delivery_partner');
            setIsOwner(prev => prev || role === 'owner');
            
            // Check if email is registered as delivery partner
            if (session.user.email) {
              const isDeliveryEmail = await checkUserRole();
              setIsDeliveryPartnerEmail(isDeliveryEmail === 'delivery_partner');
              console.log('Is delivery partner email:', isDeliveryEmail === 'delivery_partner');
            }
          } else {
            setUserRole(null);
            setIsDeliveryPartner(false);
            setIsOwner(false);
            setIsDeliveryPartnerEmail(false);
          }
          
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Existing session check:', session?.user?.email);
      
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if this is an owner email
          if (session.user.email && isOwnerEmail(session.user.email)) {
            console.log('Owner email detected during session check:', session.user.email);
            setIsOwner(true);
          }
          
          const role = await checkUserRole();
          console.log('User role from initial check:', role);
          setUserRole(role);
          
          // Update convenience flags
          setIsDeliveryPartner(role === 'delivery_partner');
          setIsOwner(prev => prev || role === 'owner');
          
          // Check if email is registered as delivery partner
          if (session.user.email) {
            const isDeliveryEmail = await checkUserRole();
            setIsDeliveryPartnerEmail(isDeliveryEmail === 'delivery_partner');
            console.log('Is delivery partner email from initial check:', isDeliveryEmail === 'delivery_partner');
          }
        }
        
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await authSignOut();
      // No need to manually clear state here as the onAuthStateChange will handle it
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userRole, 
      loading, 
      signOut, 
      checkUserRole,
      refreshUserRole,
      isDeliveryPartner,
      isOwner,
      isDeliveryPartnerEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};
