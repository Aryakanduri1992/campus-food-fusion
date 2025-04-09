
import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OrderWithDeliveryInfo } from './types';

interface AssignedOrdersListProps {
  orders: OrderWithDeliveryInfo[];
  selectedOrderId: string | null;
  onSelectOrder: (order: OrderWithDeliveryInfo) => void;
}

const AssignedOrdersList: React.FC<AssignedOrdersListProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Orders</CardTitle>
        <CardDescription>Orders assigned to you for delivery</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map(order => (
            <div 
              key={order.id}
              className={`border p-4 rounded-lg cursor-pointer transition-colors 
                ${selectedOrderId === order.id ? 'border-rv-navy bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => onSelectOrder(order)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                  <p className="text-sm text-gray-500">₹{order.total_price.toFixed(2)}</p>
                </div>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-green-600" />
                  <span className="truncate">{order.delivery_address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignedOrdersList;
