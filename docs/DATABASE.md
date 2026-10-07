# Base de datos

Supabase PostgreSQL es la fuente de verdad. Los archivos binarios no se guardan en tablas: imágenes, videos y CVs viven en Supabase Storage; la base guarda sus referencias y metadatos.

## Modelo inicial

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

`id`, `business_id`, `name`, `role`, `bio`, `photo_media_id`, `cv_storage_path`, `sort_order`, `kind` (`staff` o `collaborator`), timestamps.

## Reglas de integridad y seguridad

- Todas las tablas de negocio incluyen `business_id` directa o indirectamente y UUID como identificador.
- Índices iniciales: `(business_id, type, published, sort_order)`, `(business_id, slug)` y membresías por `user_id`.
- RLS debe permitir leer y modificar datos sólo a miembros del negocio correspondiente.
- El sitio público sólo lee entradas publicadas y media asociada.
- Las policies de Storage deben separar los paths por negocio y aplicar el mismo control de membresía.
- Los slugs deben ser únicos por negocio e idioma.

El esquema real se incorporará mediante migraciones versionadas en `supabase/migrations/` cuando comience la implementación, después de validar estos campos con el contenido real.
