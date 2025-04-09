
import { CartItem } from '../types';
import { User } from '@supabase/supabase-js';
import { saveCartToLocalStorage } from './cartStorageService';
import { 
  deleteCartItems, 
  insertCartItems, 
  cartItemsToDbFormat 
} from './cartDatabaseService';

export const syncCartToDatabase = async (
  updatedCart: CartItem[], 
  cartId: string | null = null,
  user: User | null = null
) => {
  saveCartToLocalStorage(updatedCart);
  
  if (!user || !cartId) {
    console.log('Not syncing to DB - no user or cartId');
    return;
  }
  
  try {
    console.log('Syncing cart to database. CartId:', cartId);
    await deleteCartItems(cartId);
      
    if (updatedCart.length > 0) {
      const cartItemsToInsert = cartItemsToDbFormat(updatedCart, cartId);
      
      console.log('Inserting items to DB:', cartItemsToInsert);
      
      await insertCartItems(cartItemsToInsert);
    }
  } catch (error) {
    console.error('Error syncing cart:', error);
    throw error;
  }
};
