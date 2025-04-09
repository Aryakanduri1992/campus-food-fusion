
import { Session, User } from '@supabase/supabase-js';
import { UserRole } from '@/types';

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  checkUserRole: () => Promise<UserRole | null>;
  refreshUserRole: () => Promise<void>;
  isDeliveryPartner: boolean;
  isOwner: boolean;
  isDeliveryPartnerEmail: boolean;
};
