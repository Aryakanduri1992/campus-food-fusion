
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { formatCardNumber, formatExpiryDate, validatePaymentFields } from '@/components/payment/utils/paymentValidation';
import { processOrderPayment } from '@/components/payment/services/paymentService';
import { LocationData, PaymentFormState } from '@/components/payment/types/payment';

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
    
    // Skip location data validation - proceed with payment regardless
    
    setState(prev => ({ ...prev, processingPayment: true, progressValue: 0 }));
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      let orderIdToUse = orderId;
      
      if (!orderIdToUse) {
        // Create a mock location data if none is provided
        const mockLocationData = locationData || {
          address: "Default Address",
          city: "Default City",
          pincode: "000000",
          totalAmount: 0
        };
        
        const totalAmount = mockLocationData.totalAmount || 0;
        
        const { data, error } = await supabase.rpc(
          'create_new_order',
          {
            user_id_param: userData.user.id,
            total_price_param: totalAmount
          }
        );

        if (error || !data) {
          throw new Error(error?.message || 'Failed to create order');
        }
        
        if (typeof data === 'object' && data !== null && 'id' in data) {
          const newOrderId = data.id;
          if (typeof newOrderId === 'string' || typeof newOrderId === 'number') {
            orderIdToUse = newOrderId;
          } else {
            throw new Error('Invalid order ID type from create_new_order');
          }
        } else {
          throw new Error('Invalid response from create_new_order');
        }
      }
      
      const orderIdNumber = typeof orderIdToUse === 'string' ? parseInt(orderIdToUse, 10) : orderIdToUse;
      
      if (orderIdNumber && !isNaN(Number(orderIdNumber))) {
        // Use locationData if available, otherwise use default data
        const finalLocationData = locationData || {
          address: "Default Address",
          city: "Default City",
          pincode: "000000",
          totalAmount: 0
        };
        
        await processOrderPayment(Number(orderIdNumber), finalLocationData, userData.user.id);
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
