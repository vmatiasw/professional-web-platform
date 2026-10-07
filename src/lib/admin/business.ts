import type { AstroCookies } from 'astro';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Business, BusinessMember, Database } from '../../types/database';

export const activeBusinessCookie = 'active_business_id';
export type BusinessMembership = BusinessMember & { business: Business };

export async function getBusinessContext(supabase: SupabaseClient<Database>, user: User, cookies: AstroCookies) {
  const { data: membershipData, error } = await supabase.from('business_members').select('business_id, user_id, role, created_at').eq('user_id', user.id);
  const membershipRows = (membershipData ?? []) as unknown as BusinessMember[];
  if (error || !membershipRows.length) return { active: null, memberships: [] as BusinessMembership[] };
  const { data: businessRows } = await supabase.from('businesses').select('*').in('id', membershipRows.map((membership) => membership.business_id));
  const businesses = (businessRows ?? []) as unknown as Business[];
  const memberships = membershipRows.map((membership) => {
    const business = businesses.find((candidate) => candidate.id === membership.business_id);
    return business ? { ...membership, business } : null;
  }).filter((membership): membership is BusinessMembership => membership !== null);
  const requestedId = cookies.get(activeBusinessCookie)?.value;
  const active = memberships.find((membership) => membership.business_id === requestedId) ?? memberships[0] ?? null;
  if (active && requestedId !== active.business_id) cookies.set(activeBusinessCookie, active.business_id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return { active, memberships };
}

export function isEntryType(value: string): value is 'project' | 'competition' | 'travel' | 'publication' {
  return ['project', 'competition', 'travel', 'publication'].includes(value);
}

export function slugify(value: string): string {
  return value.trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}