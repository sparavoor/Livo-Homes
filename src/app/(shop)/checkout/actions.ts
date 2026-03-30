'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase'; // We'll try to use this initially to get the user
import { CartItem } from '@/context/CartContext';
import { revalidatePath } from 'next/cache';

export interface OrderData {
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  district?: string;
  pincode: string;
  total_amount: number;
  promo_code?: string;
  discount_amount?: number;
  payment_method: string;
  items: CartItem[];
}

export async function createOrderAction(orderData: OrderData) {
  // We use supabaseAdmin to bypass RLS and ensure the order is created
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured. Please check your environment variables.');
  }

  const { items, ...orderInfo } = orderData;

  // 1. Insert order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert([
      {
        user_id: orderInfo.user_id || null,
        customer_name: orderInfo.customer_name,
        customer_email: orderInfo.customer_email,
        customer_phone: orderInfo.customer_phone,
        shipping_address: orderInfo.shipping_address,
        city: orderInfo.city,
        district: orderInfo.district,
        pincode: orderInfo.pincode,
        total_amount: orderInfo.total_amount,
        promo_code: orderInfo.promo_code,
        discount_amount: orderInfo.discount_amount,
        payment_method: orderInfo.payment_method,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order in Supabase:', orderError);
    
    // Check for "table not found" error
    if (orderError.code === 'PGRST116' || orderError.code === 'PGRST204' || orderError.message?.includes('not found')) {
      throw new Error('The "orders" table is not found in your database. Please run the SQL migration in your Supabase SQL Editor.');
    }
    
    throw new Error(`Failed to place order: ${orderError.message}`);
  }

  // 2. Increment promo code usage if applicable
  if (orderInfo.promo_code) {
    try {
      await supabaseAdmin.rpc('increment_promo_usage', { p_code: orderInfo.promo_code });
    } catch (e) {
      console.warn('Failed to increment promo usage:', e);
      // Non-critical, continue
    }
  }

  // 3. Insert order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    price: item.price
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    // Even if items fail, order exists, but this is bad. 
    // In a production app, you might use a transaction (PostgreSQL function).
    throw new Error(`Failed to save order items. Order ID: ${order.id}. Please contact support.`);
  }

  revalidatePath('/admin/orders');
  revalidatePath('/profile');
  
  return order;
}
