import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, Truck, CheckCircle } from 'lucide-react';
import { OrderWithItems, DeliveryPartner } from './types';

interface DeliveryManagementTabProps {
  orders: OrderWithItems[];
  setOrders: React.Dispatch<React.SetStateAction<OrderWithItems[]>>;
  partners: DeliveryPartner[];
  setPartners: React.Dispatch<React.SetStateAction<DeliveryPartner[]>>;
}

const DeliveryManagementTab: React.FC<DeliveryManagementTabProps> = ({ 
  orders, 
  setOrders, 
  partners, 
  setPartners 
}) => {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('30-45 minutes');

  const handleAssignDelivery = async () => {
    if (!selectedOrder || !selectedPartner) {
      toast({
        title: "Missing Information",
        description: "Please select both an order and a delivery partner",
        variant: "destructive"
      });
      return;
    }

    try {
      const partner = partners.find(p => p.id === selectedPartner);
      
      if (!partner) {
        toast({
          title: "Error",
          description: "Selected partner not found",
          variant: "destructive"
        });
        return;
      }
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'In Process',
          delivery_partner: partner.partner_name,
          delivery_phone: partner.phone_number,
          delivery_email: partner.email,
          estimated_time: estimatedTime
        })
        .eq('id', selectedOrder);
        
      if (updateError) {
        console.error('Error updating order:', updateError);
        toast({
          title: "Error",
          description: "Failed to update order status in database",
          variant: "destructive"
        });
        return;
      }

      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === selectedOrder) {
            return {
              ...order,
              status: 'In Process',
              delivery_partner: partner.partner_name,
              delivery_phone: partner.phone_number,
              delivery_email: partner.email,
              estimated_time: estimatedTime
            };
          }
          return order;
        })
      );

      setPartners(prevPartners => 
        prevPartners.map(p => 
          p.id === selectedPartner 
            ? { ...p, status: 'Busy' as const } 
            : p
        )
      );

      toast({
        title: "Delivery Assigned",
        description: "Delivery partner has been assigned to the order",
      });

      setSelectedOrder(null);
      setSelectedPartner(null);
    } catch (error) {
      console.error('Error assigning delivery:', error);
      toast({
        title: "Error",
        description: "Failed to assign delivery partner",
        variant: "destructive"
      });
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'Delivered'
        })
        .eq('id', orderId);
        
      if (updateError) {
        console.error('Error updating order:', updateError);
        toast({
          title: "Error",
          description: "Failed to update order status in database",
          variant: "destructive"
        });
        return;
      }
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'Delivered' } 
            : order
        )
      );

      const order = orders.find(o => o.id === orderId);
      if (order?.delivery_partner) {
        setPartners(prevPartners => 
          prevPartners.map(partner => 
            partner.partner_name === order.delivery_partner 
              ? { ...partner, status: 'Available' as const } 
              : partner
          )
        );
      }

      toast({
        title: "Order Completed",
        description: "The order has been marked as delivered",
      });
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        title: "Error",
        description: "Failed to mark order as delivered",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Assign Delivery</CardTitle>
          <CardDescription>Assign delivery partners to orders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order-select">Select Order</Label>
            <Select 
              onValueChange={(value) => setSelectedOrder(Number(value))} 
              value={selectedOrder?.toString() || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>
              <SelectContent>
                {orders
                  .filter(order => order.status === 'Placed')
                  .map(order => (
                    <SelectItem key={order.id} value={order.id.toString()}>
                      Order #{order.id} - ₹{order.total_price.toFixed(2)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partner-select">Select Delivery Partner</Label>
            <Select onValueChange={setSelectedPartner} value={selectedPartner || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select a delivery partner" />
              </SelectTrigger>
              <SelectContent>
                {partners
                  .filter(partner => partner.status === 'Available')
                  .map(partner => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.partner_name} ({partner.phone_number}) - {partner.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimated-time">Estimated Delivery Time</Label>
            <Select onValueChange={setEstimatedTime} defaultValue="30-45 minutes">
              <SelectTrigger>
                <SelectValue placeholder="Select estimated time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                <SelectItem value="30-45 minutes">30-45 minutes</SelectItem>
                <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                <SelectItem value="60-90 minutes">60-90 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="w-full bg-rv-burgundy hover:bg-rv-burgundy/90 mt-4"
            onClick={handleAssignDelivery}
          >
            Assign Delivery
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Deliveries</CardTitle>
          <CardDescription>Track and manage ongoing deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders
              .filter(order => order.status === 'In Process')
              .map(order => (
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
              ))}
              
            {orders.filter(order => order.status === 'In Process').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Truck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No active deliveries</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryManagementTab;
