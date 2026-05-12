'use server';

import { revalidatePath } from 'next/cache';
import { getAllOrders, updateOrderStatus, getOrderItems, getDashboardStats } from '@/lib/orders';

export async function fetchOrdersAction(page: number = 1) {
  return await getAllOrders(page);
}

export async function fetchOrderItemsAction(orderId: string) {
  return await getOrderItems(orderId);
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
    return await getDashboardStats();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}
