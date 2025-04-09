
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UserPlus } from 'lucide-react';
import { useRoleAssignment } from './hooks/useRoleAssignment';

interface PartnerFormProps {
  onRoleAssigned: (newPartner: any) => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ onRoleAssigned }) => {
  const {
    email,
    setEmail,
    partnerName,
    setPartnerName,
    phoneNumber,
    setPhoneNumber,
    loading,
    assignDeliveryPartnerRole
  } = useRoleAssignment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await assignDeliveryPartnerRole();
    if (result?.success && result.newPartner) {
      onRoleAssigned(result.newPartner);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
        type="submit"
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
    </form>
  );
};

export default PartnerForm;
