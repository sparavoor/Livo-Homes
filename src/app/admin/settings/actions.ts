'use server';
import { revalidatePath } from 'next/cache';
import { getSettings, saveSettings, SiteSettings } from '@/lib/db';

export async function fetchSettingsAction() {
  return await getSettings();
}

export async function updateSettingsAction(formData: FormData) {
  const currentSettings = await getSettings();
  
  const updatedSettings: SiteSettings = {
    siteName: formData.get('siteName') as string || currentSettings.siteName,
    tagline: formData.get('tagline') as string || currentSettings.tagline,
    contactEmail: formData.get('contactEmail') as string || currentSettings.contactEmail,
    contactPhone: formData.get('contactPhone') as string || currentSettings.contactPhone,
    whatsappNumber: formData.get('whatsappNumber') as string || currentSettings.whatsappNumber,
    address: formData.get('address') as string || currentSettings.address,
    officeHours: formData.get('officeHours') as string || currentSettings.officeHours,
    socials: {
      instagram: formData.get('instagram') as string || currentSettings.socials?.instagram,
      facebook: formData.get('facebook') as string || currentSettings.socials?.facebook,
      twitter: formData.get('twitter') as string || currentSettings.socials?.twitter,
      linkedin: formData.get('linkedin') as string || currentSettings.socials?.linkedin,
    }
  };

  await saveSettings(updatedSettings);
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}
