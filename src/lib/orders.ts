import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { CartItem } from '@/context/CartContext';

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

export async function createOrder(orderData: OrderData) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { items, ...orderInfo } = orderData;

  // 1. Insert order
  const { data: order, error: orderError } = await supabase
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
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  // 2. Increment promo code usage if applicable
  if (orderInfo.promo_code) {
    await supabase.rpc('increment_promo_usage', { p_code: orderInfo.promo_code });
  }

  // 3. Insert order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    price: item.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw itemsError;
  }

  return order;
}

export async function getUserOrders(userId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data;
}

// Admin function to fetch all orders - uses supabaseAdmin to bypass RLS
export async function getAllOrders() {
  const client = supabaseAdmin || supabase;
  if (!client) return [];

  const { data, error } = await client
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }

  return data;
}

// Admin function to update order status - uses supabaseAdmin to bypass RLS
export async function updateOrderStatus(orderId: string, status: string) {
  const client = supabaseAdmin || supabase;
  if (!client) throw new Error('Supabase not initialized');

  const { data, error } = await client
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  return data;
}
