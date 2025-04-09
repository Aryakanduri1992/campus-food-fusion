
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDeliveryOrders } from '@/components/delivery/hooks/useDeliveryOrders';
import ActiveDeliveriesTab from '@/components/delivery/ActiveDeliveriesTab';
import DeliveryHistoryTab from '@/components/delivery/DeliveryHistoryTab';

const DeliveryPartner = () => {
  const {
    loading,
    assignedOrders,
    deliveryHistory,
    selectedOrder,
    setSelectedOrder,
    markAsDelivered
  } = useDeliveryOrders();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-rv-burgundy" />
        <span className="ml-2">Loading your deliveries...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-rv-navy">Delivery Partner Dashboard</h1>
      
      <Tabs defaultValue="active" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Deliveries ({assignedOrders.length})</TabsTrigger>
          <TabsTrigger value="history">Delivery History ({deliveryHistory.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <ActiveDeliveriesTab
            orders={assignedOrders}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
            markAsDelivered={markAsDelivered}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <DeliveryHistoryTab orders={deliveryHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryPartner;
