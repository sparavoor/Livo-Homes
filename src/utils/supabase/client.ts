import { createBrowserClient } from '@supabase/ssr'

let supabase: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    return null as any;
  }

  supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {

      auth: {
        storageKey: 'sb-livo-auth-token',
      }
    }
  )
  return supabase;
}
