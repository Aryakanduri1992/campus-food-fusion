import React, { createContext, useState, useContext, ReactNode } from 'react';
import { CartItem, FoodItem } from '../types';
import { toast } from "sonner";

interface CartContextType {
  cart: CartItem[];
  addToCart: (foodItem: FoodItem) => void;
  removeFromCart: (foodItemId: number) => void;
  updateQuantity: (foodItemId: number, newQuantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (foodItem: FoodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.foodItem.id === foodItem.id);
      
      if (existingItem) {
        // If item already exists, increase quantity
        const updatedCart = prevCart.map(item => 
          item.foodItem.id === foodItem.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
        toast.success(`Added ${foodItem.name} to cart`);
        return updatedCart;
      } else {
        // If item doesn't exist, add it with quantity 1
        toast.success(`Added ${foodItem.name} to cart`);
        return [...prevCart, { foodItem, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (foodItemId: number) => {
    setCart(prevCart => {
      const itemToRemove = prevCart.find(item => item.foodItem.id === foodItemId);
      if (itemToRemove) {
        toast.info(`Removed ${itemToRemove.foodItem.name} from cart`);
      }
      return prevCart.filter(item => item.foodItem.id !== foodItemId);
    });
  };

  const updateQuantity = (foodItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(foodItemId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.foodItem.id === foodItemId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.info('Cart cleared');
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.foodItem.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      getTotalItems,
      getTotalPrice
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
