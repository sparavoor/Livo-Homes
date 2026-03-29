'use server';

import { revalidatePath } from 'next/cache';
import { getAllOrders, updateOrderStatus } from '@/lib/orders';

export async function fetchOrdersAction() {
  return await getAllOrders();
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    const result = await updateOrderStatus(orderId, status);
    revalidatePath('/admin/orders');
    return result;
  } catch (error) {
    console.error('Error updating order status action:', error);
    throw error;
  }
}

export async function fetchDashboardStatsAction() {
  try {
    const orders = await getAllOrders();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
    const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
    
    // Get unique customers
    const uniqueCustomers = new Set(orders.map((o: any) => o.customer_email || o.customer_phone)).size;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      uniqueCustomers,
      recentOrders: orders.slice(0, 5)
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}
