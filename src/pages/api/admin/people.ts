import type { APIRoute } from 'astro';
import { getBusinessContext } from '../../../lib/admin/business';
import type { Media, Person } from '../../../types/database';

function safeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
}

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
  if (!locals.user || !locals.supabase) return redirect('/login');
  const { active } = await getBusinessContext(locals.supabase, locals.user, cookies);
  if (!active) return redirect('/admin');
  const form = await request.formData();
  const action = String(form.get('_action') ?? 'save');
  const personId = String(form.get('id') ?? '');
  if (action === 'delete' && personId) {
    await locals.supabase.from('people').delete().eq('id', personId).eq('business_id', active.business_id);
    return redirect('/admin/people');
  }
  const name = String(form.get('name') ?? '').trim();
  const kindValue = String(form.get('kind') ?? 'staff');
  const kind = kindValue as Person['kind'];
  if (!name || !['staff', 'collaborator'].includes(kindValue)) return redirect(`/admin/people${personId ? `?edit=${personId}` : ''}&error=invalid`);
  let photoMediaId: string | null = null;
  const photo = form.get('photo');
  if (photo instanceof File && photo.size && photo.type.startsWith('image/')) {
    const path = `${active.business_id}/images/people/${crypto.randomUUID()}-${safeFileName(photo.name)}`;
    const upload = await locals.supabase.storage.from('site-images').upload(path, photo, { contentType: photo.type, upsert: false });
    if (!upload.error) {
      const { data: mediaRow } = await locals.supabase.from('media').insert({ business_id: active.business_id, storage_path: path, kind: 'image', mime_type: photo.type, alt_text: name }).select('id').maybeSingle();
      photoMediaId = (mediaRow as unknown as Pick<Media, 'id'> | null)?.id ?? null;
    }
  }
  let cvStoragePath: string | null = null;
  const cv = form.get('cv');
  if (cv instanceof File && cv.size) {
    const path = `${active.business_id}/documents/${crypto.randomUUID()}-${safeFileName(cv.name)}`;
    const upload = await locals.supabase.storage.from('site-documents').upload(path, cv, { contentType: cv.type || 'application/pdf', upsert: false });
    if (!upload.error) cvStoragePath = path;
  }
  const values = {
    business_id: active.business_id,
    name,
    role: String(form.get('role') ?? '').trim() || null,
    bio: String(form.get('bio') ?? '').trim() || null,
    kind,
    sort_order: Number(form.get('sort_order') ?? 0) || 0,
    published: form.get('published') === 'on',
    ...(photoMediaId ? { photo_media_id: photoMediaId } : {}),
    ...(cvStoragePath ? { cv_storage_path: cvStoragePath } : {})
  };
  if (personId) await locals.supabase.from('people').update(values).eq('id', personId).eq('business_id', active.business_id);
  else await locals.supabase.from('people').insert(values);
  return redirect('/admin/people');
};