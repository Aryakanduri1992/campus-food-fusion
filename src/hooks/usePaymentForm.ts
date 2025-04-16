
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

export interface LocationData {
  address: string;
  city: string;
  pincode: string;
  instructions?: string;
  totalAmount?: number;
  coordinates?: { lat: number, lng: number };
}

export interface PaymentFormState {
  paymentMethod: 'card' | 'upi';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  processingPayment: boolean;
  progressValue: number;
  showDeliveryInfo: boolean;
}

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

  const setPaymentMethod = (value: 'card' | 'upi') => {
    setState(prev => ({ ...prev, paymentMethod: value }));
  };

  const setNameOnCard = (value: string) => {
    setState(prev => ({ ...prev, nameOnCard: value }));
  };

  const setCvv = (value: string) => {
    setState(prev => ({ ...prev, cvv: value }));
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
    setState(prev => ({ ...prev, cardNumber: formatCardNumber(value) }));
  };

  const handleExpiryDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      const month = value.substring(0, 2);
      const year = value.substring(2, 4);
      
      if (value.length <= 2) {
        setState(prev => ({ ...prev, expiryDate: value }));
      } else {
        setState(prev => ({ ...prev, expiryDate: `${month}/${year}` }));
      }
    }
  };

  const handlePayment = async () => {
    if (state.paymentMethod === 'card' && (!state.cardNumber || !state.expiryDate || !state.cvv || !state.nameOnCard)) {
      toast.error("Please fill in all card details");
      return;
    }
    
    setState(prev => ({ ...prev, processingPayment: true, progressValue: 0 }));
    
    try {
      // After successful payment processing, create the order in the database
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      const finalizeOrder = async (
        userId: string,
        cartItems: any[],
        cartId: string | null,
        totalAmount: number
      ): Promise<number> => {
        try {
          // Call the create_new_order RPC function
          const { data, error } = await supabase.rpc(
            'create_new_order',
            {
              user_id_param: userId,
              total_price_param: totalAmount
            }
          );
      
          if (error) {
            console.error('Order creation error:', error);
            throw new Error(error.message || 'Failed to create order');
          }
      
          // Ensure we have a valid order ID
          if (!data) {
            throw new Error('No order was created');
          }
      
          // Properly convert data to the expected type using a two-step type assertion
          const responseData = data as unknown as { id: number };
          const orderId = responseData.id;
      
          if (typeof orderId !== 'number') {
            throw new Error('Invalid order ID returned');
          }
      
          // Create order items after order is created
          try {
            const { error: itemsError } = await supabase.rpc(
              'create_order_items' as any,
              {
                order_id_param: orderId,
                items_json: JSON.stringify(cartItems.map(item => ({
                  food_item_id: item.foodItem.id,
                  food_name: item.foodItem.name,
                  food_price: item.foodItem.price,
                  food_image_url: item.foodItem.imageUrl,
                  quantity: item.quantity
                })))
              }
            );
      
            if (itemsError) {
              console.error('Error creating order items:', itemsError);
              throw new Error('Failed to add items to order: ' + itemsError.message);
            }
          } catch (itemsError) {
            console.error('Error creating order items:', itemsError);
            throw new Error('Failed to add items to order');
          }
          
          console.log('Order created successfully:', data);
          
          // Clear the cart after successful order creation
          if (cartId) {
            const { error: cartError } = await supabase
              .from('cart_items')
              .delete()
              .eq('cart_id', cartId);
              
            if (cartError) {
              console.error('Error clearing cart:', cartError);
            }
          }
          clearCart();
          
          return orderId;
        } catch (error) {
          console.error('Error placing order:', error);
          throw error;
        }
      };

      const totalAmount = locationData?.totalAmount || 0;
      const orderIdFinal = await finalizeOrder(userData.user.id, cart, null, totalAmount);
      console.log("Order finalized with ID:", orderIdFinal);
      
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
      const timer = setTimeout(async () => {
        try {
          if (orderId) {
            // Convert orderId to a number and validate it
            const orderIdNumber = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
            
            if (isNaN(Number(orderIdNumber))) {
              throw new Error('Invalid order ID');
            }
            
            const { error } = await supabase
              .from('orders')
              .update({ 
                status: 'Processing',
                delivery_address: locationData?.address,
                delivery_city: locationData?.city,
                delivery_pincode: locationData?.pincode,
                delivery_instructions: locationData?.instructions
              })
              .eq('id', Number(orderIdNumber));
              
            if (error) {
              throw error;
            }
            
            console.log("Order status updated to Processing with delivery details");
          }
          
          setState(prev => ({ ...prev, processingPayment: false, showDeliveryInfo: true }));
          toast.success("Payment successful!");
        } catch (error) {
          console.error("Error updating order status:", error);
          toast.error("Payment processed, but there was an issue updating your order status.");
          setState(prev => ({ ...prev, processingPayment: false, showDeliveryInfo: true }));
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [state.progressValue, state.processingPayment, orderId, locationData]);

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
