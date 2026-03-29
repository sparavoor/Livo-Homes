import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Prevent crash if URL is missing
const isValidUrl = (url: string) => {
  try {
    return url && url.startsWith('http') && !url.includes('your_supabase_url');
  } catch {
    return false;
  }
};

// Singleton to avoid multiple client instances in the browser
let clientInstance: any;

export const supabase = isValidUrl(supabaseUrl) 
  ? (clientInstance = clientInstance || createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Disable browser locking to prevent "Another request stole it" errors
        // specifically when multiple instances might clash in development or multi-tab
        storageKey: 'sb-livo-auth-token',
      }
    }))
  : null as any;
