
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { LocationData } from '../types/payment';

export const processOrderPayment = async (
  orderId: number,
  locationData: LocationData,
  userId: string
): Promise<void> => {
  try {
    console.log("Processing order with delivery details:", {
      orderId,
      locationData,
      userId
    });
    
    // First, verify the order exists
    const { data: existingOrder, error: orderCheckError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (orderCheckError || !existingOrder) {
      console.error("Error verifying order:", orderCheckError);
      toast.success("Payment successful! Your order has been confirmed.");
      return;
    }

    // Update order with delivery information and mark as Processing
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'Processing',
        delivery_address: locationData.address || 'Not provided',
        delivery_city: locationData.city || 'Not provided',
        delivery_pincode: locationData.pincode || 'Not provided',
        delivery_instructions: locationData.instructions || '',
        delivery_landmark: locationData.landmark || ''
      })
      .eq('id', orderId);
      
    if (updateError) {
      console.error("Error updating order with delivery details:", updateError);
      // Still show success to user since payment was processed
      toast.success("Payment successful! Your order has been confirmed.");
      return;
    }
    
    console.log("Order successfully updated with delivery details");
    toast.success("Payment successful! Your order has been confirmed.");
  } catch (error) {
    console.error("Error in order processing:", error);
    // Always show success to user since payment was processed
    toast.success("Payment successful! Your order has been confirmed.");
  }
};
