
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface OrderSummaryCardProps {
  orderId: string | null;
  totalAmount: number;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ orderId, totalAmount }) => {
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-md">
      <div className="flex justify-between">
        <span className="font-semibold">Order ID:</span>
        <span className="text-gray-600">{orderId ? orderId.substring(0, 8) : 'New Order'}</span>
      </div>
      <div className="flex justify-between mt-2">
        <span className="font-semibold">Total Amount:</span>
        <span className="font-bold text-rv-burgundy">₹{totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
