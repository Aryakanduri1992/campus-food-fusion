
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

  // Fetch existing delivery partners when component mounts
  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      setLoadingPartners(true);
      
      // We'll create a custom SQL function or use a custom query to get the emails directly
      // For now, let's just fetch the assigned roles with the email we assigned
      const { data: assignedRoles, error } = await supabase
        .from('user_roles')
        .select('id, role, created_at')
        .eq('role', 'delivery_partner');
        
      if (error) {
        console.error("Error fetching delivery partners:", error);
        toast({
          title: "Error",
          description: "Could not load delivery partners",
          variant: "destructive"
        });
        return;
      }
      
      // Since we assigned roles using email, we'll modify our database approach
      // For now, we'll simulate having email data based on past assignments
      const { data: pastAssignments } = await supabase
        .from('delivery_partners_emails')  // This would be an ideal table structure
        .select('role_id, email')
        .catch(() => ({ data: null }));  // Catch error if table doesn't exist
      
      // Convert the data to our expected format
      let partnersData: DeliveryPartner[] = [];
      
      if (assignedRoles) {
        partnersData = assignedRoles.map(role => {
          // Try to find the email from our simulated/past assignments
          const assignment = pastAssignments?.find(a => a.role_id === role.id);
          
          return {
            id: role.id,
            // If we can't find an email, we'll show a placeholder
            email: assignment?.email || "Email not available",
            created_at: role.created_at
          };
        });
      }
      
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
      // Use the assign_role RPC function we created in the SQL migration
      const { data, error } = await supabase
        .rpc('assign_role', { 
          user_email: email, 
          assigned_role: 'delivery_partner' as UserRole
        });

      if (error) {
        console.error("Error assigning role:", error);
        toast({
          title: "Role Assignment Failed",
          description: "Could not assign delivery partner role to this user. Make sure they are registered.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // In a production app, we would store the email along with the role ID
      // For now, add it to our local state
      setDeliveryPartners(prev => [
        ...prev,
        {
          id: 'temp-' + Date.now(), // We don't know the actual ID yet
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
          <div className="flex items-center space-x-2">
            <Input
              placeholder="User Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={assignDeliveryPartnerRole} 
              disabled={loading}
              className="bg-rv-burgundy hover:bg-rv-burgundy/90"
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
