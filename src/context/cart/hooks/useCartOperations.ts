
import { useState, useCallback } from 'react';
import { CartItem, CartState } from '../types';
import { User } from '@supabase/supabase-js';
import { FoodItem } from '@/types';
import { toast } from "sonner";
import { 
  saveCartToLocalStorage,
  loadCartFromLocalStorage,
  clearCartFromLocalStorage
} from '../services/cartStorageService';
import { syncCartToDatabase } from '../services/cartSyncService';
import { fetchCart } from '../services/cartFetchService';
import { placeOrder } from '../services/orderService';

export function useCartOperations(user: User | null) {
  const [state, setState] = useState<CartState>({
    cart: [],
    loading: false,
    cartId: null
  });

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
      
      setTimeout(() => syncCartToDatabase(updatedCart, state.cartId, user), 0);
      
      return newState;
    });
  }, [syncCartToDatabase, state.cartId, user]);

  const removeFromCart = useCallback((foodItemId: number) => {
    setState(prev => {
      const itemToRemove = prev.cart.find(item => item.foodItem.id === foodItemId);
      if (itemToRemove) {
        toast.info(`Removed ${itemToRemove.foodItem.name} from cart`);
      }
      
      const updatedCart = prev.cart.filter(item => item.foodItem.id !== foodItemId);
      
      console.log('Updated cart after remove:', updatedCart);
      
      setTimeout(() => syncCartToDatabase(updatedCart, state.cartId, user), 0);
      
      return { ...prev, cart: updatedCart };
    });
  }, [syncCartToDatabase, state.cartId, user]);

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
      
      setTimeout(() => syncCartToDatabase(updatedCart, state.cartId, user), 0);
      
      return { ...prev, cart: updatedCart };
    });
  }, [removeFromCart, syncCartToDatabase, state.cartId, user]);

  const clearCart = useCallback(() => {
    clearCartFromLocalStorage();
    
    setState(prev => ({ ...prev, cart: [] }));
    
    if (user && state.cartId) {
      import('../services/cartDatabaseService').then(({ deleteCartItems }) => {
        deleteCartItems(state.cartId).then(() => {
          toast.info('Cart cleared');
        }).catch(error => {
          console.error('Error clearing cart:', error);
          toast.error('Failed to clear cart');
        });
      });
    } else {
      toast.info('Cart cleared');
    }
  }, [user, state.cartId]);

  const fetchCartCallback = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const { newCart, newCartId } = await fetchCart(user, syncCartToDatabase, state.cartId);
      setState(prev => ({ ...prev, cart: newCart, cartId: newCartId, loading: false }));
    } catch (error) {
      console.error('Error in fetchCart:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [user, syncCartToDatabase, state.cartId]);

  const placeOrderCallback = useCallback(async (): Promise<number | null> => {
    if (!user) {
      toast.error('Please log in to place an order');
      return null;
    }
    
    if (state.cart.length === 0) {
      toast.error('Your cart is empty');
      return null;
    }
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      const orderId = await placeOrder(user.id, state.cart, state.cartId);
      clearCartFromLocalStorage();
      setState(prev => ({ ...prev, cart: [], loading: false }));
      toast.success('Order placed successfully!');
      return orderId;
    } catch (error) {
      console.error('Error placing order:', error);
      setState(prev => ({ ...prev, loading: false }));
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
      throw error;
    }
  }, [user, state.cart, state.cartId]);

  return {
    state,
    fetchCart: fetchCartCallback,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder: placeOrderCallback
  };
}
