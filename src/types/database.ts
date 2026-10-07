export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      businesses: { Row: Business; Insert: Partial<Business> & Pick<Business, 'name' | 'slug'>; Update: Partial<Business>; Relationships: [] };
      business_members: { Row: BusinessMember; Insert: BusinessMember; Update: Partial<BusinessMember>; Relationships: [] };
      site_settings: { Row: SiteSettings; Insert: Partial<SiteSettings> & Pick<SiteSettings, 'business_id'>; Update: Partial<SiteSettings>; Relationships: [] };
      entries: { Row: Entry; Insert: Partial<Entry> & Pick<Entry, 'business_id' | 'type' | 'title' | 'slug'>; Update: Partial<Entry>; Relationships: [] };
      entry_translations: { Row: EntryTranslation; Insert: EntryTranslation; Update: Partial<EntryTranslation>; Relationships: [] };
      media: { Row: Media; Insert: Partial<Media> & Pick<Media, 'business_id' | 'storage_path' | 'kind' | 'mime_type'>; Update: Partial<Media>; Relationships: [] };
      entry_media: { Row: EntryMedia; Insert: EntryMedia; Update: Partial<EntryMedia>; Relationships: [] };
      people: { Row: Person; Insert: Partial<Person> & Pick<Person, 'business_id' | 'name' | 'kind'>; Update: Partial<Person>; Relationships: [] };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      business_member_role: 'owner' | 'editor';
      entry_type: 'project' | 'competition' | 'travel' | 'publication';
      media_kind: 'image' | 'video';
      person_kind: 'staff' | 'collaborator';
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Business = { id: string; name: string; slug: string; description: string | null; default_locale: 'es' | 'en'; created_at: string; updated_at: string };
export type BusinessMember = { business_id: string; user_id: string; role: 'owner' | 'editor'; created_at: string };
export type SiteSettings = { business_id: string; public_name: string | null; seo_description: string | null; email: string | null; phone: string | null; address: string | null; social_links: Json; created_at: string; updated_at: string };
export type Entry = { id: string; business_id: string; type: 'project' | 'competition' | 'travel' | 'publication'; title: string; slug: string; description: string | null; location: string | null; date: string | null; external_url: string | null; published: boolean; featured: boolean; sort_order: number; created_at: string; updated_at: string };
export type EntryTranslation = { entry_id: string; locale: 'es' | 'en'; title: string; slug: string; description: string | null; location: string | null };
export type Media = { id: string; business_id: string; storage_path: string; kind: 'image' | 'video'; mime_type: string; alt_text: string | null; title: string | null; description: string | null; width: number | null; height: number | null; sort_order: number; created_at: string; updated_at: string };
export type EntryMedia = { entry_id: string; media_id: string; sort_order: number; is_featured: boolean };
export type Person = { id: string; business_id: string; name: string; role: string | null; bio: string | null; photo_media_id: string | null; cv_storage_path: string | null; sort_order: number; kind: 'staff' | 'collaborator'; published: boolean; created_at: string; updated_at: string };