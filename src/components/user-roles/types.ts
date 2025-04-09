
export interface DeliveryPartner {
  id: string;
  email: string;
  created_at: string;
  partner_name?: string;
  phone_number?: string;
}

export interface UserRoleManagerProps {
  onRoleAssigned?: () => void;
}
