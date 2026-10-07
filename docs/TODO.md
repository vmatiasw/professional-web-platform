# Próximos pasos

## Hecho

- Migración inicial con tablas de contenido, media, personas y membresías.
- RLS para lectura pública limitada y escritura aislada por business.
- Buckets de imágenes, videos y documentos con policies de Storage.
- Clientes Supabase server/browser, tipos TypeScript y middleware de sesión.
- `/login`, `/admin`, logout y sitio público funcional `/es/` y `/en/`.
- CRUD de entries, imágenes, people, settings, business activo y traducción inglesa.
- Business de prueba creado en Supabase y migraciones aplicadas y lintadas remotamente.

## Próximo

- Crear el primer usuario Auth y asociarlo como owner siguiendo `docs/DATABASE.md`.
- Verificar login, upload y aislamiento con dos usuarios reales.
- Mejorar manejo de errores de formularios y validación de archivos.

## Próximo: sitio público

- Definir el shell bilingüe y las rutas `/es/` y `/en/`.
- Implementar SEO compartido: title, description, canonical, Open Graph, Twitter/X, sitemap y robots.
- Crear el template Visual Portfolio y sus componentes de navegación, galería, media, estudio y contacto.
- Implementar imágenes responsive con dimensiones explícitas, lazy loading y formatos optimizados.
- Validar la experiencia con mobile, teclado, lector de pantalla y contenido sin JavaScript.

## Próximo: panel

- Mejorar manejo de errores y validación de archivos del panel.
- Verificar upload, publicación y asociación de media con un usuario owner real.
- Añadir previews del sitio sin convertir el panel en un editor visual libre.

## Futuro

- Diseño final de Viola-Di Benedetto y template Visual Portfolio.
- Procesamiento avanzado de imágenes, videos y previews.
- Recuperación de contraseña, invitaciones y permisos avanzados.
- Analytics, integraciones externas, billing y otros templates.
