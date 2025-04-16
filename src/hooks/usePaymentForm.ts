
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { formatCardNumber, formatExpiryDate, validatePaymentFields } from '@/components/payment/utils/paymentValidation';
import { processOrderPayment } from '@/components/payment/services/paymentService';
import { LocationData, PaymentFormState } from '@/components/payment/types/payment';

// Re-export the LocationData type for components that import it from this file
export type { LocationData };

export function usePaymentForm(orderId: string | number | null, locationData: LocationData | undefined) {
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentFormState>({
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    processingPayment: false,
    progressValue: 0,
    showDeliveryInfo: false,
  });

  const { cart, clearCart } = useCart();

  // Debug logging
  useEffect(() => {
    console.log("Payment form - Location data:", locationData);
    console.log("Payment form - Order ID:", orderId);
  }, [locationData, orderId]);

  const setPaymentMethod = (value: 'card' | 'upi') => {
    setState(prev => ({ ...prev, paymentMethod: value }));
  };

  const setNameOnCard = (value: string) => {
    setState(prev => ({ ...prev, nameOnCard: value }));
  };

  const setCvv = (value: string) => {
    setState(prev => ({ ...prev, cvv: value }));
  };

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCardNumber(event.target.value);
    setState(prev => ({ ...prev, cardNumber: value }));
  };

  const handleExpiryDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatExpiryDate(event.target.value);
    setState(prev => ({ ...prev, expiryDate: value }));
  };

  const handlePayment = async () => {
    if (!validatePaymentFields(state.paymentMethod, {
      cardNumber: state.cardNumber,
      expiryDate: state.expiryDate,
      cvv: state.cvv,
      nameOnCard: state.nameOnCard
    })) {
      toast.error("Please fill in all card details correctly");
      return;
    }
    
    if (!locationData) {
      toast.error("Delivery information is missing. Please enter your delivery details.");
      navigate('/location', { replace: true });
      return;
    }
    
    setState(prev => ({ ...prev, processingPayment: true, progressValue: 0 }));
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      // Create a new order if one doesn't exist
      let orderIdToUse = orderId;
      
      if (!orderIdToUse) {
        const { data, error } = await supabase.rpc(
          'create_new_order',
          {
            user_id_param: userData.user.id,
            total_price_param: locationData.totalAmount || 0
          }
        );

        if (error || !data) {
          throw new Error(error?.message || 'Failed to create order');
        }
        
        // The data returned from the RPC is an object with an id property
        if (typeof data === 'object' && data !== null && 'id' in data) {
          orderIdToUse = data.id;
        } else {
          throw new Error('Invalid response from create_new_order');
        }
      }
      
      // Process the payment and update order status
      const orderIdNumber = typeof orderIdToUse === 'string' ? parseInt(orderIdToUse, 10) : orderIdToUse;
      
      if (orderIdNumber && !isNaN(Number(orderIdNumber))) {
        await processOrderPayment(Number(orderIdNumber), locationData, userData.user.id);
      } else {
        throw new Error('Invalid order ID');
      }
      
      setState(prev => ({ ...prev, showDeliveryInfo: true }));
      clearCart();
      
    } catch (error) {
      setState(prev => ({ ...prev, processingPayment: false, progressValue: 0 }));
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred during payment");
    }
  };

  // Handle payment processing animation
  useEffect(() => {
    if (state.processingPayment) {
      const interval = setInterval(() => {
        setState(prev => {
          const newValue = prev.progressValue + 5;
          if (newValue >= 100) {
            clearInterval(interval);
            return { ...prev, progressValue: 100 };
          }
          return { ...prev, progressValue: newValue };
        });
      }, 150);
      
      return () => clearInterval(interval);
    }
  }, [state.processingPayment]);

  // Handle payment completion
  useEffect(() => {
    if (state.progressValue === 100 && state.processingPayment) {
      const timer = setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          processingPayment: false,
          showDeliveryInfo: true 
        }));
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [state.progressValue, state.processingPayment]);

  return {
    ...state,
    setPaymentMethod,
    setNameOnCard,
    setCvv,
    handleCardNumberChange,
    handleExpiryDateChange,
    handlePayment
  };
}
