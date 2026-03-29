'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

export async function fetchBannersAction() {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((b: any) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    image: b.image_url,
    link: b.link_url,
    isActive: b.is_active,
    order: b.display_order
  }));
}

export async function addBannerAction(data: {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
}) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { error } = await supabaseAdmin
    .from('banners')
    .insert([{
      title: data.title,
      subtitle: data.subtitle,
      image_url: data.image,
      link_url: data.link,
      is_active: data.isActive,
      display_order: data.order
    }]);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/banners');
  revalidatePath('/');
  return { success: true };
}

export async function updateBannerAction(id: string, data: {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
}) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { error } = await supabaseAdmin
    .from('banners')
    .update({
      title: data.title,
      subtitle: data.subtitle,
      image_url: data.image,
      link_url: data.link,
      is_active: data.isActive,
      display_order: data.order
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/banners');
  revalidatePath('/');
  return { success: true };
}

export async function deleteBannerAction(id: string) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  const { error } = await supabaseAdmin
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/banners');
  revalidatePath('/');
  return { success: true };
}

export async function toggleBannerStatusAction(id: string) {
  if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

  // Get current status
  const { data: current, error: getError } = await supabaseAdmin
    .from('banners')
    .select('is_active')
    .eq('id', id)
    .single();

  if (getError) throw new Error(getError.message);

  const { error } = await supabaseAdmin
    .from('banners')
    .update({ is_active: !current.is_active })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/banners');
  revalidatePath('/');
  return { success: true };
}
