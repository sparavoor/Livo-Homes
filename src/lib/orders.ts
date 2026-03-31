import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { CartItem } from '@/context/CartContext';
import { sendOrderEmail, getOrderEmailTemplate } from './email';

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

  // 4. Send Confirmation Email
  if (order.customer_email) {
    const emailHtml = getOrderEmailTemplate(order, 'pending');
    await sendOrderEmail(order.customer_email, `Procurement Logged: #LIVO-${order.id.slice(-6).toUpperCase()}`, emailHtml);
  }

  return order;
}

export async function getUserOrders(userId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (image)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data;
}

// Admin function to fetch orders with pagination - uses supabaseAdmin to bypass RLS
export async function getAllOrders(page: number = 1, limit: number = 20) {
  const client = supabaseAdmin || supabase;
  if (!client) return [];

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // We fetch without order_items for the list view to maintain performance
  const { data, error } = await client
    .from('orders')
    .select(`*`)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }

  return data;
}

// Fetch order items only when needed (Lazy Loading)
export async function getOrderItems(orderId: string) {
  const client = supabaseAdmin || supabase;
  if (!client) return [];

  const { data, error } = await client
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) {
    console.error('Error fetching order items:', error);
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

  // Send Status Update Email
  if (data.customer_email) {
    const emailHtml = getOrderEmailTemplate(data, status);
    await sendOrderEmail(data.customer_email, `Order Status Update: #LIVO-${data.id.slice(-6).toUpperCase()}`, emailHtml);
  }

  return data;
}

export async function cancelOrder(orderId: string, userId?: string) {
  const client = supabaseAdmin || supabase;
  if (!client) throw new Error('Supabase not initialized');

  // 1. Basic ID Validation (UUID check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(orderId)) {
    throw new Error('Invalid Procurement ID structure.');
  }

  // 2. Fetch current status for verification using maybeSingle()
  const { data: currentOrder, error: fetchError } = await client
    .from('orders')
    .select('status, customer_email, id')
    .eq('id', orderId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching order status before cancellation:', fetchError.message);
    throw new Error('Could not verify procurement status.');
  }

  if (!currentOrder) {
    throw new Error('This procurement record could not be found in the registry.');
  }

  console.log(`CANCEL_ORDER_DEBUG: Order #${orderId.slice(-6)} - Current Status (DB): "${currentOrder.status}"`);

  // 3. Validate Eligibility (Case-Insensitive)
  const normalizedStatus = (currentOrder.status || '').toLowerCase();
  if (normalizedStatus !== 'pending') {
    throw new Error(`This procurement is no longer eligible for withdrawal (Actual Status: ${currentOrder.status}).`);
  }

  console.log(`Initiating withdrawal for procurement: #${orderId.slice(-6)}`);

  // 4. Execute Cancellation using maybeSingle() to prevent "Cannot coerce result to a single JSON object"
  let query = client
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query
    .select()
    .maybeSingle();

  if (error) {
    console.error('DATABASE CRITICAL ERROR:', error.message || error);
    throw new Error(error.message || 'The registry could not process this withdrawal request.');
  }

  if (!data) {
    throw new Error('Failed to update the procurement status. This could be due to permission restrictions.');
  }

  // 5. Dispatch Email
  if (data.customer_email) {
    try {
      const emailHtml = getOrderEmailTemplate(data, 'cancelled');
      await sendOrderEmail(data.customer_email, `Procurement Withdrawn: #LIVO-${data.id.slice(-6).toUpperCase()}`, emailHtml);
    } catch (emailErr) {
      console.warn('Withdrawal email dispatch failed:', emailErr);
    }
  }

  return data;
}

export async function getDashboardStats() {
  const client = (supabaseAdmin as any) || (supabase as any);
  if (!client) throw new Error('Supabase not initialized');

  const { data: summary, error: rpcError } = await client
    .rpc('get_dashboard_summary');

  if (rpcError) {
    console.error('Error from get_dashboard_summary RPC:', rpcError);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      uniqueCustomers: 0,
      recentOrders: []
    };
  }

  const { data: recent, error: recentError } = await client
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    totalOrders: summary?.total_orders || 0,
    totalRevenue: summary?.total_revenue || 0,
    pendingOrders: summary?.pending_orders || 0,
    uniqueCustomers: summary?.unique_customers || 0,
    recentOrders: recent || []
  };
}
