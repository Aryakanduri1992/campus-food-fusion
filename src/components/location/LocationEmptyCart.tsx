
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LocationEmptyCart: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-12 mb-16 md:mb-0">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-rv-navy">Empty Cart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>Your cart is empty.</p>
          <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationEmptyCart;
