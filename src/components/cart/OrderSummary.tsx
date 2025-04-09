
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '@/context/cart/types';
import { cn } from '@/lib/utils';

interface OrderSummaryProps {
  cart: CartItem[];
  totalPrice: number;
  handlePlaceOrder: () => void;
  loading: boolean;
  placingOrder: boolean;
  error?: string | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  cart, 
  totalPrice, 
  handlePlaceOrder, 
  loading,
  placingOrder,
  error
}) => {
  const navigate = useNavigate();

  return (
    <Card className={cn(
      error ? "border-red-200 bg-red-50" : ""
    )}>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">Order Summary</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 rounded-md border border-red-200 text-red-700 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
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
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 mt-2">
            <span>Delivery Fee</span>
            <span>₹30.00</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t">
            <span>Total</span>
            <span>₹{(totalPrice + 30).toFixed(2)}</span>
          </div>
        </div>
        
        <Button 
          className="w-full mt-6 bg-rv-navy hover:bg-rv-burgundy transition-colors"
          size="lg"
          onClick={handlePlaceOrder}
          disabled={loading || placingOrder || cart.length === 0}
        >
          {placingOrder ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Order...
            </>
          ) : loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : 'Place Order'}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full mt-3 border-rv-navy text-rv-navy hover:bg-rv-navy hover:text-white"
          onClick={() => navigate('/menu')}
          disabled={loading || placingOrder}
        >
          Continue Shopping
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
