
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from './types';
import { formatDbCartItems, cartItemsToDbFormat } from './utils';

/**
 * Creates a new cart for a user
 */
export async function createNewCart(userId: string) {
  try {
    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating new cart:', error);
      throw error;
    }
      
    return newCart;
  } catch (error) {
    console.error('Failed to create new cart:', error);
    throw new Error('Failed to create new cart');
  }
}

/**
 * Deletes all items in a cart
 */
export async function deleteCartItems(cartId: string) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);
      
    if (error) {
      console.error('Error deleting cart items:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete cart items:', error);
    throw new Error('Failed to delete cart items');
  }
}

/**
 * Inserts new cart items
 */
export async function insertCartItems(cartItems: any[]) {
  if (cartItems.length === 0) return;
  
  try {
    const { error } = await supabase
      .from('cart_items')
      .insert(cartItems);
      
    if (error) {
      console.error('Error inserting cart items:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to insert cart items:', error);
    throw new Error('Failed to insert cart items');
  }
}

/**
 * Fetches cart items for a cart
 */
export async function fetchCartItems(cartId: string) {
  try {
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId);
      
    if (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
    
    if (cartItems && cartItems.length > 0) {
      return formatDbCartItems(cartItems);
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch cart items:', error);
    throw new Error('Failed to fetch cart items');
  }
}

/**
 * Fetches existing carts for a user
 */
export async function fetchUserCarts(userId: string) {
  try {
    const { data: existingCarts, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error('Error fetching user carts:', error);
      throw error;
    }
    
    return existingCarts;
  } catch (error) {
    console.error('Failed to fetch user carts:', error);
    throw new Error('Failed to fetch user carts');
  }
}

/**
 * Creates a new order
 */
export async function createOrder(userId: string, totalPrice: number) {
  try {
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
      throw new Error('Failed to create order: ' + error.message);
    }
    
    if (!newOrder) {
      throw new Error('No order was created');
    }
    
    return newOrder;
  } catch (error) {
    console.error('Failed to create order:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create order');
  }
}

/**
 * Creates order items for an order
 */
export async function createOrderItems(orderId: number, cartItems: CartItem[]) {
  try {
    const orderItems = cartItems.map(item => ({
      order_id: orderId,
      food_item_id: item.foodItem.id,
      food_name: item.foodItem.name,
      food_price: item.foodItem.price,
      food_image_url: item.foodItem.imageUrl,
      quantity: item.quantity
    }));
    
    const { error } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (error) {
      console.error('Order items creation error:', error);
      throw new Error('Failed to add items to order: ' + error.message);
    }
  } catch (error) {
    console.error('Failed to create order items:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to add items to order');
  }
}
