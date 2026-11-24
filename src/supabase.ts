import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { SUPABASE_ANON_KEY, SUPABASE_URL, cloudEnabled } from './config';

export const supabase: SupabaseClient | null = cloudEnabled
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        // In the Android app the return link is handled in code (see native.ts).
        detectSessionInUrl: !Capacitor.isNativePlatform(),
      },
    })
  : null;
