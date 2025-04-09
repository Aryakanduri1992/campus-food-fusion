
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface PaymentProgressProps {
  progressValue: number;
}

const PaymentProgress: React.FC<PaymentProgressProps> = ({ progressValue }) => {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Processing payment</span>
        <span className="text-sm font-medium">{progressValue}%</span>
      </div>
      <Progress value={progressValue} className="h-2" />
    </div>
  );
};

export default PaymentProgress;
