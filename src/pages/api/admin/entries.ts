import type { APIRoute } from 'astro';
import { getBusinessContext, isEntryType, slugify } from '../../../lib/admin/business';

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
  if (!locals.user || !locals.supabase) return redirect('/login');
  const { active } = await getBusinessContext(locals.supabase, locals.user, cookies);
  if (!active) return redirect('/admin');
  const form = await request.formData();
  const action = String(form.get('_action') ?? 'save');
  const entryId = String(form.get('id') ?? '');
  if (action === 'delete' && entryId) {
    await locals.supabase.from('entries').delete().eq('id', entryId).eq('business_id', active.business_id);
    return redirect('/admin/entries');
  }
  const title = String(form.get('title') ?? '').trim();
  const slug = slugify(String(form.get('slug') || title));
  const type = String(form.get('type') ?? 'project');
  if (!title || !slug || !isEntryType(type)) return redirect(`/admin/entries${entryId ? `/${entryId}` : '/new'}?error=invalid`);
  const values = {
    business_id: active.business_id,
    type,
    title,
    slug,
    description: String(form.get('description') ?? '').trim() || null,
    location: String(form.get('location') ?? '').trim() || null,
    date: String(form.get('date') ?? '').trim() || null,
    external_url: String(form.get('external_url') ?? '').trim() || null,
    published: form.get('published') === 'on',
    featured: form.get('featured') === 'on',
    sort_order: Number(form.get('sort_order') ?? 0) || 0
  };
  let savedEntryId = entryId;
  if (entryId) {
    await locals.supabase.from('entries').update(values).eq('id', entryId).eq('business_id', active.business_id);
  } else {
    const { data: inserted } = await locals.supabase.from('entries').insert(values).select('id').maybeSingle();
    savedEntryId = (inserted as unknown as { id: string } | null)?.id ?? '';
  }
  if (savedEntryId) {
    const englishTitle = String(form.get('en_title') ?? '').trim();
    if (englishTitle) {
      await locals.supabase.from('entry_translations').upsert({ entry_id: savedEntryId, locale: 'en', title: englishTitle, slug: slugify(String(form.get('en_slug') || englishTitle)), description: String(form.get('en_description') ?? '').trim() || null, location: String(form.get('en_location') ?? '').trim() || null });
    } else if (entryId) {
      await locals.supabase.from('entry_translations').delete().eq('entry_id', savedEntryId).eq('locale', 'en');
    }
  }
  return redirect('/admin/entries');
};