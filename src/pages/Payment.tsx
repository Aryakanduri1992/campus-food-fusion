
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AuthHeader from '@/components/AuthHeader';
import { useAuth } from '@/context/AuthContext';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount || 0;
  
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Add spaces after every 4 digits
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)?.join(' ') || value;
    }
    
    // Limit to 19 characters (16 digits + 3 spaces)
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
    
    // Simple validation
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
    
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      toast.success('Payment successful!');
      navigate('/orders');
    }, 1500);
  };
  
  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-12 mb-16 md:mb-0">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-rv-navy">Invalid Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>No order information found.</p>
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
              
              <Button 
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => navigate('/cart')}
                disabled={loading}
              >
                Back to Cart
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
