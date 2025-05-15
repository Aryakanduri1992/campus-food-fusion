import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnersTable from './PartnersTable';
import PartnerForm from './PartnerForm';

export const UserRoleManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("partners");

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
          <PartnerForm />
          <PartnersTable />
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
