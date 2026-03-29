'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

export async function createPromoCodeAction(data: {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number;
  expiry_date: string | null;
  min_privilege: string;
}) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { error } = await supabaseAdmin
    .from('promo_codes')
    .insert([{
      code: data.code.toUpperCase(),
      description: data.description,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      max_uses: data.max_uses,
      expiry_date: data.expiry_date,
      min_privilege: data.min_privilege,
      status: 'active'
    }]);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/promo');
  return { success: true };
}

export async function deletePromoCodeAction(id: string) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { error } = await supabaseAdmin
    .from('promo_codes')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/promo');
  return { success: true };
}

export async function deactivatePromoCodeAction(id: string) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { error } = await supabaseAdmin
    .from('promo_codes')
    .update({ status: 'inactive' })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/promo');
  return { success: true };
}

export async function fetchPromoCodesAction() {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { data, error } = await supabaseAdmin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data;
}

export async function applyPromoCodeAction(code: string, userPrivilege: string = 'standard') {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { data, error } = await supabaseAdmin
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 'active')
    .single();

  if (error || !data) throw new Error('Invalid or expired promo code');

  // Check usage limit
  if (data.max_uses > 0 && data.current_uses >= data.max_uses) {
    throw new Error('Promo code usage limit reached');
  }

  // Check expiry
  if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
    throw new Error('Promo code has expired');
  }

  // Check privilege
  const privilegeHierarchy: Record<string, number> = {
    'standard': 0,
    'silver': 1,
    'gold': 2,
    'platinum': 3
  };

  const userLevel = privilegeHierarchy[userPrivilege.toLowerCase()] || 0;
  const requiredLevel = privilegeHierarchy[data.min_privilege?.toLowerCase() || 'standard'] || 0;

  if (userLevel < requiredLevel) {
    throw new Error(`This voucher is exclusive to ${data.min_privilege} tier members and above.`);
  }

  return { 
    id: data.id,
    code: data.code,
    discount_type: data.discount_type,
    discount_value: data.discount_value
  };
}
