
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useUserRoles = (user: User | null) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isDeliveryPartner, setIsDeliveryPartner] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeliveryPartnerEmail, setIsDeliveryPartnerEmail] = useState(false);

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

  // Function to refresh user role explicitly
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

  return {
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
  };
};
