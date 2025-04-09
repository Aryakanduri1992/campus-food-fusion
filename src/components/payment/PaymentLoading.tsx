
import React from 'react';
import { Loader2 } from 'lucide-react';

const PaymentLoading: React.FC = () => {
  return (
    <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-rv-navy mb-4" />
      <p className="text-lg">Loading your payment details...</p>
    </div>
  );
};

export default PaymentLoading;
