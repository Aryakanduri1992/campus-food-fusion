
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import CartItem from '@/components/cart/CartItem';
import OrderSummary from '@/components/cart/OrderSummary';
import EmptyCart from '@/components/cart/EmptyCart';
import CartLoadingState from '@/components/cart/CartLoadingState';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, placeOrder, loading, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Fetch cart data when component mounts
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        await fetchCart();
        setCartLoaded(true);
        // Clear any previous errors
        setOrderError(null);
      } catch (error) {
        console.error('Error fetching cart:', error);
        if (retryCount < 3) {
          // Retry fetching cart up to 3 times
          setRetryCount(prev => prev + 1);
        } else {
          toast.error('Failed to load your cart items');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCart();
  }, [fetchCart, retryCount]);

  // Add a second useEffect to track when cart is loaded
  useEffect(() => {
    if (cart.length > 0) {
      setCartLoaded(true);
    }
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order");
      navigate('/auth');
      return;
    }
    
    setPlacingOrder(true);
    setOrderError(null);
    
    try {
      // Place the order first to get the order ID
      const orderId = await placeOrder();
      
      if (orderId) {
        // Navigate to location page with order ID
        navigate('/location', { 
          state: { 
            totalAmount: getTotalPrice(),
            orderId
          } 
        });
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setOrderError(error instanceof Error ? error.message : "An error occurred while placing your order. Please try again.");
      toast.error("An error occurred while placing your order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Show loading state with skeletons
  if (isLoading && !cartLoaded) {
    return <CartLoadingState />;
  }

  // Show empty cart state
  if (!isLoading && cart.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map((item) => (
            <CartItem
              key={item.foodItem.id}
              item={item}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              loading={loading}
            />
          ))}
        </div>
        
        <div>
          <OrderSummary
            cart={cart}
            totalPrice={getTotalPrice()}
            handlePlaceOrder={handlePlaceOrder}
            loading={loading}
            placingOrder={placingOrder}
            error={orderError}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
