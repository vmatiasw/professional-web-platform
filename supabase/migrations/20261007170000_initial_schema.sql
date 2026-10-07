create extension if not exists "pgcrypto";

create type public.business_member_role as enum ('owner', 'editor');
create type public.entry_type as enum ('project', 'competition', 'travel', 'publication');
create type public.media_kind as enum ('image', 'video');
create type public.person_kind as enum ('staff', 'collaborator');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  default_locale text not null default 'es' check (default_locale in ('es', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.business_member_role not null default 'editor',
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table public.site_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  public_name text,
  seo_description text,
  email text,
  phone text,
  address text,
  social_links jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type public.entry_type not null,
  title text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  location text,
  date date,
  external_url text,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, slug)
);

create table public.entry_translations (
  entry_id uuid not null references public.entries(id) on delete cascade,
  locale text not null check (locale in ('es', 'en')),
  title text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  location text,
  primary key (entry_id, locale),
  unique (entry_id, locale, slug)
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  storage_path text not null,
  kind public.media_kind not null,
  mime_type text not null,
  alt_text text,
  title text,
  description text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, storage_path)
);

create table public.entry_media (
  entry_id uuid not null references public.entries(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  primary key (entry_id, media_id)
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  role text,
  bio text,
  photo_media_id uuid references public.media(id) on delete set null,
  cv_storage_path text,
  sort_order integer not null default 0,
  kind public.person_kind not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index entries_business_listing_idx on public.entries (business_id, type, published, sort_order);
create index entries_business_slug_idx on public.entries (business_id, slug);
create index business_members_user_idx on public.business_members (user_id);
create index media_business_idx on public.media (business_id, sort_order);
create index people_business_idx on public.people (business_id, kind, published, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_set_updated_at before update on public.businesses
for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();
create trigger entries_set_updated_at before update on public.entries
for each row execute function public.set_updated_at();
create trigger media_set_updated_at before update on public.media
for each row execute function public.set_updated_at();
create trigger people_set_updated_at before update on public.people
for each row execute function public.set_updated_at();

create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.business_members
    where business_id = target_business_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_business_editor(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.business_members
    where business_id = target_business_id
      and user_id = (select auth.uid())
      and role in ('owner', 'editor')
  );
$$;

create or replace function public.is_business_owner(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.business_members
    where business_id = target_business_id
      and user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.site_settings enable row level security;
alter table public.entries enable row level security;
alter table public.entry_translations enable row level security;
alter table public.media enable row level security;
alter table public.entry_media enable row level security;
alter table public.people enable row level security;

create policy "public can read businesses" on public.businesses for select using (true);
create policy "members can update businesses" on public.businesses for update using (public.is_business_editor(id)) with check (public.is_business_editor(id));
create policy "members can read memberships" on public.business_members for select using (user_id = (select auth.uid()) or public.is_business_member(business_id));
create policy "owners can manage memberships" on public.business_members for all using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

create policy "public can read site settings" on public.site_settings for select using (true);
create policy "members can manage site settings" on public.site_settings for all using (public.is_business_editor(business_id)) with check (public.is_business_editor(business_id));

create policy "public can read published entries" on public.entries for select using (published = true);
create policy "members can manage entries" on public.entries for all using (public.is_business_editor(business_id)) with check (public.is_business_editor(business_id));

create policy "public can read translations for published entries" on public.entry_translations for select using (exists (select 1 from public.entries where id = entry_id and published));
create policy "members can manage translations" on public.entry_translations for all using (exists (select 1 from public.entries where id = entry_id and public.is_business_editor(business_id))) with check (exists (select 1 from public.entries where id = entry_id and public.is_business_editor(business_id)));

create policy "public can read media for published entries" on public.media for select using (exists (select 1 from public.entry_media join public.entries on entries.id = entry_id where media_id = media.id and entries.published));
create policy "members can manage media" on public.media for all using (public.is_business_editor(business_id)) with check (public.is_business_editor(business_id));

create policy "public can read published entry media" on public.entry_media for select using (exists (select 1 from public.entries where id = entry_id and published));
create policy "members can manage entry media" on public.entry_media for all using (exists (select 1 from public.entries where id = entry_id and public.is_business_editor(business_id))) with check (exists (select 1 from public.entries where id = entry_id and public.is_business_editor(business_id)));

create policy "public can read published people" on public.people for select using (published = true);
create policy "members can manage people" on public.people for all using (public.is_business_editor(business_id)) with check (public.is_business_editor(business_id));

insert into storage.buckets (id, name, public) values
  ('site-images', 'site-images', true),
  ('site-videos', 'site-videos', true),
  ('site-documents', 'site-documents', false)
on conflict (id) do nothing;

create policy "members can upload site images" on storage.objects for insert to authenticated with check (bucket_id = 'site-images' and public.is_business_editor(((storage.foldername(name))[1])::uuid));
create policy "members can update site images" on storage.objects for update to authenticated using (bucket_id = 'site-images' and public.is_business_editor(((storage.foldername(name))[1])::uuid)) with check (bucket_id = 'site-images' and public.is_business_editor(((storage.foldername(name))[1])::uuid));
create policy "members can delete site images" on storage.objects for delete to authenticated using (bucket_id = 'site-images' and public.is_business_editor(((storage.foldername(name))[1])::uuid));

create policy "members can upload site videos" on storage.objects for insert to authenticated with check (bucket_id = 'site-videos' and public.is_business_editor(((storage.foldername(name))[1])::uuid));
create policy "members can update site videos" on storage.objects for update to authenticated using (bucket_id = 'site-videos' and public.is_business_editor(((storage.foldername(name))[1])::uuid)) with check (bucket_id = 'site-videos' and public.is_business_editor(((storage.foldername(name))[1])::uuid));
create policy "members can delete site videos" on storage.objects for delete to authenticated using (bucket_id = 'site-videos' and public.is_business_editor(((storage.foldername(name))[1])::uuid));

create policy "members can manage site documents" on storage.objects for all to authenticated using (bucket_id = 'site-documents' and public.is_business_editor(((storage.foldername(name))[1])::uuid)) with check (bucket_id = 'site-documents' and public.is_business_editor(((storage.foldername(name))[1])::uuid));