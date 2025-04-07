
import React from 'react';
import { mockOrders } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const Orders: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-100 text-blue-800';
      case 'In Process':
        return 'bg-yellow-100 text-yellow-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      {mockOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {mockOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(order.timestamp)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={item.foodItem.imageUrl} 
                          alt={item.foodItem.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.foodItem.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">${(item.foodItem.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t mt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
