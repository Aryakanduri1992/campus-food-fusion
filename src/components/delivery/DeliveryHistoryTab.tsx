
import React from 'react';
import { OrderWithDeliveryInfo } from './types';
import DeliveryHistoryCard from './DeliveryHistoryCard';

interface DeliveryHistoryTabProps {
  orders: OrderWithDeliveryInfo[];
}

const DeliveryHistoryTab: React.FC<DeliveryHistoryTabProps> = ({ orders }) => {
  return <DeliveryHistoryCard orders={orders} />;
};

export default DeliveryHistoryTab;
