
import React from 'react';
import { useDeliveryAssignment } from './hooks/useDeliveryAssignment';
import AssignDeliveryCard from './delivery/AssignDeliveryCard';
import ActiveDeliveriesCard from './delivery/ActiveDeliveriesCard';
import { OrderWithItems, DeliveryPartner } from './types';

interface DeliveryManagementTabProps {
  orders: OrderWithItems[];
  setOrders: React.Dispatch<React.SetStateAction<OrderWithItems[]>>;
  partners: DeliveryPartner[];
  setPartners: React.Dispatch<React.SetStateAction<DeliveryPartner[]>>;
}

const DeliveryManagementTab: React.FC<DeliveryManagementTabProps> = ({ 
  orders, 
  setOrders, 
  partners, 
  setPartners 
}) => {
  const {
    selectedOrder,
    setSelectedOrder,
    selectedPartner,
    setSelectedPartner,
    estimatedTime,
    setEstimatedTime,
    handleAssignDelivery,
    handleCompleteOrder
  } = useDeliveryAssignment(orders, setOrders, partners, setPartners);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <AssignDeliveryCard 
        orders={orders}
        partners={partners}
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        selectedPartner={selectedPartner}
        setSelectedPartner={setSelectedPartner}
        estimatedTime={estimatedTime}
        setEstimatedTime={setEstimatedTime}
        handleAssignDelivery={handleAssignDelivery}
      />
      
      <ActiveDeliveriesCard 
        orders={orders}
        handleCompleteOrder={handleCompleteOrder}
      />
    </div>
  );
};

export default DeliveryManagementTab;
