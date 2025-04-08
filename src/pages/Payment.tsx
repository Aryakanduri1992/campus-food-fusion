
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AuthHeader from '@/components/AuthHeader';
import { useAuth } from '@/context/AuthContext';
import DeliveryTracking from '@/components/DeliveryTracking';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount || 0;
  const locationData = location.state?.locationData;
  
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [upiId, setUpiId] = useState('9113950544@upi');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)?.join(' ') || value;
    }
    
    if (value.length <= 19) {
      setPaymentDetails(prev => ({
        ...prev,
        cardNumber: value
      }));
    }
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    if (value.length <= 5) {
      setPaymentDetails(prev => ({
        ...prev,
        expiryDate: value
      }));
    }
  };
  
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 3) {
      setPaymentDetails(prev => ({
        ...prev,
        cvv: value
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'card') {
      if (!paymentDetails.cardName.trim()) {
        toast.error('Please enter cardholder name');
        return;
      }
      
      if (paymentDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      
      if (!paymentDetails.expiryDate.includes('/')) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return;
      }
      
      if (paymentDetails.cvv.length !== 3) {
        toast.error('Please enter a valid 3-digit CVV');
        return;
      }
    }
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setOrderPlaced(true);
      toast.success('Payment successful!');
    }, 1500);
  };
  
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">Order Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <p className="mb-2">Your order has been successfully placed.</p>
                <p className="text-sm text-gray-500">Order ID: {orderId?.substring(0, 8)}</p>
              </div>
              
              <DeliveryTracking orderId={orderId} />
              
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold mb-2">Delivery Address:</h3>
                <p className="text-sm">{locationData?.address}</p>
                {locationData?.landmark && <p className="text-sm text-gray-600">Landmark: {locationData.landmark}</p>}
                <p className="text-sm">{locationData?.city}, {locationData.pincode}</p>
                {locationData?.instructions && <p className="text-sm italic mt-2">"{locationData.instructions}"</p>}
              </div>
              
              <Button 
                className="w-full mt-6"
                onClick={() => navigate('/orders')}
              >
                View All Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!orderId || !locationData) {
    return (
      <div className="container mx-auto px-4 py-12 mb-16 md:mb-0">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-rv-navy">Invalid Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>No order or location information found.</p>
            <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="max-w-md mx-auto">
        <AuthHeader />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-rv-navy">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between">
                <span className="font-semibold">Order ID:</span>
                <span className="text-gray-600">{orderId.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-rv-burgundy">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">Delivery To:</h3>
              <p className="text-sm">{locationData.address}</p>
              {locationData.landmark && <p className="text-sm text-gray-600">Landmark: {locationData.landmark}</p>}
              <p className="text-sm">{locationData.city}, {locationData.pincode}</p>
            </div>
            
            <Tabs defaultValue="card" className="w-full mb-4" onValueChange={setPaymentMethod}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="card">Credit/Debit Card</TabsTrigger>
                <TabsTrigger value="upi">UPI Payment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="card">
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input 
                      id="cardName" 
                      name="cardName" 
                      placeholder="Enter cardholder name"
                      value={paymentDetails.cardName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber}
                      onChange={handleCardNumberChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={paymentDetails.expiryDate}
                        onChange={handleExpiryDateChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        placeholder="123"
                        type="password"
                        value={paymentDetails.cvv}
                        onChange={handleCvvChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-rv-navy hover:bg-rv-burgundy"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Pay ₹'+totalAmount.toFixed(2)}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="upi">
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-gray-50 rounded-md text-center">
                    <p className="font-semibold mb-2">UPI Payment</p>
                    <p className="text-lg font-bold my-3">{upiId}</p>
                    <p className="text-sm text-gray-600 mb-3">Please use the UPI ID above to make your payment of ₹{totalAmount.toFixed(2)}</p>
                    <div className="bg-white p-4 rounded-md border border-gray-200 max-w-xs mx-auto mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold">Scan QR Code</div>
                        <div className="h-48 flex items-center justify-center border border-dashed border-gray-300 mt-2 mb-2">
                          <p className="text-sm text-gray-500">QR Code Placeholder</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">After completing the payment, click the button below</p>
                  </div>
                  
                  <Button 
                    onClick={handleSubmit}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'I\'ve Completed the Payment'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <Button 
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => navigate('/location', { 
                state: { 
                  orderId: orderId,
                  totalAmount: totalAmount
                } 
              })}
              disabled={loading}
            >
              Back to Delivery Details
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
