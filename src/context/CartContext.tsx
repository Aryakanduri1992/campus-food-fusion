import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CartItem, FoodItem, DbCartItem, DbOrderItem, Database, FoodCategory } from '../types';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (foodItem: FoodItem) => void;
  removeFromCart: (foodItemId: number) => void;
  updateQuantity: (foodItemId: number, newQuantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  placeOrder: () => Promise<string | null>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [cartId, setCartId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCart([]);
        setCartId(null);
        return;
      }
      
      setLoading(true);
      try {
        const { data: existingCarts, error: cartsError } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (cartsError) throw cartsError;
          
        let currentCartId;
        
        if (existingCarts && existingCarts.length > 0) {
          currentCartId = existingCarts[0].id;
          setCartId(currentCartId);
          
          const { data: cartItems, error: itemsError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', currentCartId);
            
          if (itemsError) throw itemsError;
            
          if (cartItems && cartItems.length > 0) {
            const formattedItems: CartItem[] = cartItems.map((item: DbCartItem) => ({
              foodItem: {
                id: item.food_item_id,
                name: item.food_name,
                price: item.food_price,
                imageUrl: item.food_image_url,
                category: 'Veg' as FoodCategory,
                description: ''
              },
              quantity: item.quantity
            }));
            
            setCart(formattedItems);
          }
        } else if (user) {
          const { data: newCart, error: newCartError } = await supabase
            .from('carts')
            .insert({ user_id: user.id })
            .select()
            .single();
            
          if (newCartError) throw newCartError;
            
          if (newCart) {
            setCartId(newCart.id);
            currentCartId = newCart.id;
          }
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Failed to load your cart');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [user]);
  
  const syncCartToDatabase = async (updatedCart: CartItem[]) => {
    if (!user || !cartId) return;
    
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);
        
      if (deleteError) throw deleteError;
        
      if (updatedCart.length > 0) {
        const cartItemsToInsert = updatedCart.map(item => ({
          cart_id: cartId,
          food_item_id: item.foodItem.id,
          food_name: item.foodItem.name,
          food_price: item.foodItem.price,
          food_image_url: item.foodItem.imageUrl,
          quantity: item.quantity
        }));
        
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert(cartItemsToInsert);
          
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (foodItem: FoodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.foodItem.id === foodItem.id);
      
      let updatedCart;
      if (existingItem) {
        updatedCart = prevCart.map(item => 
          item.foodItem.id === foodItem.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
        toast.success(`Added ${foodItem.name} to cart`);
      } else {
        updatedCart = [...prevCart, { foodItem, quantity: 1 }];
        toast.success(`Added ${foodItem.name} to cart`);
      }
      
      syncCartToDatabase(updatedCart);
      
      return updatedCart;
    });
  };

  const removeFromCart = (foodItemId: number) => {
    setCart(prevCart => {
      const itemToRemove = prevCart.find(item => item.foodItem.id === foodItemId);
      if (itemToRemove) {
        toast.info(`Removed ${itemToRemove.foodItem.name} from cart`);
      }
      
      const updatedCart = prevCart.filter(item => item.foodItem.id !== foodItemId);
      
      syncCartToDatabase(updatedCart);
      
      return updatedCart;
    });
  };

  const updateQuantity = (foodItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(foodItemId);
      return;
    }

    setCart(prevCart => {
      const updatedCart = prevCart.map(item => 
        item.foodItem.id === foodItemId 
          ? { ...item, quantity: newQuantity } 
          : item
      );
      
      syncCartToDatabase(updatedCart);
      
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    
    if (user && cartId) {
      (async () => {
        try {
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cartId);
            
          if (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
          } else {
            toast.info('Cart cleared');
          }
        } catch (error) {
          console.error('Error clearing cart:', error);
          toast.error('Failed to clear cart');
        }
      })();
    } else {
      toast.info('Cart cleared');
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.foodItem.price * item.quantity), 0);
  };
  
  const placeOrder = async (): Promise<string | null> => {
    if (!user) {
      toast.error('Please log in to place an order');
      return null;
    }
    
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return null;
    }
    
    setLoading(true);
    try {
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_price: getTotalPrice()
        })
        .select()
        .single();
        
      if (orderError || !newOrder) {
        throw orderError || new Error('Failed to create order');
      }
      
      const orderItems = cart.map(item => ({
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
      
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);
        
      if (clearError) {
        console.error('Error clearing cart:', clearError);
      }
        
      setCart([]);
      
      toast.success('Order placed successfully!');
      return newOrder.id;
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      getTotalItems,
      getTotalPrice,
      placeOrder,
      loading
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
