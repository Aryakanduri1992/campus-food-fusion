
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { CreditCard, WalletIcon, Loader2, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';

const Payment = () => {
  const { cart, getTotalPrice, placeOrder, loading: cartLoading, fetchCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const locationData = location.state?.locationData;
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount || getTotalPrice();
  
  const deliveryPerson = {
    name: "Rahul Kumar",
    phone: "9876543210",
    estimatedTime: "30-45 minutes"
  };

  // Fetch cart data when component mounts
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      await fetchCart();
      setIsLoading(false);
    };
    
    loadCart();
  }, [fetchCart]);

  // Check if we have an order ID or cart items
  useEffect(() => {
    if (!isLoading && cart.length === 0 && !orderId) {
      toast("Your cart is empty. Please add items before proceeding to payment.");
      navigate('/cart');
    }
  }, [cart, navigate, isLoading, orderId]);

  // Check if location data is available
  useEffect(() => {
    if (!isLoading && !locationData && !orderId) {
      toast("Please enter your delivery details first.");
      navigate('/location');
    }
  }, [locationData, navigate, isLoading, orderId]);

  // Simulate payment progress
  useEffect(() => {
    if (processingPayment) {
      const interval = setInterval(() => {
        setProgressValue(prev => {
          const newValue = prev + 5;
          if (newValue >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newValue;
        });
      }, 150);
      
      return () => clearInterval(interval);
    }
  }, [processingPayment]);

  // Complete payment when progress reaches 100%
  useEffect(() => {
    if (progressValue === 100 && processingPayment) {
      const timer = setTimeout(() => {
        setProcessingPayment(false);
        setShowDeliveryInfo(true);
        toast.success("Payment successful!");
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [progressValue, processingPayment]);

  const handlePayment = async () => {
    if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv || !nameOnCard)) {
      toast.error("Please fill in all card details");
      return;
    }
    
    setProcessingPayment(true);
    setProgressValue(0);
    
    try {
      // Use existing order ID or place a new order
      let finalOrderId = orderId;
      
      if (!finalOrderId) {
        finalOrderId = await placeOrder();
      }
      
      if (!finalOrderId) {
        throw new Error("Failed to place order");
      }
      
      // For demo purposes, we'll update the order in the database
      // In a real app, you would integrate with a payment provider
      if (finalOrderId) {
        // Update order with payment information
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'Processing',
            // You could store payment method, but we'll omit sensitive data
          })
          .eq('id', finalOrderId);
          
        if (error) {
          throw error;
        }
      }
      
      // Progress will continue and complete via the useEffect above
      
    } catch (error) {
      setProcessingPayment(false);
      setProgressValue(0);
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred during payment");
    }
  };

  const formatCardNumber = (value: string) => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = val.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCardNumber(formatCardNumber(value));
  };

  const handleExpiryDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      const month = value.substring(0, 2);
      const year = value.substring(2, 4);
      
      if (value.length <= 2) {
        setExpiryDate(value);
      } else {
        setExpiryDate(`${month}/${year}`);
      }
    }
  };

  // Show loading state while cart is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-rv-navy mb-4" />
        <p className="text-lg">Loading your payment details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-rv-navy">Secure Payment</h1>
      
      {showDeliveryInfo ? (
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
      ) : (
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
              
              <TabsContent value="card" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nameOnCard">Name on Card</Label>
                  <Input
                    id="nameOnCard"
                    placeholder="John Doe"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      maxLength={3}
                      type="password"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="upi" className="space-y-4">
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
              </TabsContent>
            </Tabs>
            
            {processingPayment && (
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Processing payment</span>
                  <span className="text-sm font-medium">{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            )}
            
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
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-rv-burgundy hover:bg-rv-burgundy/90"
              onClick={handlePayment}
              disabled={processingPayment || cartLoading || (cart.length === 0 && !orderId)}
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
      )}
    </div>
  );
};

export default Payment;
