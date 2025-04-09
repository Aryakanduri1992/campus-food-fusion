
import { CartItem } from './types';

/**
 * Calculate total price of cart
 */
export const calculateTotalPrice = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + (item.foodItem.price * item.quantity), 0);
};

/**
 * Calculate total items in cart
 */
export const calculateTotalItems = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Convert cart items to database format for insertion
 */
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

/**
 * Format database cart items to CartItem format
 */
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
