
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, placeOrder, loading, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Fetch cart data when component mounts
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        await fetchCart();
        setCartLoaded(true);
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
    
    // Navigate to location page first
    navigate('/location', { 
      state: { 
        totalAmount: getTotalPrice()
      } 
    });
  };

  // Show clear loading state with skeletons
  if (isLoading && !cartLoaded) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col mb-16 md:mb-0">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {[1, 2].map((i) => (
              <Card key={i} className="mb-4">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <Skeleton className="w-24 h-24 rounded" />
                    <div className="flex-grow w-full">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-6 w-6 mx-3" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full mt-6" />
                <Skeleton className="h-10 w-full mt-3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Only show empty cart if cart is empty AND we're not loading
  if (!isLoading && cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center mb-16 md:mb-0">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items to your cart!</p>
        <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map((item) => (
            <Card key={item.foodItem.id} className="mb-4">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <img 
                    src={item.foodItem.imageUrl} 
                    alt={item.foodItem.name} 
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{item.foodItem.name}</h3>
                      <span className="font-bold text-rv-burgundy">
                        ₹{(item.foodItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{item.foodItem.description}</p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.foodItem.id, item.quantity - 1)}
                          disabled={loading}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-3 w-6 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.foodItem.id, item.quantity + 1)}
                          disabled={loading}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-white hover:bg-red-500"
                        onClick={() => removeFromCart(item.foodItem.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.foodItem.id} className="flex justify-between">
                    <span className="text-gray-600">
                      {item.quantity} x {item.foodItem.name}
                    </span>
                    <span>₹{(item.foodItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6 bg-rv-navy hover:bg-rv-burgundy"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={loading || cart.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : 'Place Order'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full mt-3 border-rv-navy text-rv-navy hover:bg-rv-navy hover:text-white"
                onClick={() => navigate('/menu')}
                disabled={loading}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
