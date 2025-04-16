
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import PaymentLoading from '@/components/payment/PaymentLoading';
import PaymentSuccess from '@/components/payment/PaymentSuccess';
import PaymentForm from '@/components/payment/PaymentForm';
import { usePaymentForm } from '@/hooks/usePaymentForm';
import { LocationData } from '@/components/payment/types/payment';

const Payment = () => {
  const { cart, getTotalPrice, loading: cartLoading, fetchCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Extract and parse location state data
  const locationDataString = location.state?.locationData as string | undefined;
  const locationData = locationDataString ? JSON.parse(locationDataString) as LocationData : undefined;
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount || getTotalPrice();
  
  // For debugging
  console.log("Payment page received - Location data:", locationData);
  console.log("Payment page received - Order ID:", orderId);
  console.log("Payment page received - Total amount:", totalAmount);
  
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
      try {
        await fetchCart();
        setError(null);
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCart();
  }, [fetchCart]);

  useEffect(() => {
    // Only redirect if we've loaded and aren't in payment process or success state
    if (!isLoading && !processingPayment && !showDeliveryInfo) {
      // Check for location data first
      if (!locationData) {
        toast.error("Please enter your delivery details first");
        navigate('/location', { replace: true });
        return;
      }
      
      // Validate total amount
      if (!totalAmount || totalAmount <= 0) {
        toast.error("Invalid order amount");
        navigate('/cart', { replace: true });
        return;
      }
      
      // Then check for empty cart when not in order flow
      if (cart.length === 0 && !orderId && !totalAmount) {
        toast.error("Your cart is empty. Please add items before proceeding to payment.");
        navigate('/cart', { replace: true });
        return;
      }
    }
  }, [locationData, navigate, isLoading, orderId, cart.length, totalAmount, processingPayment, showDeliveryInfo]);

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
