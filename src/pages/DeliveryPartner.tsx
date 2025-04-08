
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, CheckCircle, Navigation } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import DeliveryMap from '@/components/DeliveryMap';

interface OrderWithDeliveryInfo {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  items: any[];
  delivery_partner?: string;
  delivery_partner_email?: string;
  estimated_time?: string;
  restaurant_address?: string;
  delivery_address?: string;
}

const DeliveryPartner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignedOrders, setAssignedOrders] = useState<OrderWithDeliveryInfo[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<OrderWithDeliveryInfo[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDeliveryInfo | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchAssignedOrders();
  }, [user, navigate]);
  
  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      
      // For this demo, we'll use the mock orders with delivery info
      // In a real application, you would fetch this from Supabase
      const mockOrders = [
        {
          id: '123456789',
          total_price: 450,
          status: 'In Process',
          created_at: new Date().toISOString(),
          items: [{ name: 'Chicken Biryani', quantity: 2 }, { name: 'Cold Coffee', quantity: 1 }],
          delivery_partner: 'John Doe',
          delivery_partner_email: user?.email || '',
          estimated_time: '30-45 minutes',
          restaurant_address: '123 Food Street, RV College, Bengaluru',
          delivery_address: '456 Customer Lane, JP Nagar, Bengaluru'
        }
      ];
      
      const mockDeliveredOrders = [
        {
          id: '987654321',
          total_price: 350,
          status: 'Delivered',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          items: [{ name: 'Veg Thali', quantity: 1 }, { name: 'Mango Lassi', quantity: 2 }],
          delivery_partner: 'John Doe',
          delivery_partner_email: user?.email || '',
          estimated_time: '30-45 minutes',
          restaurant_address: '123 Food Street, RV College, Bengaluru',
          delivery_address: '789 Tech Park, Electronic City, Bengaluru'
        }
      ];
      
      // Filter orders assigned to the current user
      const currentUserAssignedOrders = mockOrders.filter(
        order => order.delivery_partner_email === user?.email && order.status === 'In Process'
      );
      
      const currentUserDeliveredOrders = mockDeliveredOrders.filter(
        order => order.delivery_partner_email === user?.email && order.status === 'Delivered'
      );
      
      setAssignedOrders(currentUserAssignedOrders);
      setDeliveryHistory(currentUserDeliveredOrders);
      
      if (currentUserAssignedOrders.length > 0) {
        setSelectedOrder(currentUserAssignedOrders[0]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load your assigned deliveries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const markAsDelivered = async (orderId: string) => {
    try {
      // In a real application, update the database
      // For now, we'll just update our local state
      setAssignedOrders(prevOrders => 
        prevOrders.filter(order => order.id !== orderId)
      );
      
      setDeliveryHistory(prevHistory => [
        ...prevHistory,
        {
          ...assignedOrders.find(o => o.id === orderId)!,
          status: 'Delivered'
        }
      ]);
      
      setSelectedOrder(null);
      
      toast({
        title: "Success",
        description: "Order marked as delivered successfully",
      });
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-rv-burgundy" />
        <span className="ml-2">Loading your deliveries...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-rv-navy">Delivery Partner Dashboard</h1>
      
      <Tabs defaultValue="active" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Deliveries ({assignedOrders.length})</TabsTrigger>
          <TabsTrigger value="history">Delivery History ({deliveryHistory.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {assignedOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Orders</CardTitle>
                    <CardDescription>Orders assigned to you for delivery</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignedOrders.map(order => (
                        <div 
                          key={order.id}
                          className={`border p-4 rounded-lg cursor-pointer transition-colors 
                            ${selectedOrder?.id === order.id ? 'border-rv-navy bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          onClick={() => setSelectedOrder(order)}
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
              </div>
              
              <div className="lg:col-span-2">
                {selectedOrder ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Order #{selectedOrder.id.substring(0, 8)}</CardTitle>
                            <CardDescription>Estimated delivery: {selectedOrder.estimated_time}</CardDescription>
                          </div>
                          <Button 
                            onClick={() => markAsDelivered(selectedOrder.id)}
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
                            <p className="text-gray-600">{selectedOrder.restaurant_address}</p>
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
                            <p className="text-gray-600">{selectedOrder.delivery_address}</p>
                            <Button variant="outline" className="mt-3 w-full" size="sm">
                              <Navigation className="h-4 w-4 mr-2" />
                              Navigate to Customer
                            </Button>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <h3 className="font-semibold mb-3">Order Items</h3>
                        <div className="space-y-2">
                          {selectedOrder.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>{item.name}</span>
                              <span className="text-gray-600">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>₹{selectedOrder.total_price.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Delivery Route</CardTitle>
                      </CardHeader>
                      <CardContent className="h-96">
                        <DeliveryMap 
                          pickupAddress={selectedOrder.restaurant_address || ''} 
                          deliveryAddress={selectedOrder.delivery_address || ''} 
                        />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Select an order to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">No Active Deliveries</h3>
                <p className="text-gray-500 mt-2">You don't have any deliveries assigned to you right now.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Delivery History</CardTitle>
              <CardDescription>Record of your completed deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              {deliveryHistory.length > 0 ? (
                <div className="space-y-4">
                  {deliveryHistory.map(order => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryPartner;
