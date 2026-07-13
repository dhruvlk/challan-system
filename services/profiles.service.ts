import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/membership';

const supabase = () => createClient();

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}
