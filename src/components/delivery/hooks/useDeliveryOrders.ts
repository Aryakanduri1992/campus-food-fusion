
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OrderWithDeliveryInfo } from '../types';

export function useDeliveryOrders() {
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
  
  return {
    loading,
    assignedOrders,
    deliveryHistory,
    selectedOrder,
    setSelectedOrder,
    markAsDelivered
  };
}
