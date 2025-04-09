
export interface OrderWithDeliveryInfo {
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
