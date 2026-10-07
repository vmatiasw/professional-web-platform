# Professional Web Platform

## Desarrollo

El proyecto es una única aplicación Astro con TypeScript, Tailwind CSS, Supabase y despliegue en Vercel. El sitio público debe priorizar HTML renderizado por Astro, imágenes optimizadas y JavaScript únicamente cuando sea necesario.

Comandos principales:

```sh
npm run dev
npm run check
npm run build
```

Para el servidor persistente de desarrollo usar `astro dev --background`; administrarlo con `astro dev stop`, `astro dev status` y `astro dev logs`.

## Criterios de producto

- El equipo de software controla templates, componentes y presentación.
- El cliente administra contenido estructurado, no diseña páginas libremente.
- Supabase/PostgreSQL es la fuente de verdad; los archivos viven en Supabase Storage.
- Todo dato de negocio debe quedar aislado por `business_id` mediante RLS.
- Mantener el MVP pequeño: no agregar page builder, backend separado, GraphQL, Prisma, Redis ni Docker sin una necesidad concreta.

## Organización esperada

- `src/pages/`: rutas públicas y administrativas.
- `src/components/`: componentes visuales reutilizables del template.
- `src/layouts/`: layouts y metadatos compartidos.
- `src/lib/`: clientes de Supabase, consultas y utilidades de dominio.
- `src/content/`: tipos, validaciones y datos estáticos del sistema cuando corresponda.
- `supabase/`: migraciones, políticas RLS y configuración de base de datos.
- `public/`: archivos estáticos pequeños; las imágenes y CVs de clientes van en Storage.

## Verificación

Antes de terminar un cambio importante ejecutar `npm run check` y `npm run build`. No guardar secretos en el repositorio. Las variables públicas de Supabase pueden exponerse al cliente, pero las políticas RLS deben impedir el acceso cruzado entre negocios.

## Documentación de referencia

- Producto: `docs/PRODUCT.md`
- Arquitectura: `docs/ARCHITECTURE.md`
- Base de datos: `docs/DATABASE.md`
- Próximos pasos: `docs/TODO.md`
- Guías oficiales de Astro: [docs.astro.build](https://docs.astro.build)
