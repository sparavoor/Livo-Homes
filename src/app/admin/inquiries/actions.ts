'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function fetchInquiriesAction() {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { data, error } = await supabaseAdmin
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateInquiryStatusAction(id: string, status: string) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { data, error } = await supabaseAdmin
    .from('contact_inquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInquiryAction(id: string) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { error } = await supabaseAdmin
    .from('contact_inquiries')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
