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
        flowType: 'pkce',
        // Provide a primitive custom storage to bypass standard locking
        storage: typeof window !== 'undefined' ? {
          getItem: (key) => window.localStorage.getItem(key),
          setItem: (key, value) => window.localStorage.setItem(key, value),
          removeItem: (key) => window.localStorage.removeItem(key),
        } : undefined,
      },
      cookieOptions: {
        name: 'sb-livo-auth-token',
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }
    }))
  : null as any;
