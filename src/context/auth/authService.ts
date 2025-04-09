
import { supabase } from '@/integrations/supabase/client';

export const signOut = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
