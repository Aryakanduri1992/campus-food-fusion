
import React from 'react';

interface PaymentSummaryProps {
  totalAmount: number;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ totalAmount }) => {
  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex justify-between mb-2">
        <span>Subtotal:</span>
        <span>₹{totalAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>Delivery Fee:</span>
        <span>₹30.00</span>
      </div>
      <div className="flex justify-between font-bold mt-2 pt-2 border-t">
        <span>Total:</span>
        <span>₹{(Number(totalAmount) + 30).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PaymentSummary;
