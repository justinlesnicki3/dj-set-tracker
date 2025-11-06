// lib/supabase.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

console.log('URL ->', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('KEY loaded ->', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

