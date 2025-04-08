
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, data } = await req.json();
    
    if (action === 'assignDeliveryPartner') {
      const { orderId, partnerId, estimatedTime } = data;
      
      // Get partner details to include in order
      const { data: partnerData, error: partnerError } = await supabase
        .from('delivery_partners_emails')
        .select('*')
        .eq('id', partnerId)
        .single();
        
      if (partnerError) {
        return new Response(
          JSON.stringify({ error: 'Failed to retrieve partner details' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Update order with delivery partner information
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'In Process',
          delivery_partner: partnerData.partner_name,
          delivery_phone: partnerData.phone_number,
          delivery_email: partnerData.email,
          estimated_time: estimatedTime
        })
        .eq('id', orderId)
        .select()
        .single();
        
      if (orderError) {
        return new Response(
          JSON.stringify({ error: 'Failed to assign delivery partner' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Update partner status to busy
      await supabase
        .from('delivery_partners_emails')
        .update({ status: 'Busy' })
        .eq('id', partnerId);
      
      return new Response(
        JSON.stringify({ message: 'Delivery partner assigned', order: orderData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'updateOrderStatus') {
      const { orderId, status } = data;
      
      // Update order status
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
        
      if (orderError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update order status' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // If status is 'Delivered', update partner status to available
      if (status === 'Delivered') {
        // Get order details to identify the partner
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('delivery_email')
          .eq('id', orderId)
          .single();
          
        if (currentOrder?.delivery_email) {
          await supabase
            .from('delivery_partners_emails')
            .update({ status: 'Available' })
            .eq('email', currentOrder.delivery_email);
        }
      }
      
      return new Response(
        JSON.stringify({ message: 'Order status updated', order: orderData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
