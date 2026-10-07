# Arquitectura

## Principios

La aplicación es un único proyecto Astro. El contenido y los permisos viven en Supabase; el diseño vive en código. Los templates consumen modelos de contenido tipados y no conocen detalles de edición del panel.

La primera implementación debe favorecer HTML renderizado por Astro y mantener el JavaScript del navegador al mínimo. La interactividad se agrega sólo para necesidades concretas como navegación móvil, galerías o formularios.

## Capas propuestas

```text
src/pages/                   rutas públicas y admin
  [lang]/                    sitio público en español e inglés
  admin/                     panel autenticado
src/layouts/                 shell público, shell admin y SEO
src/components/              navegación, galería, media, estudio, contacto
src/lib/                     Supabase, consultas, auth, validaciones y dominio
src/types/                   tipos compartidos
supabase/migrations/         esquema, índices, RLS y Storage policies
public/                      favicon y estáticos del sistema
```

Esta estructura es una propuesta inicial; no se deben crear todas las carpetas hasta que exista código que las necesite.

## Flujo de datos

1. El panel usa Supabase Auth para identificar al usuario.
2. Las consultas se filtran por la membresía del usuario y `business_id`.
3. RLS vuelve a aplicar esa separación en PostgreSQL; el frontend nunca es una frontera de seguridad.
4. Las imágenes y CVs se suben a Supabase Storage y las tablas guardan su path y metadatos.
5. El sitio público consulta sólo contenido publicado del negocio configurado y genera URLs limpias por idioma y slug.

## Idiomas

El MVP usará rutas explícitas `/es/` y `/en/`. Los campos visibles que necesiten traducción tendrán una estructura de traducción simple y acotada, inicialmente con valores `es` y `en`; no se incorporará un motor genérico de traducciones. Slugs y metadatos deben resolverse por idioma.

## Media y performance

El origen será Supabase Storage. El componente de media debe recibir dimensiones, texto alternativo, orden y prioridad de carga, y producir imágenes responsive con formatos modernos cuando estén disponibles. Las dimensiones explícitas evitarán layout shift; la carga diferida será el comportamiento por defecto fuera del primer viewport.

## Despliegue

Astro usa el adaptador `@astrojs/vercel`. La configuración actual ya integra Tailwind 4 mediante `@tailwindcss/vite` y produce un build estático compatible con Vercel. Supabase se conectará cuando exista la primera migración y el flujo de autenticación.
