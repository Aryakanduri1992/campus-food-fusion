
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import PaymentLoading from '@/components/payment/PaymentLoading';
import PaymentSuccess from '@/components/payment/PaymentSuccess';
import PaymentForm from '@/components/payment/PaymentForm';
import { usePaymentForm, LocationData } from '@/hooks/usePaymentForm';

const Payment = () => {
  const { cart, getTotalPrice, loading: cartLoading, fetchCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const locationData = location.state?.locationData as LocationData | undefined;
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount || getTotalPrice();
  
  const deliveryPerson = {
    name: "Rahul Kumar",
    phone: "9876543210",
    estimatedTime: "30-45 minutes"
  };

  const {
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
    showDeliveryInfo,
    handlePayment
  } = usePaymentForm(orderId, locationData);

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      await fetchCart();
      setIsLoading(false);
    };
    
    loadCart();
  }, [fetchCart]);

  useEffect(() => {
    // Check for empty cart
    if (!isLoading && cart.length === 0 && !orderId && !totalAmount) {
      toast.error("Your cart is empty. Please add items before proceeding to payment.");
      navigate('/cart');
      return;
    }
    
    // Check for location data
    if (!isLoading && !locationData && !orderId) {
      toast.error("Please enter your delivery details first.");
      navigate('/location');
      return;
    }
  }, [locationData, navigate, isLoading, orderId, cart.length, totalAmount]);

  if (isLoading) {
    return <PaymentLoading />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-rv-navy">Secure Payment</h1>
      
      {showDeliveryInfo ? (
        <PaymentSuccess deliveryPerson={deliveryPerson} />
      ) : (
        <PaymentForm
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          nameOnCard={nameOnCard}
          setNameOnCard={setNameOnCard}
          cardNumber={cardNumber}
          handleCardNumberChange={handleCardNumberChange}
          expiryDate={expiryDate}
          handleExpiryDateChange={handleExpiryDateChange}
          cvv={cvv}
          setCvv={setCvv}
          processingPayment={processingPayment}
          progressValue={progressValue}
          totalAmount={totalAmount}
          handlePayment={handlePayment}
          cartLoading={cartLoading}
          cartEmpty={cart.length === 0 && !orderId}
        />
      )}
    </div>
  );
};

export default Payment;
