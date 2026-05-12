'use server';

import { getBanners, addBanner, updateBanner, deleteBanner, Banner } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function fetchBannersAction() {
  console.log('action: fetchBannersAction');
  return await getBanners(true);
}

export async function addBannerAction(data: Omit<Banner, 'id'>) {
  console.log('action: addBannerAction', data.title);
  try {
    const result = await addBanner(data);
    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { success: true, banner: result };
  } catch (error: any) {
    console.error('action: addBannerAction FAILED:', error.message);
    throw error;
  }
}

export async function updateBannerAction(id: string, data: Omit<Banner, 'id'>) {
  console.log('action: updateBannerAction', id);
  await updateBanner(id, data);
  revalidatePath('/admin/banners');
  revalidatePath('/');
  return { success: true };
}

export async function deleteBannerAction(id: string) {
  console.log('action: deleteBannerAction', id);
  await deleteBanner(id);
  revalidatePath('/admin/banners');
  revalidatePath('/');
  return { success: true };
}

export async function toggleBannerStatusAction(id: string) {
  console.log('action: toggleBannerStatusAction', id);
  const banners = await getBanners(true);
  const banner = banners.find(b => b.id === id);
  if (!banner) throw new Error('Banner not found');

  await updateBanner(id, { isActive: !banner.isActive });
  revalidatePath('/admin/banners');
  revalidatePath('/');
  return { success: true };
}


