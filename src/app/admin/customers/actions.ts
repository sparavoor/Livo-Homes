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

export async function fetchCustomersWithStatsAction() {
  const client = supabaseAdmin;
  if (!client) throw new Error('Registry access denied: Admin key missing.');

  // 1. Fetch all profiles
  const { data: profiles, error: profileError } = await client
    .from('profiles')
    .select('*');

  if (profileError) throw new Error(profileError.message);

  // 2. Fetch all orders (to include guest checkouts)
  const { data: orders, error: orderError } = await client
    .from('orders')
    .select('id, total_amount, customer_email, customer_name, customer_phone, user_id, created_at');

  if (orderError) throw new Error(orderError.message);

  // 3. Group orders by email
  const orderStatsByEmail: Record<string, { count: number; total: number; latest: string; name: string; phone: string }> = {};
  
  orders?.forEach(order => {
    const email = (order.customer_email || 'guest').toLowerCase();
    if (!orderStatsByEmail[email]) {
      orderStatsByEmail[email] = { 
        count: 0, 
        total: 0, 
        latest: order.created_at, 
        name: order.customer_name, 
        phone: order.customer_phone 
      };
    }
    orderStatsByEmail[email].count += 1;
    orderStatsByEmail[email].total += (order.total_amount || 0);
    if (new Date(order.created_at) > new Date(orderStatsByEmail[email].latest)) {
      orderStatsByEmail[email].latest = order.created_at;
    }
  });

  // 4. Combine Profiles with Order Stats
  const combinedCustomers: any[] = [];
  const processedEmails = new Set<string>();

  // Add registered profiles first
  profiles?.forEach(profile => {
    const email = (profile.email || '').toLowerCase();
    const stats = orderStatsByEmail[email] || { count: 0, total: 0, latest: profile.updated_at };
    
    combinedCustomers.push({
      ...profile,
      orderCount: stats.count,
      totalSpent: stats.total,
      lastActive: stats.latest,
      isRegistered: true
    });
    
    if (email) processedEmails.add(email);
  });

  // Add guests from orders who don't have profiles
  Object.keys(orderStatsByEmail).forEach(email => {
    if (!processedEmails.has(email) && email !== 'guest') {
      const stats = orderStatsByEmail[email];
      combinedCustomers.push({
        id: `guest-${email}`,
        email: email,
        full_name: stats.name || 'Guest Client',
        phone: stats.phone,
        orderCount: stats.count,
        totalSpent: stats.total,
        lastActive: stats.latest,
        isRegistered: false,
        privilege_tier: 'standard',
        updated_at: stats.latest
      });
    }
  });

  // Sort by latest activity
  return combinedCustomers.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
}

export async function fetchCustomerOrdersAction(contact: { userId?: string; email?: string }) {
  const { getOrdersByContact } = await import('@/lib/orders');
  return await getOrdersByContact(contact);
}
