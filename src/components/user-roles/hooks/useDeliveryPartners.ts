
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DeliveryPartner } from '../types';

export function useDeliveryPartners() {
  const { toast } = useToast();
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);

  const fetchDeliveryPartners = async () => {
    try {
      setLoadingPartners(true);
      
      // Get all delivery partner roles from delivery_partners_emails table
      const { data, error } = await supabase
        .from('delivery_partners_emails')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching delivery partners:", error);
        toast({
          title: "Error",
          description: "Could not load delivery partners",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Fetched delivery partners:", data);
      setDeliveryPartners(data || []);
    } catch (error) {
      console.error("Unexpected error fetching delivery partners:", error);
    } finally {
      setLoadingPartners(false);
    }
  };

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  return {
    loadingPartners,
    deliveryPartners,
    setDeliveryPartners,
    fetchDeliveryPartners
  };
}
