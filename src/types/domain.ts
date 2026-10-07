import type { Business, Entry, EntryTranslation, Media, Person, SiteSettings } from './database';

export type PublicSiteData = {
  business: Business;
  settings: SiteSettings | null;
  entries: Entry[];
  translations: EntryTranslation[];
  media: Media[];
  people: Person[];
};

export type TemplateProps = PublicSiteData & { locale: 'es' | 'en' };