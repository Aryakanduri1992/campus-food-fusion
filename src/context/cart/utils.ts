
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from './types';
import { toast } from "sonner";

// Create a local storage key for cart items
export const CART_STORAGE_KEY = 'rv_food_cart_items';

// Save cart to local storage
export const saveCartToLocalStorage = (cart: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    console.log('Saved cart to local storage:', cart);
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
};

// Load cart from local storage
export const loadCartFromLocalStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      console.log('Loaded cart from local storage:', parsedCart);
      return parsedCart;
    }
  } catch (error) {
    console.error('Error loading cart from local storage:', error);
  }
  return [];
};

// Clear cart from local storage
export const clearCartFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing local storage:', error);
  }
};

// Format database cart items to CartItem format
export const formatDbCartItems = (dbCartItems: any[]): CartItem[] => {
  return dbCartItems.map(item => ({
    foodItem: {
      id: item.food_item_id,
      name: item.food_name,
      price: item.food_price,
      imageUrl: item.food_image_url,
      category: 'Veg', // Default category as it's not stored in DB
      description: ''
    },
    quantity: item.quantity
  }));
};

// Calculate total price of cart
export const calculateTotalPrice = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + (item.foodItem.price * item.quantity), 0);
};

// Calculate total items in cart
export const calculateTotalItems = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + item.quantity, 0);
};

// Convert cart items to database format for insertion
export const cartItemsToDbFormat = (cart: CartItem[], cartId: string) => {
  return cart.map(item => ({
    cart_id: cartId,
    food_item_id: item.foodItem.id,
    food_name: item.foodItem.name,
    food_price: item.foodItem.price,
    food_image_url: item.foodItem.imageUrl,
    quantity: item.quantity
  }));
};

// Delete all items in a cart
export const deleteCartItems = async (cartId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);
    
  if (error) {
    throw error;
  }
};

// Insert new cart items
export const insertCartItems = async (cartItems: any[]) => {
  if (cartItems.length === 0) return;
  
  const { error } = await supabase
    .from('cart_items')
    .insert(cartItems);
    
  if (error) {
    throw error;
  }
};

// Create a new cart for a user
export const createNewCart = async (userId: string) => {
  const { data: newCart, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select()
    .single();
    
  if (error) {
    throw error;
  }
    
  return newCart;
};
