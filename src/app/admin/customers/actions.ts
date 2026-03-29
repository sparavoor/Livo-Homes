'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

export async function updateUserPrivilegeAction(userId: string, tier: string) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ privilege_tier: tier })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/customers');
  revalidatePath('/profile');
  return { success: true };
}
