
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/context/cart/types';

interface CartItemProps {
  item: CartItemType;
  updateQuantity: (foodItemId: number, newQuantity: number) => void;
  removeFromCart: (foodItemId: number) => void;
  loading: boolean;
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  updateQuantity, 
  removeFromCart,
  loading 
}) => {
  return (
    <Card className="mb-4">
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
  );
};

export default CartItem;
