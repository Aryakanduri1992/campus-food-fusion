
import { CartItem } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { 
  clearCartFromLocalStorage
} from './cartStorageService';

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
    
    // The TypeScript definition in supabase-js doesn't include our custom functions
    // so we need to use a more generic approach
    const { data, error } = await supabase
      .rpc('create_new_order', { 
        user_id_param: userId,
        total_price_param: totalPrice
      });
      
    if (error) {
      console.error('Order creation error:', error);
      throw new Error(error.message || 'Failed to create order');
    }
    
    // Cast the response to our expected type
    const newOrder = data as CreateOrderResponse;
    
    if (!newOrder || !newOrder.id) {
      throw new Error('No order was created');
    }
    
    console.log('Order created successfully:', newOrder);
    
    // Now create the order items
    const orderItems = cart.map(item => ({
      order_id: newOrder.id,
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
      console.error('Order items creation error:', itemsError);
      throw new Error('Failed to add items to order: ' + itemsError.message);
    }
    
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
    
    return newOrder.id;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};
