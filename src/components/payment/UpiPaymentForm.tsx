
import React from 'react';

const UpiPaymentForm: React.FC = () => {
  return (
    <div className="text-center p-4 border rounded-md bg-gray-50">
      <p className="font-semibold mb-2">Pay using UPI ID</p>
      <div className="font-mono text-lg bg-white p-2 rounded border mb-4">9113950544@upi</div>
      <div className="mx-auto mb-4 flex items-center justify-center">
        <img 
          src="/lovable-uploads/43df9ea7-4484-48cb-8d34-4556ead42374.png" 
          alt="UPI QR Code" 
          className="w-64 h-64 object-contain"
        />
      </div>
      <p className="text-sm text-gray-600">Scan the QR code or use the UPI ID to make the payment</p>
    </div>
  );
};

export default UpiPaymentForm;
