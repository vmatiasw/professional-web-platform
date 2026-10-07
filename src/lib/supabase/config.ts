export const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
export const supabasePublishableKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);