
import { CartItem } from '../types';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { 
  loadCartFromLocalStorage, 
  saveCartToLocalStorage 
} from './cartStorageService';
import { 
  fetchUserCarts, 
  fetchCartItems,
  createNewCart 
} from './cartDatabaseService';

export const fetchCart = async (
  user: User | null,
  syncCartToDatabase: (updatedCart: CartItem[], cartId: string | null, user: User | null) => Promise<void>,
  currentCartId: string | null
): Promise<{ newCart: CartItem[], newCartId: string | null }> => {
  console.log('Fetching cart, user:', user?.id);
  
  try {
    if (!user) {
      const savedCart = loadCartFromLocalStorage();
      console.log('Loaded cart from local storage:', savedCart);
      return { newCart: savedCart, newCartId: null };
    }
    
    const existingCarts = await fetchUserCarts(user.id);
    
    console.log('Existing carts:', existingCarts);
      
    let currentCartId: string | null = null;
    let cartItems: CartItem[] = [];
    
    if (existingCarts && existingCarts.length > 0) {
      currentCartId = existingCarts[0].id;
      
      try {
        const formattedItems = await fetchCartItems(currentCartId);
        
        if (formattedItems.length > 0) {
          console.log('Formatted cart items:', formattedItems);
          cartItems = formattedItems;
          saveCartToLocalStorage(formattedItems);
        } else {
          console.log('Cart exists but is empty, checking local storage');
          const savedCart = loadCartFromLocalStorage();
          if (savedCart && savedCart.length > 0) {
            console.log('Found items in local storage, syncing to DB');
            cartItems = savedCart;
            await syncCartToDatabase(savedCart, currentCartId, user);
          }
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        throw error;
      }
    } else if (user) {
      console.log('Creating new cart for user:', user.id);
      const newCart = await createNewCart(user.id);
        
      if (newCart) {
        currentCartId = newCart.id;
        
        try {
          const savedCart = loadCartFromLocalStorage();
          if (savedCart.length > 0) {
            console.log('Syncing local cart to new DB cart');
            cartItems = savedCart;
            await syncCartToDatabase(savedCart, newCart.id, user);
          }
        } catch (error) {
          console.error('Error syncing local cart to DB:', error);
        }
      }
    }
    
    return { newCart: cartItems, newCartId: currentCartId };
  } catch (error) {
    console.error('Error fetching cart:', error);
    const savedCart = loadCartFromLocalStorage();
    toast.error('Failed to load your cart from server, using local data');
    return { newCart: savedCart || [], newCartId: null };
  }
};
