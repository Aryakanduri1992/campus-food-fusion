
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
  partner_name?: string;
  phone_number?: string;
}

const UserRoleManager: React.FC<UserRoleManagerProps> = ({ onRoleAssigned }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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
      
      // Get all delivery partner roles from delivery_partners_emails table
      const { data, error } = await supabase
        .from('delivery_partners_emails')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching delivery partners:", error);
        toast({
          title: "Error",
          description: "Could not load delivery partners",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Fetched delivery partners:", data);
      setDeliveryPartners(data || []);
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

      // Add to local state for immediate UI update
      const newId = Date.now().toString();
      setDeliveryPartners(prev => [
        {
          id: newId,
          email: email,
          partner_name: partnerName,
          phone_number: phoneNumber,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);

      toast({
        title: "Role Assigned",
        description: `Successfully assigned delivery partner role to ${partnerName || email}`,
      });
      
      // Refresh the list to get the actual data
      setTimeout(fetchDeliveryPartners, 1000);
      
      // Reset form
      setEmail('');
      setPartnerName('');
      setPhoneNumber('');
      
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
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="partner-name" className="text-sm font-medium">Partner Name</label>
              <Input
                id="partner-name"
                placeholder="Full Name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="partner-phone" className="text-sm font-medium">Phone Number</label>
              <Input
                id="partner-phone"
                placeholder="10-digit phone number" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="partner-email" className="text-sm font-medium">Email Address</label>
              <Input
                id="partner-email"
                placeholder="Email Address (required)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <Button 
              onClick={assignDeliveryPartnerRole} 
              disabled={loading}
              className="w-full bg-rv-burgundy hover:bg-rv-burgundy/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Delivery Partner Role
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
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryPartners.length > 0 ? (
                    deliveryPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>{partner.partner_name || "Not provided"}</TableCell>
                        <TableCell>{partner.phone_number || "Not provided"}</TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>{new Date(partner.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
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
