'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/utils/supabase/server';

export async function cancelOrderAction(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  // Use supabaseAdmin to bypass RLS, but verify ownership manually
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }

  // 1. Verify order belongs to user and is pending
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, status')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    throw new Error('Order not found');
  }

  if (order.user_id !== user.id) {
    throw new Error('Unauthorized: Order does not belong to you');
  }

  if (order.status !== 'pending') {
    throw new Error(`Order cannot be cancelled in its current state (${order.status})`);
  }

  // 2. Perform cancellation
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);

  if (updateError) {
    throw new Error(updateError.message || 'Failed to update order status');
  }

  revalidatePath('/profile');
  revalidatePath('/admin/orders'); // Sync admin view as well

  return { success: true };
}

export async function updateProfileAction(data: { full_name: string, phone: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: data.full_name,
      phone: data.phone,
      email: user.email,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw new Error(error.message || 'Failed to update profile');
  }

  revalidatePath('/profile');
  return { success: true };
}
