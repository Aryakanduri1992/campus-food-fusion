
import React, { memo } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderSummaryCardProps {
  orderId: string | number | null;
  totalAmount: number;
  error?: string | null;
}

// Using React.memo to prevent unnecessary re-renders
const OrderSummaryCard: React.FC<OrderSummaryCardProps> = memo(({ orderId, totalAmount, error }) => {
  return (
    <div className={cn(
      "mb-4 p-4 rounded-md shadow-sm",
      error ? "bg-red-50 border border-red-200" : "bg-gray-50"
    )}>
      {error && (
        <div className="mb-3 flex items-start gap-2 text-red-600">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      <div className="flex justify-between">
        <span className="font-semibold">Order ID:</span>
        <span className="text-gray-600">
          {orderId 
            ? typeof orderId === 'string' 
              ? orderId.substring(0, 8) 
              : `#${orderId}`
            : 'New Order'
          }
        </span>
      </div>
      
      <div className="flex justify-between mt-2">
        <span className="font-semibold">Total Amount:</span>
        <span className="font-bold text-rv-burgundy">₹{totalAmount.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between mt-2">
        <span className="font-semibold">Delivery Fee:</span>
        <span className="text-gray-700">₹30.00</span>
      </div>
      
      <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
        <span className="font-semibold">Final Total:</span>
        <span className="font-bold text-rv-burgundy">₹{(totalAmount + 30).toFixed(2)}</span>
      </div>
    </div>
  );
});

// Adding displayName for better debugging
OrderSummaryCard.displayName = 'OrderSummaryCard';

export default OrderSummaryCard;
