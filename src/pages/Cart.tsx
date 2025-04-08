
import React, { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice, placeOrder, loading, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch cart data when component mounts
  useEffect(() => {
    fetchCart();
  }, []);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order");
      navigate('/auth');
      return;
    }
    
    const orderId = await placeOrder();
    if (orderId) {
      // Navigate to location page instead of payment
      navigate('/location', { 
        state: { 
          orderId: orderId,
          totalAmount: getTotalPrice()
        } 
      });
    }
  };

  if (cart.length === 0) {
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
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
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
