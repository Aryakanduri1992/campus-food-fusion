
import React from 'react';
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
import { OrderWithItems, DeliveryPartner } from '../types';

interface AssignDeliveryCardProps {
  orders: OrderWithItems[];
  partners: DeliveryPartner[];
  selectedOrder: number | null;
  setSelectedOrder: (orderId: number | null) => void;
  selectedPartner: string | null;
  setSelectedPartner: (partnerId: string | null) => void;
  estimatedTime: string;
  setEstimatedTime: (time: string) => void;
  handleAssignDelivery: () => Promise<void>;
}

const AssignDeliveryCard: React.FC<AssignDeliveryCardProps> = ({
  orders,
  partners,
  selectedOrder,
  setSelectedOrder,
  selectedPartner,
  setSelectedPartner,
  estimatedTime,
  setEstimatedTime,
  handleAssignDelivery
}) => {
  return (
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
  );
};

export default AssignDeliveryCard;
