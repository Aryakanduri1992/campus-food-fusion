
import { CartItem } from './types';

// Create a local storage key for cart items
export const CART_STORAGE_KEY = 'rv_food_cart_items';

/**
 * Save cart to local storage
 */
export const saveCartToLocalStorage = (cart: CartItem[]): void => {
  try {
    if (cart && cart.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      console.log('Saved cart to local storage:', cart);
    } else {
      // If cart is empty, clear local storage
      localStorage.removeItem(CART_STORAGE_KEY);
      console.log('Cleared cart from local storage (empty cart)');
    }
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
};

/**
 * Load cart from local storage
 */
export const loadCartFromLocalStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      console.log('Loaded cart from local storage:', parsedCart);
      
      // Validate the cart structure
      if (Array.isArray(parsedCart) && parsedCart.every(item => 
          item && 
          item.foodItem && 
          typeof item.foodItem.id === 'number' && 
          typeof item.quantity === 'number'
      )) {
        return parsedCart;
      } else {
        console.error('Invalid cart structure in local storage');
        clearCartFromLocalStorage();
        return [];
      }
    }
  } catch (error) {
    console.error('Error loading cart from local storage:', error);
    clearCartFromLocalStorage();
  }
  return [];
};

/**
 * Clear cart from local storage
 */
export const clearCartFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    console.log('Cleared cart from local storage');
  } catch (error) {
    console.error('Error clearing local storage:', error);
  }
};
