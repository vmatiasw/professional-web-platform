import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';
import { supabasePublishableKey, supabaseUrl } from './config';

export function createSupabaseServerClient(cookies: AstroCookies, request: Request): SupabaseClient<Database> {
  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return (request.headers.get('cookie') ?? '').split(';').filter(Boolean).map((part) => {
          const separator = part.indexOf('=');
          return { name: part.slice(0, separator).trim(), value: decodeURIComponent(part.slice(separator + 1).trim()) };
        });
      },
      setAll(values) {
        values.forEach(({ name, value, options }) => cookies.set(name, value, options));
      }
    }
  });
}