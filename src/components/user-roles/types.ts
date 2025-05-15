
import { DeliveryPartner } from '../owner/types';

export interface UserRoleManagerProps {
  onRoleAssigned: () => void;
}

export interface PartnerFormProps {
  onRoleAssigned: (partner: DeliveryPartner) => void;
}

export interface PartnersTableProps {
  partners: DeliveryPartner[];
  loading: boolean;
}

// Re-export DeliveryPartner so it's available to other modules
export { DeliveryPartner };
