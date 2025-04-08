
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserRoleManagerProps {
  onRoleAssigned?: () => void;
}

interface DeliveryPartner {
  id: string;
  email: string;
  created_at: string;
}

const UserRoleManager: React.FC<UserRoleManagerProps> = ({ onRoleAssigned }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const isMobile = useIsMobile();

  // Fetch existing delivery partners when component mounts
  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      setLoadingPartners(true);
      
      // Get all delivery partner roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at')
        .eq('role', 'delivery_partner');
        
      if (roleError) {
        console.error("Error fetching delivery partners:", roleError);
        toast({
          title: "Error",
          description: "Could not load delivery partners",
          variant: "destructive"
        });
        return;
      }
      
      // Fetch the delivery partners' emails
      const { data: emailData, error: emailError } = await supabase
        .from('delivery_partners_emails')
        .select('*');
      
      if (emailError) {
        console.error("Error fetching delivery partner emails:", emailError);
        // Table might not exist yet, continue with what we have
      }
      
      // Convert the data to our expected format
      let partnersData: DeliveryPartner[] = [];
      
      if (roleData) {
        partnersData = roleData.map(role => {
          // Try to find the email from our delivery_partners_emails table
          const emailEntry = emailData ? 
            emailData.find((e: { role_id: string, email: string }) => e.role_id === role.id) : 
            null;
          
          return {
            id: role.id,
            email: emailEntry ? emailEntry.email : "Email not available",
            created_at: role.created_at
          };
        });
      }
      
      console.log("Fetched delivery partners:", partnersData);
      setDeliveryPartners(partnersData);
    } catch (error) {
      console.error("Unexpected error fetching delivery partners:", error);
    } finally {
      setLoadingPartners(false);
    }
  };

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
      
      // Instead of trying to get user by email directly (which is not supported),
      // we'll query the database for the user ID associated with the role we just assigned
      const { data: userData, error: userError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'delivery_partner')
        .eq('email', email)
        .maybeSingle();

      let userId = null;
      
      if (userError) {
        console.error("Error fetching user ID:", userError);
      } else if (userData) {
        userId = userData.user_id;
      }
      
      // Get the role ID for the newly assigned role
      const { data: newRoleData, error: fetchError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'delivery_partner')
        .eq('user_id', userId || '')
        .single();

      if (fetchError) {
        console.error("Error fetching role ID:", fetchError);
      } else if (newRoleData) {
        console.log("Found role ID:", newRoleData.id);
        
        // Store the email in the delivery_partners_emails table
        const { error: insertError } = await supabase
          .from('delivery_partners_emails')
          .insert({
            role_id: newRoleData.id,
            email: email
          });

        if (insertError) {
          console.error("Error storing email:", insertError);
        } else {
          console.log("Email stored successfully");
        }
      }

      // Add to local state for immediate UI update
      const newId = newRoleData?.id || 'temp-' + Date.now();
      setDeliveryPartners(prev => [
        ...prev,
        {
          id: newId,
          email: email,
          created_at: new Date().toISOString()
        }
      ]);

      toast({
        title: "Role Assigned",
        description: `Successfully assigned delivery partner role to ${email}`,
      });
      
      // Refresh the list to get the actual data
      setTimeout(fetchDeliveryPartners, 1000);
      
      setEmail('');
      if (onRoleAssigned) onRoleAssigned();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "The user must be registered first before they can be assigned a role.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Delivery Partner Roles</CardTitle>
        <CardDescription>Assign delivery partner role to users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} ${isMobile ? 'space-y-2' : 'space-x-2'}`}>
            <Input
              placeholder="User Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={isMobile ? 'w-full' : 'flex-grow'}
            />
            <Button 
              onClick={assignDeliveryPartnerRole} 
              disabled={loading}
              className={`bg-rv-burgundy hover:bg-rv-burgundy/90 ${isMobile ? 'w-full' : ''}`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Role
                </>
              )}
            </Button>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Assigned Delivery Partners</h3>
            {loadingPartners ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-rv-burgundy" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryPartners.length > 0 ? (
                    deliveryPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>{new Date(partner.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                        No delivery partners assigned yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          
          <p className="text-sm text-gray-500">
            This will assign the delivery partner role to an existing user account. The user must already be registered in the system.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleManager;
