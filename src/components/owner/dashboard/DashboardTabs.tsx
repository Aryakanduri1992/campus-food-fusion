
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersTab from '../OrdersTab';
import DeliveryManagementTab from '../DeliveryManagementTab';
import PartnersTab from '../PartnersTab';
import UserRoleManager from '@/components/user-roles/UserRoleManager';
import { OrderWithItems, DeliveryPartner } from '../types';

interface DashboardTabsProps {
  orders: OrderWithItems[];
  setOrders: React.Dispatch<React.SetStateAction<OrderWithItems[]>>;
  partners: DeliveryPartner[];
  setPartners: React.Dispatch<React.SetStateAction<DeliveryPartner[]>>;
  handleRoleAssigned: () => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  orders,
  setOrders,
  partners,
  setPartners,
  handleRoleAssigned,
}) => {
  return (
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
  );
};

export default DashboardTabs;
