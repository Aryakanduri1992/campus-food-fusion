
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CreditCard, WalletIcon } from 'lucide-react';
import CardPaymentForm from './CardPaymentForm';
import UpiPaymentForm from './UpiPaymentForm';
import PaymentProgress from './PaymentProgress';
import PaymentSummary from './PaymentSummary';

interface PaymentFormProps {
  paymentMethod: 'card' | 'upi';
  setPaymentMethod: (value: 'card' | 'upi') => void;
  nameOnCard: string;
  setNameOnCard: (value: string) => void;
  cardNumber: string;
  handleCardNumberChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  expiryDate: string;
  handleExpiryDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cvv: string;
  setCvv: (value: string) => void;
  processingPayment: boolean;
  progressValue: number;
  totalAmount: number;
  handlePayment: () => Promise<void>;
  cartLoading: boolean;
  cartEmpty: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethod,
  setPaymentMethod,
  nameOnCard,
  setNameOnCard,
  cardNumber,
  handleCardNumberChange,
  expiryDate,
  handleExpiryDateChange,
  cvv,
  setCvv,
  processingPayment,
  progressValue,
  totalAmount,
  handlePayment,
  cartLoading,
  cartEmpty
}) => {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-rv-navy/10">
      <CardHeader>
        <CardTitle className="text-center">Payment Options</CardTitle>
        <CardDescription className="text-center">
          Choose your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="card" onValueChange={(value) => setPaymentMethod(value as 'card' | 'upi')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="card" className="flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="upi" className="flex items-center justify-center gap-2">
              <WalletIcon className="h-4 w-4" />
              UPI
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card">
            <CardPaymentForm
              nameOnCard={nameOnCard}
              setNameOnCard={setNameOnCard}
              cardNumber={cardNumber}
              handleCardNumberChange={handleCardNumberChange}
              expiryDate={expiryDate}
              handleExpiryDateChange={handleExpiryDateChange}
              cvv={cvv}
              setCvv={setCvv}
            />
          </TabsContent>
          
          <TabsContent value="upi">
            <UpiPaymentForm />
          </TabsContent>
        </Tabs>
        
        {processingPayment && <PaymentProgress progressValue={progressValue} />}
        
        <PaymentSummary totalAmount={totalAmount} />
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-rv-burgundy hover:bg-rv-burgundy/90"
          onClick={handlePayment}
          disabled={processingPayment || cartLoading || cartEmpty}
        >
          {processingPayment ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ₹${(Number(totalAmount) + 30).toFixed(2)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentForm;
