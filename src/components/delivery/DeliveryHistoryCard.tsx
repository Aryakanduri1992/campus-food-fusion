
import React from 'react';
import { CheckCircle, MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { OrderWithDeliveryInfo } from './types';

interface DeliveryHistoryCardProps {
  orders: OrderWithDeliveryInfo[];
}

const DeliveryHistoryCard: React.FC<DeliveryHistoryCardProps> = ({ orders }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery History</CardTitle>
        <CardDescription>Record of your completed deliveries</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()} - ₹{order.total_price.toFixed(2)}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    Delivered
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{order.delivery_address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No delivery history found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryHistoryCard;
