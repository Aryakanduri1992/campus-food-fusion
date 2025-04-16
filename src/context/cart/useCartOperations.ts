import { useState, useCallback } from 'react';
import { CartItem, CartState } from './types';
import { toast } from "sonner";
import { User } from '@supabase/supabase-js';
import { FoodItem } from '@/types';
import { 
  saveCartToLocalStorage,
  loadCartFromLocalStorage,
  clearCartFromLocalStorage
} from './services/cartStorageService';
import { 
  deleteCartItems, 
  insertCartItems, 
  createNewCart, 
  fetchUserCarts, 
  fetchCartItems,
  cartItemsToDbFormat,
  formatDbCartItems,
  createOrderItems
} from './services/cartDatabaseService';
import { placeOrder } from './services/orderService';

export function useCartOperations(user: User | null) {
  const [state, setState] = useState<CartState>({
    cart: [],
    loading: false,
    cartId: null
  });

  const syncCartToDatabase = useCallback(async (updatedCart: CartItem[], targetCartId: string | null = state.cartId) => {
    saveCartToLocalStorage(updatedCart);
    
    if (!user || !targetCartId) {
      console.log('Not syncing to DB - no user or cartId');
      return;
    }
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      console.log('Syncing cart to database. CartId:', targetCartId);
      await deleteCartItems(targetCartId);
        
      if (updatedCart.length > 0) {
        const cartItemsToInsert = cartItemsToDbFormat(updatedCart, targetCartId);
        
        console.log('Inserting items to DB:', cartItemsToInsert);
        
        await insertCartItems(cartItemsToInsert);
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user, state.cartId]);

  const fetchCart = useCallback(async () => {
    console.log('Fetching cart, user:', user?.id);
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      if (!user) {
        const savedCart = loadCartFromLocalStorage();
        console.log('Loaded cart from local storage:', savedCart);
        setState(prev => ({ ...prev, cart: savedCart, cartId: null }));
        return;
      }
      
      const existingCarts = await fetchUserCarts(user.id);
      
      console.log('Existing carts:', existingCarts);
        
      let currentCartId;
      
      if (existingCarts && existingCarts.length > 0) {
        currentCartId = existingCarts[0].id;
        
        try {
          const formattedItems = await fetchCartItems(currentCartId);
          
          if (formattedItems.length > 0) {
            console.log('Formatted cart items:', formattedItems);
            setState(prev => ({ ...prev, cart: formattedItems, cartId: currentCartId }));
            saveCartToLocalStorage(formattedItems);
          } else {
            console.log('Cart exists but is empty, checking local storage');
            const savedCart = loadCartFromLocalStorage();
            if (savedCart && savedCart.length > 0) {
              console.log('Found items in local storage, syncing to DB');
              setState(prev => ({ ...prev, cart: savedCart, cartId: currentCartId }));
              await syncCartToDatabase(savedCart, currentCartId);
            } else {
              setState(prev => ({ ...prev, cart: [], cartId: currentCartId }));
              saveCartToLocalStorage([]);
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
              setState(prev => ({ ...prev, cart: savedCart, cartId: currentCartId }));
              await syncCartToDatabase(savedCart, newCart.id);
            } else {
              setState(prev => ({ ...prev, cart: [], cartId: currentCartId }));
            }
          } catch (error) {
            console.error('Error syncing local cart to DB:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      const savedCart = loadCartFromLocalStorage();
      setState(prev => ({ ...prev, cart: savedCart || [] }));
      toast.error('Failed to load your cart from server, using local data');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user, syncCartToDatabase]);

  const addToCart = useCallback((foodItem: FoodItem) => {
    setState(prev => {
      const existingItem = prev.cart.find(item => item.foodItem.id === foodItem.id);
      
      let updatedCart;
      if (existingItem) {
        updatedCart = prev.cart.map(item => 
          item.foodItem.id === foodItem.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
        toast.success(`Added ${foodItem.name} to cart`);
      } else {
        updatedCart = [...prev.cart, { foodItem, quantity: 1 }];
        toast.success(`Added ${foodItem.name} to cart`);
      }
      
      console.log('Updated cart after add:', updatedCart);
      
      const newState = { ...prev, cart: updatedCart };
      
      setTimeout(() => syncCartToDatabase(updatedCart), 0);
      
      return newState;
    });
  }, [syncCartToDatabase]);

  const removeFromCart = useCallback((foodItemId: number) => {
    setState(prev => {
      const itemToRemove = prev.cart.find(item => item.foodItem.id === foodItemId);
      if (itemToRemove) {
        toast.info(`Removed ${itemToRemove.foodItem.name} from cart`);
      }
      
      const updatedCart = prev.cart.filter(item => item.foodItem.id !== foodItemId);
      
      console.log('Updated cart after remove:', updatedCart);
      
      setTimeout(() => syncCartToDatabase(updatedCart), 0);
      
      return { ...prev, cart: updatedCart };
    });
  }, [syncCartToDatabase]);

  const updateQuantity = useCallback((foodItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(foodItemId);
      return;
    }

    setState(prev => {
      const updatedCart = prev.cart.map(item => 
        item.foodItem.id === foodItemId 
          ? { ...item, quantity: newQuantity } 
          : item
      );
      
      console.log('Updated cart after quantity change:', updatedCart);
      
      setTimeout(() => syncCartToDatabase(updatedCart), 0);
      
      return { ...prev, cart: updatedCart };
    });
  }, [removeFromCart, syncCartToDatabase]);

  const clearCart = useCallback(() => {
    clearCartFromLocalStorage();
    
    setState(prev => ({ ...prev, cart: [] }));
    
    if (user && state.cartId) {
      (async () => {
        try {
          await deleteCartItems(state.cartId);
          toast.info('Cart cleared');
        } catch (error) {
          console.error('Error clearing cart:', error);
          toast.error('Failed to clear cart');
        }
      })();
    } else {
      toast.info('Cart cleared');
    }
  }, [user, state.cartId]);

  const placeOrderCallback = useCallback(async (userId?: string, cartItems?: CartItem[], cartId?: string | null): Promise<number> => {
    if (!user) {
      toast.error('Please log in to place an order');
      return 0;
    }
    
    if (state.cart.length === 0) {
      toast.error('Your cart is empty');
      return 0;
    }
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      const totalPrice = await placeOrder(user.id, state.cart, state.cartId);
      setState(prev => ({ ...prev, loading: false }));
      
      return totalPrice;
    } catch (error) {
      console.error('Error placing order:', error);
      setState(prev => ({ ...prev, loading: false }));
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
      throw error;
    }
  }, [user, state.cart, state.cartId]);

  return {
    state,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder: placeOrderCallback
  };
}
