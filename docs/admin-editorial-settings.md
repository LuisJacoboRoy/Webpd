# Configuración editorial del panel

En `/admin`, el panel **Instrucciones de Gemini** permite guardar instrucciones editoriales adicionales. Se aplican a las próximas redacciones de texto y no pueden reemplazar las reglas fijas de formato y veracidad del servidor.

## Activación en Supabase

Ejecuta el contenido de `supabase/migrations/20261104000000_admin_editorial_settings.sql` en Supabase SQL Editor. Esta migración crea una tabla de una sola fila con RLS habilitado; el acceso se limita al backend mediante `STORAGE_SUPABASE_SERVICE_KEY`.

No vuelvas a ejecutar `20261103000000_admin_campaign.sql`: ya fue aplicada en el entorno existente. Se corrigió su fuente para quitar una consulta de diagnóstico que había quedado incrustada en un `INSERT`, pero no requiere una nueva ejecución en Supabase.

La consulta de comprobación se conservó aparte en `supabase/verification/admin_campaign.sql`; puedes ejecutarla como consulta de solo lectura después de la migración.

Después de desplegar los cambios y aplicar la migración nueva, las instrucciones quedan guardadas entre sesiones y Gemini las carga al generar texto.

## Generación de imágenes

El panel también permite generar una imagen desde una descripción usando la variable de servidor `keygoogleimg`. La ruta usa `gemini-3.1-flash-image` (Nano Banana 2) y envía la clave mediante el encabezado autenticado del servidor. No configures la clave con prefijo `VITE_`.

En Vercel, configura `keygoogleimg` exactamente con ese nombre y asigna la API key al proyecto de Google que tenga acceso y cuota para el modelo. Si el proyecto no tiene acceso o agota su cuota, el panel mostrará un error; guardar la variable puede requerir un nuevo deployment antes de que la función la reciba.

La imagen se devuelve para previsualizar y descargar, pero esta primera integración no la guarda en Supabase ni la compone con un PNG de producto. Cada generación puede consumir cuota del proyecto, así que genera solo cuando lo necesites.

## Alcance actual

Las instrucciones editoriales afectan la redacción de `texto_imagen` y `copy_facebook`. Aún no están implementados la mezcla 3/7 de publicaciones con enlace e imagen, la rotación aleatoria de productos, los borradores web/Stories, el guardado permanente de imágenes, la composición con el producto original ni la publicación mediante Meta Graph API.
