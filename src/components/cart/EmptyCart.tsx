
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyCart: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center mb-16 md:mb-0">
      <ShoppingBag size={64} className="text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add some delicious items to your cart!</p>
      <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
    </div>
  );
};

export default EmptyCart;
