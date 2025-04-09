
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

export function useRoleAssignment(onRoleAssigned?: () => void) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const assignDeliveryPartnerRole = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Use the assign_role RPC function to assign the role
      const { data: roleData, error: roleError } = await supabase
        .rpc('assign_role', { 
          user_email: email, 
          assigned_role: 'delivery_partner' as UserRole
        });

      if (roleError) {
        console.error("Error assigning role:", roleError);
        toast({
          title: "Role Assignment Failed",
          description: "Could not assign delivery partner role to this user. Make sure they are registered.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log("Role assigned successfully");
      
      // Query to find the user ID from the user_roles table
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('id, user_id')
        .eq('role', 'delivery_partner')
        .order('created_at', { ascending: false })
        .limit(1);

      let userId = null;
      let roleId = null;
      
      if (userRoleError) {
        console.error("Error fetching user role:", userRoleError);
      } else if (userRoleData && userRoleData.length > 0) {
        userId = userRoleData[0].user_id;
        roleId = userRoleData[0].id;
        console.log("Found user ID:", userId, "and role ID:", roleId);
      }
      
      // Store the email, name, and phone number in the delivery_partners_emails table
      const { error: insertError } = await supabase
        .from('delivery_partners_emails')
        .insert({
          email: email,
          role_id: roleId,
          partner_name: partnerName || null,
          phone_number: phoneNumber || null
        });

      if (insertError) {
        console.error("Error storing partner details:", insertError);
        toast({
          title: "Error",
          description: "Failed to store partner details, but role was assigned",
          variant: "destructive"
        });
      } else {
        console.log("Partner details stored successfully");
      }

      toast({
        title: "Role Assigned",
        description: `Successfully assigned delivery partner role to ${partnerName || email}`,
      });
      
      // Reset form
      setEmail('');
      setPartnerName('');
      setPhoneNumber('');
      
      if (onRoleAssigned) onRoleAssigned();
      
      return { 
        success: true, 
        newPartner: {
          id: Date.now().toString(),
          email: email,
          partner_name: partnerName,
          phone_number: phoneNumber,
          created_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "The user must be registered first before they can be assigned a role.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    partnerName,
    setPartnerName,
    phoneNumber,
    setPhoneNumber,
    loading,
    assignDeliveryPartnerRole
  };
}
