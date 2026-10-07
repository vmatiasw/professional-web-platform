grant usage on schema public to anon, authenticated;

grant select on public.businesses to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.entries to anon, authenticated;
grant select on public.entry_translations to anon, authenticated;
grant select on public.media to anon, authenticated;
grant select on public.entry_media to anon, authenticated;
grant select on public.people to anon, authenticated;

grant select, insert, update, delete on public.businesses to authenticated;
grant select, insert, update, delete on public.business_members to authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;
grant select, insert, update, delete on public.entries to authenticated;
grant select, insert, update, delete on public.entry_translations to authenticated;
grant select, insert, update, delete on public.media to authenticated;
grant select, insert, update, delete on public.entry_media to authenticated;
grant select, insert, update, delete on public.people to authenticated;