
import React, { memo } from 'react';

interface OrderSummaryCardProps {
  orderId: string | null;
  totalAmount: number;
}

// Using React.memo to prevent unnecessary re-renders
const OrderSummaryCard: React.FC<OrderSummaryCardProps> = memo(({ orderId, totalAmount }) => {
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
});

// Adding displayName for better debugging
OrderSummaryCard.displayName = 'OrderSummaryCard';

export default OrderSummaryCard;
