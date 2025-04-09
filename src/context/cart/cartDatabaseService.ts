
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from './types';
import { formatDbCartItems, cartItemsToDbFormat } from './utils';

/**
 * Creates a new cart for a user
 */
export async function createNewCart(userId: string) {
  const { data: newCart, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select()
    .single();
    
  if (error) {
    throw error;
  }
    
  return newCart;
}

/**
 * Deletes all items in a cart
 */
export async function deleteCartItems(cartId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);
    
  if (error) {
    throw error;
  }
}

/**
 * Inserts new cart items
 */
export async function insertCartItems(cartItems: any[]) {
  if (cartItems.length === 0) return;
  
  const { error } = await supabase
    .from('cart_items')
    .insert(cartItems);
    
  if (error) {
    throw error;
  }
}

/**
 * Fetches cart items for a cart
 */
export async function fetchCartItems(cartId: string) {
  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId);
    
  if (error) throw error;
  
  if (cartItems && cartItems.length > 0) {
    return formatDbCartItems(cartItems);
  }
  
  return [];
}

/**
 * Fetches existing carts for a user
 */
export async function fetchUserCarts(userId: string) {
  const { data: existingCarts, error } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (error) throw error;
  
  return existingCarts;
}

/**
 * Creates a new order
 */
export async function createOrder(userId: string, totalPrice: number) {
  const { data: newOrder, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_price: totalPrice
    })
    .select()
    .single();
    
  if (error) {
    console.error('Order creation error:', error);
    throw new Error('Failed to create order');
  }
  
  if (!newOrder) {
    throw new Error('No order was created');
  }
  
  return newOrder;
}

/**
 * Creates order items for an order
 */
export async function createOrderItems(orderId: number, cartItems: CartItem[]) {
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
    throw new Error('Failed to add items to order');
  }
}
