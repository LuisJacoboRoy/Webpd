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

En **Edición rápida**, el botón **Generar copy y texto con Gemini** aplica esas instrucciones guardadas para crear `texto_imagen` y `copy_facebook`. También envía el día de campaña y los textos actuales de la publicación como contexto. Si modificas las instrucciones, guárdalas antes de generar; el resultado se coloca en el editor y debes pulsar **Guardar cambios** para persistirlo en la publicación.

## Generación de imágenes

El panel también permite generar una imagen desde una descripción usando la variable de servidor `keygoogleimg`. La ruta usa `gemini-3.1-flash-image` (Nano Banana 2) y envía la clave mediante el encabezado autenticado del servidor. No configures la clave con prefijo `VITE_`.

En Vercel, configura `keygoogleimg` exactamente con ese nombre y asigna la API key al proyecto de Google que tenga acceso y cuota para el modelo. Si el proyecto no tiene acceso o agota su cuota, el panel mostrará un error; guardar la variable puede requerir un nuevo deployment antes de que la función la reciba.

Después de generarse, la imagen se guarda automáticamente en el bucket privado de Supabase y su ruta, prompt y modelo quedan asociados a la publicación. Al volver a abrirla, el backend emite una URL firmada temporal para cargarla sin volver a llamar a Gemini. Cada nueva generación reemplaza la imagen de esa publicación y puede consumir cuota del proyecto. Las publicaciones aprobadas deben desaprobarse antes de reemplazar su imagen.

## Programación de publicaciones en Facebook

Las publicaciones aprobadas y validadas se programan automáticamente en la página mediante Meta Graph API. La hora se elige de forma estable por publicación entre las 20:00 y las 20:59, hora de Oaxaca (`America/Mexico_City`). La fecha es la fecha de publicación, no una fecha de expiración. Si una publicación queda pendiente o su fecha ya pasó, se conserva en la cola y se programa en el siguiente horario disponible.

En Vercel configura estas variables del lado del servidor; no uses el prefijo `VITE_`, no las pongas en el frontend y no compartas los valores por chat:

- `META_PAGE_ID`: identificador numérico de la página de Facebook. No es el identificador de la app `1693774445640453` ni el de Threads.
- `META_PAGE_ACCESS_TOKEN`: token de acceso de la página con permiso/tarea para crear contenido (`pages_manage_posts` / `CREATE_CONTENT`). Trátalo como una contraseña; rótalo si se expone.
- `META_GRAPH_API_VERSION`: una versión vigente habilitada para la app, con formato `vXX.0` (la documentación consultada muestra `v27.0`; confirma la versión activa en Meta antes de desplegar).
- `CRON_SECRET`: secreto aleatorio privado usado por Vercel Cron para autorizar el endpoint interno.

El App ID se usa en la configuración de Meta/OAuth para obtener y autorizar el token, pero no sustituye al Page ID ni al Page Access Token que necesita el backend. El ID de la app de Threads tampoco se usa para publicar en una página de Facebook. Meta puede exigir que la app tenga acceso aprobado y que la persona/token tenga la tarea de creación de contenido en la página.

Vercel ejecuta `/api/meta-scheduler` diariamente a la 1:00 UTC (19:00 en Oaxaca). Los posts con imagen generada se cargan a Meta como foto no publicada y se asocian al post programado. Si no hay imagen, se toma la primera URL de `copy_facebook` y Meta genera la vista previa Open Graph del enlace; si no hay imagen ni URL, se programa texto. La API Graph acepta una ventana de programación limitada; las fechas más lejanas permanecen en Supabase y el cron las programa al entrar en esa ventana. El identificador devuelto por Meta queda guardado en `fb_post_id` para no volver a enviar publicaciones ya programadas.

Antes de activar el cron en producción, configura las cuatro variables en Vercel y confirma en Meta que el token corresponde a la página correcta. Nunca guardes el token de página ni el secreto del cron en Git, variables `VITE_*`, ni código cliente.

## Alcance actual

Las instrucciones editoriales afectan la redacción de `texto_imagen` y `copy_facebook`. Aún no están implementados la mezcla 3/7 de publicaciones con enlace e imagen, la rotación aleatoria de productos, los borradores web/Stories ni la composición con el producto original.
