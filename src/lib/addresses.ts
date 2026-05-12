import { supabase } from './supabase';

export interface UserAddress {
  id: string;
  user_id: string;
  title: string;
  state: string;
  district: string;
  address_line: string;
  pincode: string;
  is_primary: boolean;
  created_at?: string;
}

export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
  return data || [];
}

export async function addUserAddress(address: Omit<UserAddress, 'id' | 'created_at'>): Promise<UserAddress | null> {
  const { data, error } = await supabase
    .from('user_addresses')
    .insert(address)
    .select()
    .single();

  if (error) {
    console.error('Error adding address:', error);
    throw error;
  }
  return data;
}

export async function updateUserAddress(id: string, userId: string, updates: Partial<UserAddress>): Promise<UserAddress | null> {
  const { data, error } = await supabase
    .from('user_addresses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating address:', error);
    throw error;
  }
  return data;
}

export async function deleteUserAddress(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting address:', error);
    return false;
  }
  return true;
}
