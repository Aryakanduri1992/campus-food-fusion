
import { CartItem } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { 
  clearCartFromLocalStorage
} from './cartStorageService';

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
    
    // Create the order record directly without referencing the users table
    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_price: totalPrice,
        status: 'Placed'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Order creation error:', error);
      if (error.code === '42501') {
        throw new Error('Permission denied. Please check your account permissions.');
      }
      throw new Error(error.message || 'Failed to create order');
    }
    
    if (!newOrder) {
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
