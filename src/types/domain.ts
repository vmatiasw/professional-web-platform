import type { Business, Entry, Media, Person, SiteSettings } from './database';

export type PublicSiteData = {
  business: Business;
  settings: SiteSettings | null;
  entries: Entry[];
  media: Media[];
  people: Person[];
};

export type TemplateProps = PublicSiteData & { locale: 'es' | 'en' };