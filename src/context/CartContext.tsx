
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { CartContextType } from './cart/types';
import { useAuth } from '@/context/AuthContext';
import { useCartOperations } from './cart/useCartOperations';
import { calculateTotalItems, calculateTotalPrice } from './cart/utils';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { 
    state, 
    fetchCart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    placeOrder 
  } = useCartOperations(user);
  
  useEffect(() => {
    fetchCart();
  }, [user]);
  
  // Define utility functions that use cart state
  const getTotalItems = () => calculateTotalItems(state.cart);
  const getTotalPrice = () => calculateTotalPrice(state.cart);

  return (
    <CartContext.Provider value={{ 
      cart: state.cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      getTotalItems,
      getTotalPrice,
      placeOrder,
      loading: state.loading,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
