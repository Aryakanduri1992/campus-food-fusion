
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersTab from './OrdersTab';
import DeliveryManagementTab from './DeliveryManagementTab';
import PartnersTab from './PartnersTab';
import UserRoleManager from '@/components/UserRoleManager';
import LoadingState from './LoadingState';
import { useOwnerDashboard } from './hooks/useOwnerDashboard';

const OwnerDashboard: React.FC = () => {
  const {
    loading,
    orders,
    setOrders,
    partners,
    setPartners,
    handleRoleAssigned,
  } = useOwnerDashboard();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-rv-navy">Owner Dashboard</h1>
      
      <Tabs defaultValue="orders" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="delivery">Manage Delivery</TabsTrigger>
          <TabsTrigger value="partners">Delivery Partners</TabsTrigger>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <OrdersTab orders={orders} />
        </TabsContent>
        
        <TabsContent value="delivery">
          <DeliveryManagementTab 
            orders={orders} 
            setOrders={setOrders} 
            partners={partners} 
            setPartners={setPartners} 
          />
        </TabsContent>
        
        <TabsContent value="partners">
          <PartnersTab 
            partners={partners} 
            setPartners={setPartners} 
            onRoleAssigned={handleRoleAssigned} 
          />
        </TabsContent>
        
        <TabsContent value="roles">
          <UserRoleManager onRoleAssigned={handleRoleAssigned} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerDashboard;
