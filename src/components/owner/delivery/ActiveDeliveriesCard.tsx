
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Truck, CheckCircle } from 'lucide-react';
import { OrderWithItems } from '../types';

interface ActiveDeliveriesCardProps {
  orders: OrderWithItems[];
  handleCompleteOrder: (orderId: number) => Promise<void>;
}

const ActiveDeliveriesCard: React.FC<ActiveDeliveriesCardProps> = ({
  orders,
  handleCompleteOrder
}) => {
  const activeOrders = orders.filter(order => order.status === 'In Process');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Deliveries</CardTitle>
        <CardDescription>Track and manage ongoing deliveries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeOrders.length > 0 ? (
            activeOrders.map(order => (
              <div key={order.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">₹{order.total_price.toFixed(2)} - {order.items.length} items</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                    onClick={() => handleCompleteOrder(order.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Completed
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{order.delivery_partner}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    <span>{order.estimated_time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    <span>On the way</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No active deliveries</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveDeliveriesCard;
