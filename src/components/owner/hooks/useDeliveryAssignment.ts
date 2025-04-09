
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OrderWithItems, DeliveryPartner } from '../types';

export function useDeliveryAssignment(
  orders: OrderWithItems[],
  setOrders: React.Dispatch<React.SetStateAction<OrderWithItems[]>>,
  partners: DeliveryPartner[],
  setPartners: React.Dispatch<React.SetStateAction<DeliveryPartner[]>>
) {
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
      
      try {
        const response = await fetch(
          'https://onimdyizdngyeyzsvuym.supabase.co/functions/v1/order-management',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
            },
            body: JSON.stringify({
              action: 'assignDeliveryPartner',
              data: {
                orderId: selectedOrder,
                partnerId: selectedPartner,
                estimatedTime: estimatedTime
              }
            })
          }
        );
        
        if (!response.ok) {
          throw new Error('Edge function failed');
        }
        
        const result = await response.json();
        console.log('Edge function response:', result);
        
      } catch (edgeFunctionError) {
        console.error('Edge function error, falling back to direct update:', edgeFunctionError);
        
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
          throw updateError;
        }
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
      try {
        const response = await fetch(
          'https://onimdyizdngyeyzsvuym.supabase.co/functions/v1/order-management',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
            },
            body: JSON.stringify({
              action: 'updateOrderStatus',
              data: {
                orderId: orderId,
                status: 'Delivered'
              }
            })
          }
        );
        
        if (!response.ok) {
          throw new Error('Edge function failed');
        }
        
        const result = await response.json();
        console.log('Edge function response:', result);
        
      } catch (edgeFunctionError) {
        console.error('Edge function error, falling back to direct update:', edgeFunctionError);
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'Delivered'
          })
          .eq('id', orderId);
          
        if (updateError) {
          console.error('Error updating order:', updateError);
          throw updateError;
        }
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

  return {
    selectedOrder,
    setSelectedOrder,
    selectedPartner,
    setSelectedPartner,
    estimatedTime,
    setEstimatedTime,
    handleAssignDelivery,
    handleCompleteOrder
  };
}
