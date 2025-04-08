
import React, { useState } from 'react';
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

interface UserRoleManagerProps {
  onRoleAssigned?: () => void;
}

const UserRoleManager: React.FC<UserRoleManagerProps> = ({ onRoleAssigned }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
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
      // First, check if user exists in the auth system by querying profiles by email
      const { data: userInfo, error: userError } = await supabase.auth.admin.getUserById(email);
      
      if (userError || !userInfo?.user) {
        // If we can't get user directly, try to find by email (this is less reliable)
        // In a real app, you'd need a more robust way to find users by email
        const { data: authUser, error: authFindError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();
          
        if (authFindError || !authUser) {
          toast({
            title: "User Not Found",
            description: "No user with this email address exists in the system. They must sign up first.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Insert role for user found by email
        const { error: roleError } = await supabase
          .rpc('assign_role', { 
            user_email: email, 
            assigned_role: 'delivery_partner' 
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
      } else {
        // User exists, directly insert role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userInfo.user.id,
            role: 'delivery_partner' as UserRole
          });

        if (roleError) {
          console.error("Error assigning role:", roleError);
          toast({
            title: "Role Assignment Failed",
            description: "Could not assign delivery partner role to this user",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      toast({
        title: "Role Assigned",
        description: "Successfully assigned delivery partner role to the user",
      });
      
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
        <div className="space-y-4">
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
          <p className="text-sm text-gray-500">
            This will assign the delivery partner role to an existing user account. The user must already be registered in the system.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleManager;
