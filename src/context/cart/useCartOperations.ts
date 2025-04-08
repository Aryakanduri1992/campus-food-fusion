
import { useState, useCallback } from 'react';
import { CartItem, CartState } from './types';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import {
  saveCartToLocalStorage,
  loadCartFromLocalStorage,
  clearCartFromLocalStorage,
  formatDbCartItems,
  cartItemsToDbFormat,
  deleteCartItems,
  insertCartItems,
  createNewCart
} from './utils';
import { FoodItem } from '@/types';

export function useCartOperations(user: User | null) {
  const [state, setState] = useState<CartState>({
    cart: [],
    loading: false,
    cartId: null
  });

  const syncCartToDatabase = useCallback(async (updatedCart: CartItem[], targetCartId: string | null = state.cartId) => {
    // Always save to local storage first for faster access
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
        // If user is not logged in, try to get cart from local storage
        const savedCart = loadCartFromLocalStorage();
        console.log('Loaded cart from local storage:', savedCart);
        setState(prev => ({ ...prev, cart: savedCart, cartId: null }));
        return;
      }
      
      // User is logged in, try to get cart from database
      const { data: existingCarts, error: cartsError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (cartsError) throw cartsError;
      
      console.log('Existing carts:', existingCarts);
        
      let currentCartId;
      
      if (existingCarts && existingCarts.length > 0) {
        currentCartId = existingCarts[0].id;
        
        const { data: cartItems, error: itemsError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('cart_id', currentCartId);
          
        if (itemsError) throw itemsError;
        
        console.log('Cart items from DB:', cartItems);
          
        if (cartItems && cartItems.length > 0) {
          const formattedItems = formatDbCartItems(cartItems);
          
          console.log('Formatted cart items:', formattedItems);
          setState(prev => ({ ...prev, cart: formattedItems, cartId: currentCartId }));
          // Also save to local storage
          saveCartToLocalStorage(formattedItems);
        } else {
          // Cart exists but is empty - check if there's something in local storage
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
      } else if (user) {
        console.log('Creating new cart for user:', user.id);
        const newCart = await createNewCart(user.id);
          
        if (newCart) {
          currentCartId = newCart.id;
          
          // Try to get cart from local storage and save to DB
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
      // Fall back to local storage on error
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
      
      // Don't call syncCartToDatabase inside setState to avoid infinite loop
      const newState = { ...prev, cart: updatedCart };
      
      // Schedule sync to run after state update
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
      
      // Schedule sync to run after state update
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
      
      // Schedule sync to run after state update
      setTimeout(() => syncCartToDatabase(updatedCart), 0);
      
      return { ...prev, cart: updatedCart };
    });
  }, [removeFromCart, syncCartToDatabase]);

  const clearCart = useCallback(() => {
    // Clear local storage
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

  const placeOrder = useCallback(async (): Promise<string | null> => {
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
      const totalPrice = state.cart.reduce((total, item) => {
        return total + (item.foodItem.price * item.quantity);
      }, 0);
      
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_price: totalPrice
        })
        .select()
        .single();
        
      if (orderError || !newOrder) {
        throw orderError || new Error('Failed to create order');
      }
      
      const orderItems = state.cart.map(item => ({
        order_id: newOrder.id,
        food_item_id: item.foodItem.id,
        food_name: item.foodItem.name,
        food_price: item.foodItem.price,
        food_image_url: item.foodItem.imageUrl,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) {
        throw itemsError;
      }
      
      // Clear cart after successful order
      if (state.cartId) {
        await deleteCartItems(state.cartId);
      }
      
      // Clear local storage when order is placed
      clearCartFromLocalStorage();
        
      setState(prev => ({ ...prev, cart: [] }));
      
      toast.success('Order placed successfully!');
      return newOrder.id;
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
      return null;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user, state.cart, state.cartId]);

  return {
    state,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder
  };
}
