
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
      // First check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', (await supabase.auth.getUser(email)).data.user?.id)
        .single();

      if (userError) {
        // If user doesn't exist in profiles, try to get from auth
        const { data: authData, error: authError } = await supabase.auth.admin.getUserByEmail(email);
        
        if (authError || !authData?.user) {
          toast({
            title: "User Not Found",
            description: "No user with this email address exists in the system",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Insert role for user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
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
      } else {
        // User exists in profiles, get their ID from auth
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
        
        if (authError || !authUser?.user) {
          toast({
            title: "User Not Found",
            description: "No user with this email address exists in the auth system",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Insert role for user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authUser.user.id,
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
        description: "An unexpected error occurred",
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
