
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useDeliveryPartners } from './hooks/useDeliveryPartners';
import PartnerForm from './PartnerForm';
import PartnersTable from './PartnersTable';
import { DeliveryPartner, UserRoleManagerProps } from './types';

const UserRoleManager: React.FC<UserRoleManagerProps> = ({ onRoleAssigned }) => {
  const { 
    loadingPartners, 
    deliveryPartners, 
    setDeliveryPartners,
    fetchDeliveryPartners 
  } = useDeliveryPartners();

  const handleRoleAssigned = (newPartner: DeliveryPartner) => {
    // Add to local state for immediate UI update
    setDeliveryPartners(prev => [newPartner, ...prev]);
    
    // Refresh the list to get the actual data
    setTimeout(fetchDeliveryPartners, 1000);
    
    // Call the parent callback if provided
    if (onRoleAssigned) onRoleAssigned();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Delivery Partner Roles</CardTitle>
        <CardDescription>Assign delivery partner role to users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PartnerForm onRoleAssigned={handleRoleAssigned} />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Assigned Delivery Partners</h3>
            <PartnersTable 
              partners={deliveryPartners} 
              loading={loadingPartners} 
            />
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
