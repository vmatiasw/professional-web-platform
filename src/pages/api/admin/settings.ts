import type { APIRoute } from 'astro';
import { getBusinessContext } from '../../../lib/admin/business';

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
  if (!locals.user || !locals.supabase) return redirect('/login');
  const { active } = await getBusinessContext(locals.supabase, locals.user, cookies);
  if (!active) return redirect('/admin');
  const form = await request.formData();
  const socialLinks = Object.fromEntries(['instagram', 'linkedin', 'facebook'].map((name) => [name, String(form.get(name) ?? '').trim()]).filter(([, value]) => value));
  await locals.supabase.from('site_settings').upsert({ business_id: active.business_id, public_name: String(form.get('public_name') ?? '').trim() || null, seo_description: String(form.get('seo_description') ?? '').trim() || null, email: String(form.get('email') ?? '').trim() || null, phone: String(form.get('phone') ?? '').trim() || null, address: String(form.get('address') ?? '').trim() || null, social_links: socialLinks });
  return redirect('/admin/settings?saved=1');
};