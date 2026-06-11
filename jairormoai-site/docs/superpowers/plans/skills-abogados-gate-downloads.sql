-- Gatear descargas de skills de abogados: los .md ya NO viven en /public,
-- ahora se sirven desde /api/skills/legal/[file] (requiere usuario logueado).
-- Ejecutar en Supabase SQL Editor.

update projects set download_url = '/api/skills/legal/01-plazos-procesales.md'
where category = 'legal' and download_url = '/skills/legal/01-plazos-procesales.md';

update projects set download_url = '/api/skills/legal/02-escritos-procesales.md'
where category = 'legal' and download_url = '/skills/legal/02-escritos-procesales.md';

update projects set download_url = '/api/skills/legal/03-notificaciones-actuaciones.md'
where category = 'legal' and download_url = '/skills/legal/03-notificaciones-actuaciones.md';
