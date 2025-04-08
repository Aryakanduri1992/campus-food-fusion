
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeliveryPartner {
  id: string;
  partner_name?: string;
  phone_number?: string;
  email: string;
  status: 'Available' | 'Busy';
}

interface PartnersTabProps {
  partners: DeliveryPartner[];
  setPartners: React.Dispatch<React.SetStateAction<DeliveryPartner[]>>;
  onRoleAssigned: () => void;
}

const PartnersTab: React.FC<PartnersTabProps> = ({ partners, setPartners, onRoleAssigned }) => {
  const { toast } = useToast();
  const [newPartner, setNewPartner] = useState({ name: '', phone: '', email: '' });

  const addNewPartner = async () => {
    if (!newPartner.email || !newPartner.email.includes('@')) {
      toast({
        title: "Missing Information",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: insertData, error: insertError } = await supabase
        .from('delivery_partners_emails')
        .insert({
          email: newPartner.email,
          partner_name: newPartner.name || null,
          phone_number: newPartner.phone || null
        })
        .select();
        
      if (insertError) {
        console.error('Error adding delivery partner:', insertError);
        toast({
          title: "Error",
          description: "Failed to add delivery partner to database",
          variant: "destructive"
        });
        return;
      }
      
      const newId = insertData?.[0]?.id || (partners.length + 1).toString();
      
      setPartners([...partners, { 
        id: newId, 
        partner_name: newPartner.name, 
        phone_number: newPartner.phone,
        email: newPartner.email,
        status: 'Available' 
      }]);

      setNewPartner({ name: '', phone: '', email: '' });
      
      toast({
        title: "Partner Added",
        description: "New delivery partner has been added",
      });
    } catch (error) {
      console.error('Error adding partner:', error);
      toast({
        title: "Error",
        description: "Failed to add delivery partner",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Partner</CardTitle>
          <CardDescription>Register a new delivery partner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner-name">Partner Name</Label>
            <Input 
              id="partner-name" 
              placeholder="Full Name" 
              value={newPartner.name}
              onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partner-phone">Phone Number</Label>
            <Input 
              id="partner-phone" 
              placeholder="10-digit phone number" 
              value={newPartner.phone}
              onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partner-email">Email Address</Label>
            <Input 
              id="partner-email" 
              type="email"
              placeholder="Email address" 
              value={newPartner.email}
              onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
            />
          </div>
          
          <Button 
            className="w-full bg-rv-burgundy hover:bg-rv-burgundy/90 mt-4"
            onClick={addNewPartner}
          >
            Add Partner
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Delivery Partners</CardTitle>
          <CardDescription>Manage your delivery team</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map(partner => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.partner_name}</TableCell>
                  <TableCell>{partner.phone_number}</TableCell>
                  <TableCell>{partner.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${partner.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {partner.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnersTab;
