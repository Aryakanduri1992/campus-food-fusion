import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Clock, Truck, CheckCircle } from 'lucide-react';
import UserRoleManager from '@/components/UserRoleManager';

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

interface DeliveryPartner {
  id: string;
  partner_name?: string;
  phone_number?: string;
  email: string;
  status: 'Available' | 'Busy';
}

const Owner = () => {
  const { user, userRole, checkUserRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [newPartner, setNewPartner] = useState({ name: '', phone: '', email: '' });
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('30-45 minutes');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (user) {
          const role = await checkUserRole();
          console.log("Current user role:", role);
          
          if (role !== 'owner') {
            toast({
              title: "Access Denied",
              description: "You don't have permission to access this page",
              variant: "destructive"
            });
            navigate('/');
            return;
          }
          
          fetchOrders();
          fetchDeliveryPartners();
        } else {
          toast({
            title: "Authentication Required",
            description: "Please log in to access this page",
            variant: "destructive"
          });
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error checking access:", error);
        toast({
          title: "Error",
          description: "An error occurred while checking permissions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [user, navigate]);

  const fetchDeliveryPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_partners_emails')
        .select('*');
      
      if (error) {
        console.error("Error fetching delivery partners:", error);
        return;
      }
      
      const formattedPartners: DeliveryPartner[] = data.map((item: any) => ({
        id: item.id,
        partner_name: item.partner_name || `Partner ${item.id.substring(0, 4)}`,
        phone_number: item.phone_number || '(Phone not available)',
        email: item.email,
        status: 'Available' as const
      }));
      
      console.log("Fetched delivery partners:", formattedPartners);
      setPartners(formattedPartners);
    } catch (error) {
      console.error("Unexpected error fetching delivery partners:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (ordersError) throw ordersError;
      
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
            
          if (itemsError) throw itemsError;
          
          return {
            ...order,
            items: orderItems || []
          };
        })
      );
      
      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
          status: 'In Process'
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

  const handleCompleteOrder = async (orderId: string) => {
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

  const addNewPartner = async () => {
    if (!newPartner.email || !newPartner.email.includes('@')) {
      toast({
        title: "Missing Information",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: insertData, error: insertError } = await supabase
        .from('delivery_partners_emails')
        .insert({
          email: newPartner.email,
          partner_name: newPartner.name || null,
          phone_number: newPartner.phone || null
        })
        .select();
        
      if (insertError) {
        console.error('Error adding delivery partner:', insertError);
        toast({
          title: "Error",
          description: "Failed to add delivery partner to database",
          variant: "destructive"
        });
        return;
      }
      
      const newId = insertData?.[0]?.id || (partners.length + 1).toString();
      
      setPartners([...partners, { 
        id: newId, 
        partner_name: newPartner.name, 
        phone_number: newPartner.phone,
        email: newPartner.email,
        status: 'Available' 
      }]);

      setNewPartner({ name: '', phone: '', email: '' });
      
      toast({
        title: "Partner Added",
        description: "New delivery partner has been added",
      });
    } catch (error) {
      console.error('Error adding partner:', error);
      toast({
        title: "Error",
        description: "Failed to add delivery partner",
        variant: "destructive"
      });
    }
  };

  const handleRoleAssigned = () => {
    fetchDeliveryPartners();
    
    toast({
      title: "Role Updated",
      description: "Delivery partner role has been assigned. User can now log in as a delivery partner.",
    });
  };

  const assignOwnerRole = async (email: string) => {
    try {
      const { error } = await supabase
        .rpc('assign_role', { 
          user_email: email, 
          assigned_role: 'owner' 
        });

      if (error) {
        console.error("Error assigning owner role:", error);
        return;
      }

      console.log("Owner role assigned successfully to:", email);
      
      if (user) {
        const updatedRole = await checkUserRole();
        console.log("Updated role:", updatedRole);
      }
      
    } catch (error) {
      console.error("Unexpected error assigning owner role:", error);
    }
  };

  useEffect(() => {
    if (user?.email === 'aryaprasad771@gmail.com') {
      assignOwnerRole('aryaprasad771@gmail.com');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-rv-burgundy mb-4" />
        <h2 className="text-xl font-semibold text-rv-navy">Loading Owner Dashboard...</h2>
        <p className="text-gray-500 mt-2">Please wait while we prepare your dashboard</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-rv-navy">Owner Dashboard</h1>
      
      <Tabs defaultValue="orders" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="delivery">Manage Delivery</TabsTrigger>
          <TabsTrigger value="partners">Delivery Partners</TabsTrigger>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
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
        </TabsContent>
        
        <TabsContent value="delivery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Assign Delivery</CardTitle>
                <CardDescription>Assign delivery partners to orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order-select">Select Order</Label>
                  <Select onValueChange={setSelectedOrder} value={selectedOrder || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an order" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders
                        .filter(order => order.status === 'Placed')
                        .map(order => (
                          <SelectItem key={order.id} value={order.id}>
                            Order #{order.id.substring(0, 8)} - ₹{order.total_price.toFixed(2)}
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
                            <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
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
        </TabsContent>
        
        <TabsContent value="partners">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Add New Partner</CardTitle>
                <CardDescription>Register a new delivery partner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-name">Partner Name</Label>
                  <Input 
                    id="partner-name" 
                    placeholder="Full Name" 
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner-phone">Phone Number</Label>
                  <Input 
                    id="partner-phone" 
                    placeholder="10-digit phone number" 
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner-email">Email Address</Label>
                  <Input 
                    id="partner-email" 
                    type="email"
                    placeholder="Email address" 
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
                  />
                </div>
                
                <Button 
                  className="w-full bg-rv-burgundy hover:bg-rv-burgundy/90 mt-4"
                  onClick={addNewPartner}
                >
                  Add Partner
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Delivery Partners</CardTitle>
                <CardDescription>Manage your delivery team</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map(partner => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.partner_name}</TableCell>
                        <TableCell>{partner.phone_number}</TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold
                            ${partner.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {partner.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="roles">
          <UserRoleManager onRoleAssigned={handleRoleAssigned} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Owner;
