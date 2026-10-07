# Base de datos

Supabase PostgreSQL es la fuente de verdad. Los archivos binarios no se guardan en tablas: imágenes, videos y CVs viven en Supabase Storage; la base guarda sus referencias y metadatos.

## Migración implementada

El esquema está versionado en `supabase/migrations/20261007170000_initial_schema.sql` y los grants API en `supabase/migrations/20261007212000_grant_api_roles.sql`. Ambas migraciones están aplicadas al proyecto Supabase configurado. `npx supabase db lint --linked` no reporta errores.

## Modelo implementado

### `businesses`

`id` UUID, `name`, `slug`, `description`, `default_locale`, timestamps. Representa un cliente u organización.

### `business_members`

`business_id`, `user_id` de Supabase Auth, `role`, timestamps. La clave primaria compuesta evita membresías duplicadas. Roles iniciales: `owner` y `editor`.

### `site_settings`

`business_id`, nombre público, descripción SEO, email, teléfonos, dirección, enlaces sociales y configuración de contacto. Una fila por negocio.

### `entries`

`id`, `business_id`, `type`, `title`, `slug`, `description`, `location`, `date`, `external_url`, `published`, `featured`, `sort_order`, timestamps. `type` cubre inicialmente `project`, `competition`, `travel` y `publication`, evitando cuatro sistemas de contenido separados.

### `entry_translations`

`entry_id`, `locale`, `title`, `slug`, `description`, `location`. Clave única por entrada e idioma. Los campos no traducibles permanecen en `entries`.

### `media`

`id`, `business_id`, `storage_path`, `kind` (`image` o `video`), `alt_text`, `title`, `description`, `width`, `height`, `mime_type`, `sort_order`, timestamps. `storage_path` identifica el objeto en un bucket privado o público según la política del recurso.

### `entry_media`

`entry_id`, `media_id`, `sort_order`, `is_featured`. Permite reutilizar media y ordenar una galería sin duplicar archivos.

### `people`

`id`, `business_id`, `name`, `role`, `bio`, `photo_media_id`, `cv_storage_path`, `sort_order`, `kind` (`staff` o `collaborator`), `published`, timestamps.

## RLS y Storage implementados

- Todas las tablas de negocio incluyen `business_id` directa o indirectamente y UUID como identificador.
- Índices iniciales: `(business_id, type, published, sort_order)`, `(business_id, slug)` y membresías por `user_id`.
- RLS está habilitado en todas las tablas. Las funciones `is_business_member`, `is_business_editor` e `is_business_owner` son `security definer` y centralizan la pertenencia sin exponer consultas recursivas.
- Los editores y owners pueden modificar únicamente filas de su business; los owners administran membresías.
- El sitio público sólo lee entradas, traducciones, media asociada y personas publicadas.
- Los buckets `site-images`, `site-videos` y `site-documents` usan paths `business/{business_id}/...`; las policies de escritura validan la membresía contra el primer segmento. CVs/documentos son privados; imágenes y videos son públicos para servir el sitio.
- Los slugs base son únicos por business; las traducciones son únicas por entry e idioma. La unicidad global de slugs traducidos queda para cuando el routing traducido se implemente.

Para verificar aislamiento en un proyecto conectado, crear dos businesses y dos usuarios, asignar cada usuario a uno solo y probar lectura/escritura de tablas y Storage con ambos tokens. Esa verificación requiere un proyecto Supabase real y no se pudo ejecutar localmente.

## Primer usuario y business

El business `viola-di-benedetto` ya existe en el proyecto remoto. Para crear el primer owner, crear un usuario email/password desde Supabase Dashboard → Authentication → Users y ejecutar en el SQL Editor:

```sql
insert into public.business_members (business_id, user_id, role)
select id, '<AUTH_USER_UUID>', 'owner'
from public.businesses
where slug = 'viola-di-benedetto'
on conflict (business_id, user_id) do update set role = 'owner';
```

No se guardan emails ni contraseñas en el repositorio.
