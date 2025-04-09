
import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const EmptySelectionCard: React.FC = () => {
  return (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="text-center py-12">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Select an order to view details</p>
      </CardContent>
    </Card>
  );
};

export default EmptySelectionCard;
