
import React from 'react';
import { FoodItem } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Plus } from 'lucide-react';

interface FoodCardProps {
  foodItem: FoodItem;
}

const FoodCard: React.FC<FoodCardProps> = ({ foodItem }) => {
  const { addToCart, loading } = useCart();

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Veg':
        return 'veg-badge';
      case 'Non-Veg':
        return 'non-veg-badge';
      case 'Beverage':
        return 'beverage-badge';
      default:
        return '';
    }
  };

  return (
    <Card className="food-card">
      <div className="relative">
        <img 
          src={foodItem.imageUrl} 
          alt={foodItem.name} 
          className="food-card-image"
        />
        <div className="absolute top-2 right-2">
          <span className={`category-badge ${getCategoryBadgeClass(foodItem.category)}`}>
            {foodItem.category}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{foodItem.name}</h3>
          <span className="font-bold text-rv-burgundy">₹{foodItem.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-600 text-sm mt-2">{foodItem.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => addToCart(foodItem)}
          className="w-full bg-rv-navy hover:bg-rv-burgundy"
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FoodCard;
