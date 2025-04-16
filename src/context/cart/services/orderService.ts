
import { CartItem } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { 
  clearCartFromLocalStorage
} from './cartStorageService';

// Define the parameters for the create_new_order RPC function
interface CreateOrderParams {
  user_id_param: string;
  total_price_param: number;
}

// Define the type for our order response
interface CreateOrderResponse {
  id: number;
  user_id: string;
  total_price: number;
  status: string;
  created_at: string;
}

export const placeOrder = async (
  userId: string, 
  cart: CartItem[], 
  cartId: string | null
): Promise<number | null> => {
  if (cart.length === 0) {
    throw new Error('Your cart is empty');
  }
  
  try {
    const totalPrice = cart.reduce((total, item) => {
      return total + (item.foodItem.price * item.quantity);
    }, 0);
    
    // Call the create_new_order function with proper typing
    // Fix: provide only params type, not return type as first generic parameter
    const { data, error } = await supabase.rpc(
      'create_new_order', 
      { 
        user_id_param: userId,
        total_price_param: totalPrice
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
    
    // Cast the response data to our expected type and extract the ID
    const responseData = data as unknown as CreateOrderResponse;
    const orderId = responseData.id;
    
    if (typeof orderId !== 'number') {
      throw new Error('Invalid order ID returned');
    }

    // Create order items after order is created
    try {
      const orderItems = cart.map(item => ({
        order_id: orderId,
        food_item_id: item.foodItem.id,
        food_name: item.foodItem.name,
        food_price: item.foodItem.price,
        food_image_url: item.foodItem.imageUrl,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw new Error('Failed to add items to order');
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
    clearCartFromLocalStorage();
    
    return orderId;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};
