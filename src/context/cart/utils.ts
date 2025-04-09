
// Re-export all functions from their specialized modules
export {
  saveCartToLocalStorage,
  loadCartFromLocalStorage,
  clearCartFromLocalStorage,
  CART_STORAGE_KEY
} from './services/cartStorageService';

export {
  cartItemsToDbFormat,
  formatDbCartItems,
  createNewCart,
  deleteCartItems,
  insertCartItems,
  fetchCartItems,
  fetchUserCarts,
  createOrderItems
} from './services/cartDatabaseService';

// Export the placeOrder function from orderService
export {
  placeOrder
} from './services/orderService';

// Calculate total price of cart
export const calculateTotalPrice = (cart: any[]): number => {
  return cart.reduce((total, item) => total + (item.foodItem.price * item.quantity), 0);
};

// Calculate total items in cart
export const calculateTotalItems = (cart: any[]): number => {
  return cart.reduce((total, item) => total + item.quantity, 0);
};
