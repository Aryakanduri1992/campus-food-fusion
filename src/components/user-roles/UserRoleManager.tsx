
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnersTable from './PartnersTable';
import PartnerForm from './PartnerForm';
import { UserRoleManagerProps } from './types';
import { useDeliveryPartners } from './hooks/useDeliveryPartners';
import { DeliveryPartner } from './types';

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({ onRoleAssigned }) => {
  const [activeTab, setActiveTab] = useState("partners");
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Role Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="partners">Delivery Partners</TabsTrigger>
          <TabsTrigger value="assign">Assign Roles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="partners" className="space-y-4">
          <h2 className="text-xl font-semibold">Manage Delivery Partners</h2>
          <PartnerForm onRoleAssigned={handleRoleAssigned} />
          <PartnersTable 
            partners={deliveryPartners} 
            loading={loadingPartners} 
          />
        </TabsContent>
        
        <TabsContent value="assign" className="space-y-4">
          <h2 className="text-xl font-semibold">Assign User Roles</h2>
          <p className="text-gray-600">
            Use this section to change roles for existing users.
          </p>
          {/* Role assignment interface will go here */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserRoleManager;
