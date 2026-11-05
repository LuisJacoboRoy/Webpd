# Configuración editorial del panel

En `/admin`, el panel **Instrucciones de Gemini** permite guardar instrucciones editoriales adicionales. Se aplican a las próximas redacciones de texto y no pueden reemplazar las reglas fijas de formato y veracidad del servidor.

## Activación en Supabase

Ejecuta en Supabase SQL Editor, en este orden:

1. `supabase/migrations/20261104000000_admin_editorial_settings.sql` crea una tabla de configuración de una sola fila con RLS habilitado.
2. `supabase/migrations/20261104160000_generated_image_storage.sql` agrega los campos de imagen a `publicaciones` y crea el bucket privado `admin-generated-images`.

El acceso a ambas funciones queda del lado del backend mediante `STORAGE_SUPABASE_SERVICE_KEY`; el bucket no es público.

No vuelvas a ejecutar `20261103000000_admin_campaign.sql`: ya fue aplicada en el entorno existente. Se corrigió su fuente para quitar una consulta de diagnóstico que había quedado incrustada en un `INSERT`, pero no requiere una nueva ejecución en Supabase.

La consulta de comprobación se conservó aparte en `supabase/verification/admin_campaign.sql`; puedes ejecutarla como consulta de solo lectura después de la migración.

Después de desplegar los cambios y aplicar ambas migraciones, las instrucciones quedan guardadas entre sesiones y Gemini las carga al generar texto.

## Generación de imágenes

El panel también permite generar una imagen desde una descripción usando la variable de servidor `keygoogleimg`. La ruta usa `gemini-3.1-flash-image` (Nano Banana 2) y envía la clave mediante el encabezado autenticado del servidor. No configures la clave con prefijo `VITE_`.

En Vercel, configura `keygoogleimg` exactamente con ese nombre y asigna la API key al proyecto de Google que tenga acceso y cuota para el modelo. Si el proyecto no tiene acceso o agota su cuota, el panel mostrará un error; guardar la variable puede requerir un nuevo deployment antes de que la función la reciba.

Después de generarse, la imagen se guarda automáticamente en el bucket privado de Supabase y su ruta, prompt y modelo quedan asociados a la publicación. Al volver a abrirla, el backend emite una URL firmada temporal para cargarla sin volver a llamar a Gemini. Cada nueva generación reemplaza la imagen de esa publicación y puede consumir cuota del proyecto. Las publicaciones aprobadas deben desaprobarse antes de reemplazar su imagen.

## Alcance actual

Las instrucciones editoriales afectan la redacción de `texto_imagen` y `copy_facebook`. Aún no están implementados la mezcla 3/7 de publicaciones con enlace e imagen, la rotación aleatoria de productos, los borradores web/Stories, la composición con el producto original ni la publicación mediante Meta Graph API.
