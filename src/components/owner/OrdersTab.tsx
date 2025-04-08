
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface OrderWithItems {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  items: any[]; // Order items
  delivery_partner?: string;
  delivery_phone?: string;
  delivery_email?: string;
  estimated_time?: string;
}

interface OrdersTabProps {
  orders: OrderWithItems[];
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
        <CardDescription>Manage all customer orders from here</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>List of all orders</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Delivery</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>₹{order.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${order.status === 'Placed' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'In Process' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell>
                    {order.delivery_partner ? (
                      <span className="text-xs">
                        {order.delivery_partner} ({order.delivery_phone})
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Unassigned</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
