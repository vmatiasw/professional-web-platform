import type { APIRoute } from 'astro';
import { activeBusinessCookie, getBusinessContext } from '../../../lib/admin/business';

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
  if (!locals.user || !locals.supabase) return redirect('/login');
  const businessId = String((await request.formData()).get('business_id') ?? '');
  const { memberships } = await getBusinessContext(locals.supabase, locals.user, cookies);
  if (!memberships.some((membership) => membership.business_id === businessId)) return redirect('/admin');
  cookies.set(activeBusinessCookie, businessId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return redirect('/admin');
};