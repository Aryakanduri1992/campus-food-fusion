
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  checkUserRole: () => Promise<UserRole | null>;
  refreshUserRole: () => Promise<void>;
  isDeliveryPartner: boolean;
  isOwner: boolean;
  isDeliveryPartnerEmail: boolean;
};

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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeliveryPartner, setIsDeliveryPartner] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeliveryPartnerEmail, setIsDeliveryPartnerEmail] = useState(false);
  const { toast } = useToast();

  // Check if the current user's email is registered as a delivery partner
  const checkDeliveryPartnerEmail = async (email: string) => {
    if (!email) return false;
    
    try {
      const { data, error } = await supabase
        .from('delivery_partners_emails')
        .select('email')
        .eq('email', email)
        .single();
      
      if (error) {
        console.error('Error checking delivery partner email:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Unexpected error checking delivery partner email:', error);
      return false;
    }
  };

  const checkUserRole = async (): Promise<UserRole | null> => {
    if (!user) return null;

    try {
      // Using a separate, type-safe query method to avoid TypeScript errors
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      // For debugging, log the role data
      console.log('User role data:', data);
      
      return data?.role as UserRole;
    } catch (error) {
      console.error('Unexpected error checking user role:', error);
      return null;
    }
  };

  // Check if a specific email should have owner role
  const isOwnerEmail = (email: string): boolean => {
    // Add any email addresses that should automatically have owner role
    const ownerEmails = ['aryaprasad771@gmail.com'];
    return ownerEmails.includes(email);
  };

  // New function to refresh user role explicitly
  const refreshUserRole = async (): Promise<void> => {
    if (user) {
      const role = await checkUserRole();
      console.log('User role after manual refresh:', role);
      
      // Update userRole state
      setUserRole(role);
      
      // Update convenience flags
      setIsDeliveryPartner(role === 'delivery_partner');
      setIsOwner(role === 'owner');
      
      // Also check if the email is for an owner
      if (user.email && isOwnerEmail(user.email)) {
        console.log('Owner email detected:', user.email);
        setIsOwner(true);
        
        // If they don't have the role in database yet, assign it
        if (role !== 'owner') {
          try {
            const { error } = await supabase
              .rpc('assign_role', { 
                user_email: user.email, 
                assigned_role: 'owner' 
              });
              
            if (!error) {
              console.log('Owner role assigned successfully');
              setUserRole('owner');
            }
          } catch (e) {
            console.error('Error assigning owner role:', e);
          }
        }
      }
      
      // Also check if email is registered as delivery partner
      if (user.email) {
        const isDeliveryEmail = await checkDeliveryPartnerEmail(user.email);
        setIsDeliveryPartnerEmail(isDeliveryEmail);
        console.log('Is delivery partner email:', isDeliveryEmail);
      }
    }
  };

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
              const isDeliveryEmail = await checkDeliveryPartnerEmail(session.user.email);
              setIsDeliveryPartnerEmail(isDeliveryEmail);
              console.log('Is delivery partner email:', isDeliveryEmail);
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
            const isDeliveryEmail = await checkDeliveryPartnerEmail(session.user.email);
            setIsDeliveryPartnerEmail(isDeliveryEmail);
            console.log('Is delivery partner email from initial check:', isDeliveryEmail);
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
      await supabase.auth.signOut();
      // No need to manually clear state here as the onAuthStateChange will handle it
      console.log('User signed out successfully');
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
