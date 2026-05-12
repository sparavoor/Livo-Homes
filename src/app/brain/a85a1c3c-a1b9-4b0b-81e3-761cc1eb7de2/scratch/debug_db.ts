import { supabaseAdmin } from './src/lib/supabase-admin';

async function debugData() {
  if (!supabaseAdmin) {
    console.error("Supabase Admin not initialized. Check your environment variables.");
    return;
  }

  console.log("Checking profiles table...");
  const { data: profiles, error: profileError } = await supabaseAdmin.from('profiles').select('count');
  if (profileError) {
    console.error("Error checking profiles:", profileError.message);
  } else {
    console.log("Profiles count:", profiles[0]?.count || 0);
  }

  console.log("Checking orders table...");
  const { data: orders, error: orderError } = await supabaseAdmin.from('orders').select('count');
  if (orderError) {
    console.error("Error checking orders:", orderError.message);
  } else {
    console.log("Orders count:", orders[0]?.count || 0);
  }
}

debugData();
