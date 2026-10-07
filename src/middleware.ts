import { defineMiddleware } from 'astro:middleware';
import { isSupabaseConfigured } from './lib/supabase/config';
import { createSupabaseServerClient } from './lib/supabase/server';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = null;
  context.locals.user = null;

  if (isSupabaseConfigured) {
    const supabase = createSupabaseServerClient(context.cookies, context.request);
    context.locals.supabase = supabase;
    const { data } = await supabase.auth.getUser();
    context.locals.user = data.user;
  }

  if (context.url.pathname.startsWith('/admin') && !context.locals.user) {
    return context.redirect('/login');
  }

  return next();
});