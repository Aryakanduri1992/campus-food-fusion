
import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const EmptyOrdersCard: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <MapPin className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">No Active Deliveries</h3>
        <p className="text-gray-500 mt-2">You don't have any deliveries assigned to you right now.</p>
      </CardContent>
    </Card>
  );
};

export default EmptyOrdersCard;
