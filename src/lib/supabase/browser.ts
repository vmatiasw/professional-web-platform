import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';
import { supabasePublishableKey, supabaseUrl } from './config';

export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}