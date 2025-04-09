
import { CartItem } from '../types';
import { 
  createOrder as createOrderInDb, 
  createOrderItems,
  deleteCartItems
} from './cartDatabaseService';
import { clearCartFromLocalStorage } from './cartStorageService';

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
    
    // Create the order record first
    const newOrder = await createOrderInDb(userId, totalPrice);
    
    console.log('Order created successfully:', newOrder);
    
    // Now create the order items
    await createOrderItems(newOrder.id, cart);
    
    // Clear the cart after successful order creation
    if (cartId) {
      await deleteCartItems(cartId);
    }
    clearCartFromLocalStorage();
    
    return newOrder.id;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};
