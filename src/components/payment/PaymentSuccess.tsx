
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface DeliveryPerson {
  name: string;
  phone: string;
  estimatedTime: string;
}

interface PaymentSuccessProps {
  deliveryPerson: DeliveryPerson;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ deliveryPerson }) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-rv-navy/10">
      <CardHeader className="bg-green-50">
        <CardTitle className="text-center text-green-700">Order Confirmed!</CardTitle>
        <CardDescription className="text-center text-green-600">
          Your order has been placed successfully.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-2">Delivery Information</h3>
          <div className="space-y-2">
            <p className="text-sm"><span className="font-semibold">Delivery Partner:</span> {deliveryPerson.name}</p>
            <p className="text-sm"><span className="font-semibold">Contact Number:</span> {deliveryPerson.phone}</p>
            <p className="text-sm"><span className="font-semibold">Estimated Delivery:</span> {deliveryPerson.estimatedTime}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 text-center">You will receive updates about your order status.</p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-rv-burgundy hover:bg-rv-burgundy/90"
          onClick={() => navigate('/orders')}
        >
          View Order Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentSuccess;
