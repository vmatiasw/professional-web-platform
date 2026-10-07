import type { APIRoute } from 'astro';
import { getBusinessContext } from '../../../lib/admin/business';
import type { Media } from '../../../types/database';

function safeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
}

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
  if (!locals.user || !locals.supabase) return redirect('/login');
  const { active } = await getBusinessContext(locals.supabase, locals.user, cookies);
  if (!active) return redirect('/admin');
  const form = await request.formData();
  const action = String(form.get('_action') ?? 'upload');
  const mediaId = String(form.get('media_id') ?? '');

  if (action === 'delete' && mediaId) {
    const { data: mediaRow } = await locals.supabase.from('media').select('storage_path').eq('id', mediaId).eq('business_id', active.business_id).maybeSingle();
    const media = mediaRow as unknown as Pick<Media, 'storage_path'> | null;
    if (media) {
      await locals.supabase.storage.from('site-images').remove([media.storage_path]);
      await locals.supabase.from('media').delete().eq('id', mediaId).eq('business_id', active.business_id);
    }
    return redirect('/admin/media');
  }

  const entryId = String(form.get('entry_id') ?? '');
  const file = form.get('file');
  if (!entryId || !(file instanceof File) || !file.size || !file.type.startsWith('image/')) return redirect('/admin/media?error=invalid');
  const { data: entryRow } = await locals.supabase.from('entries').select('id').eq('id', entryId).eq('business_id', active.business_id).maybeSingle();
  if (!entryRow) return redirect('/admin/media?error=entry');

  const storagePath = `${active.business_id}/images/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const upload = await locals.supabase.storage.from('site-images').upload(storagePath, file, { contentType: file.type, upsert: false });
  if (upload.error) return redirect('/admin/media?error=upload');
  const { data: mediaRow, error: mediaError } = await locals.supabase.from('media').insert({ business_id: active.business_id, storage_path: storagePath, kind: 'image', mime_type: file.type, alt_text: String(form.get('alt_text') ?? '').trim() || null, sort_order: Number(form.get('sort_order') ?? 0) || 0 }).select('id').maybeSingle();
  const media = mediaRow as unknown as Pick<Media, 'id'> | null;
  if (mediaError || !media) {
    await locals.supabase.storage.from('site-images').remove([storagePath]);
    return redirect('/admin/media?error=record');
  }
  const featured = form.get('is_featured') === 'on';
  if (featured) await locals.supabase.from('entry_media').update({ is_featured: false }).eq('entry_id', entryId);
  await locals.supabase.from('entry_media').insert({ entry_id: entryId, media_id: media.id, sort_order: Number(form.get('sort_order') ?? 0) || 0, is_featured: featured });
  return redirect('/admin/media');
};