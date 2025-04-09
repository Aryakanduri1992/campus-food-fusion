
import React from 'react';
import { OrderWithDeliveryInfo } from './types';
import EmptyOrdersCard from './EmptyOrdersCard';
import AssignedOrdersList from './AssignedOrdersList';
import OrderDetailCard from './OrderDetailCard';
import EmptySelectionCard from './EmptySelectionCard';

interface ActiveDeliveriesTabProps {
  orders: OrderWithDeliveryInfo[];
  selectedOrder: OrderWithDeliveryInfo | null;
  setSelectedOrder: (order: OrderWithDeliveryInfo) => void;
  markAsDelivered: (orderId: string) => void;
}

const ActiveDeliveriesTab: React.FC<ActiveDeliveriesTabProps> = ({
  orders,
  selectedOrder,
  setSelectedOrder,
  markAsDelivered
}) => {
  if (orders.length === 0) {
    return <EmptyOrdersCard />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <AssignedOrdersList
          orders={orders}
          selectedOrderId={selectedOrder?.id || null}
          onSelectOrder={setSelectedOrder}
        />
      </div>
      
      <div className="lg:col-span-2">
        {selectedOrder ? (
          <OrderDetailCard
            order={selectedOrder}
            onMarkDelivered={markAsDelivered}
          />
        ) : (
          <EmptySelectionCard />
        )}
      </div>
    </div>
  );
};

export default ActiveDeliveriesTab;
