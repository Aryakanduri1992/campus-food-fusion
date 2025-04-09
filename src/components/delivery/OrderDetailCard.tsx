
import React from 'react';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DeliveryMap from '@/components/DeliveryMap';
import { OrderWithDeliveryInfo } from './types';

interface OrderDetailCardProps {
  order: OrderWithDeliveryInfo;
  onMarkDelivered: (orderId: string) => void;
}

const OrderDetailCard: React.FC<OrderDetailCardProps> = ({ order, onMarkDelivered }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
              <CardDescription>Estimated delivery: {order.estimated_time}</CardDescription>
            </div>
            <Button 
              onClick={() => onMarkDelivered(order.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Delivered
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-rv-navy" />
                Pickup Location
              </h3>
              <p className="text-gray-600">{order.restaurant_address}</p>
              <Button variant="outline" className="mt-3 w-full" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Restaurant
              </Button>
            </div>
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-green-600" />
                Delivery Location
              </h3>
              <p className="text-gray-600">{order.delivery_address}</p>
              <Button variant="outline" className="mt-3 w-full" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Customer
              </Button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <h3 className="font-semibold mb-3">Order Items</h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{item.name}</span>
                <span className="text-gray-600">x{item.quantity}</span>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{order.total_price.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Delivery Route</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <DeliveryMap 
            pickupAddress={order.restaurant_address || ''} 
            deliveryAddress={order.delivery_address || ''} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailCard;
