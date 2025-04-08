
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus, FoodCategory } from '@/types';
import { ShoppingBag, Truck, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        if (ordersData) {
          // For each order, fetch its items
          const ordersWithItems = await Promise.all(
            ordersData.map(async (order) => {
              const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);

              if (itemsError) {
                console.error('Error fetching order items:', itemsError);
                return null;
              }

              return {
                id: order.id,
                status: order.status as OrderStatus,
                totalPrice: order.total_price,
                timestamp: order.created_at,
                items: (itemsData || []).map((item: any) => ({
                  quantity: item.quantity,
                  foodItem: {
                    id: item.food_item_id,
                    name: item.food_name,
                    price: item.food_price,
                    imageUrl: item.food_image_url,
                    category: 'Veg' as FoodCategory, // Default as it's not stored
                    description: '' // Default as it's not stored
                  }
                })),
                deliveryPartner: order.delivery_partner,
                deliveryPhone: order.delivery_phone,
                estimatedTime: order.estimated_time
              };
            })
          );

          // Filter out any null results
          const validOrders = ordersWithItems.filter(order => order !== null) as Order[];
          setOrders(validOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mb-16 md:mb-0 text-center">
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center mb-16 md:mb-0">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please log in to view your orders</h2>
        <Button onClick={() => navigate('/auth')} className="mt-4">
          Log In
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center mb-16 md:mb-0">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">You haven't placed any orders yet</h2>
        <p className="text-gray-500 mb-6">Check out our menu and place your first order!</p>
        <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
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
                    <p className="font-medium">₹{(item.foodItem.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="pt-4 border-t mt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {order.status === 'In Process' && order.deliveryPartner && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-2">Delivery Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-2 text-amber-700" />
                        <span className="text-sm">{order.deliveryPartner}</span>
                      </div>
                      {order.deliveryPhone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-amber-700" />
                          <span className="text-sm">{order.deliveryPhone}</span>
                        </div>
                      )}
                      {order.estimatedTime && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-700" />
                          <span className="text-sm">{order.estimatedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;
