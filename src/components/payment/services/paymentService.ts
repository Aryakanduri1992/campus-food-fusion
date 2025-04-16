
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { LocationData } from '../types/payment';

export const processOrderPayment = async (
  orderId: number,
  locationData: LocationData,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'Processing',
        delivery_address: locationData.address,
        delivery_city: locationData.city,
        delivery_pincode: locationData.pincode,
        delivery_instructions: locationData.instructions
      })
      .eq('id', orderId);
      
    if (error) {
      throw error;
    }
    
    console.log("Order status updated to Processing with delivery details");
    toast.success("Payment successful!");
  } catch (error) {
    console.error("Error updating order status:", error);
    toast.error("Payment processed, but there was an issue updating your order status.");
    throw error;
  }
};
