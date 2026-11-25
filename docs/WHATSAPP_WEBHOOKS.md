# WhatsApp Business Webhooks

## Arquitectura

`/api/webhooks/whatsapp` es una Vercel Function Node.js independiente. React, Vite, `dist`, el prerenderizado, el sitemap y la reescritura SPA general permanecen sin cambios. Vercel resuelve las funciones de `api/` antes de aplicar la reescritura al `index.html`. El endpoint anterior `/api/webhook` se conserva como alias, sin su token predeterminado ni el registro del cuerpo que tenía anteriormente.

La función verifica el callback GET de Meta y valida `X-Hub-Signature-256` con HMAC-SHA-256 sobre el cuerpo HTTP sin parsear. Normaliza mensajes, estados y otras notificaciones y los guarda del lado servidor usando el cliente Supabase compartido. El índice único `event_key` hace idempotentes los reintentos. Un fallo de persistencia responde con error HTTP para que Meta pueda reintentar.

La migración `supabase/migrations/20261123153000_whatsapp_webhook_events.sql` crea una tabla separada, habilita RLS y concede acceso solo a `service_role`; no cambia políticas ni tablas existentes. La clave de servicio es necesaria para que la función escriba aun cuando RLS esté habilitado y nunca se envía al navegador.

La integración del asistente combina el documento `docs/DIAMANTE_PINTURAS_LLM.md` con el historial individual almacenado en Supabase. El webhook registra mensajes entrantes, genera una respuesta mediante el proveedor configurado, envía texto por WhatsApp Cloud API y actualiza los estados de entrega.

## Archivos creados y modificados

- Nuevos: `api/webhooks/whatsapp.js`, pruebas `api/webhooks/whatsapp.test.js`, migración SQL y esta guía.
- Modificados: `api/webhook.js` (alias compatible), `server/supabase.js` (acepta credenciales explícitas), `.env.example` y el script `test:webhooks` de `package.json`.
- No se modificaron `vercel.json`, `vite.config.ts`, componentes, rutas SPA ni scripts SEO/build.

## Variables de entorno

Configura en Vercel, en los entornos que correspondan (Production y Preview). El recurso conectado con prefijo `SUPABASEW` proporciona `SUPABASEW_SUPABASE_URL`; conserva ese nombre:

- `WHATSAPP_VERIFY_TOKEN`: valor aleatorio privado que también ingresarás en la configuración del webhook de Meta.
- `META_APP_SECRET`: App Secret de la aplicación de Meta que firma los eventos.
- `WHATSAPP_ACCESS_TOKEN`: token privado de WhatsApp Cloud API usado exclusivamente por Vercel Functions.
- `WHATSAPP_PHONE_NUMBER_ID`: identificador del número de teléfono remitente configurado en Meta.
- `AI_API_KEY`: clave privada del proveedor compatible con la API de chat.
- `AI_MODEL`: modelo usado por el proveedor; por ejemplo, `gpt-4o-mini`.
- `AI_API_URL`: opcional. URL compatible con `POST /chat/completions`.
- `SUPABASEW_SUPABASE_URL`: URL provisionada por el recurso Supabase conectado a Vercel.
- `SUPABASEW_SUPABASE_SERVICE_ROLE_KEY`: agrega manualmente la clave `service_role`; el recurso no debe sustituirla por la clave publishable/anon. Es solo para servidor y necesaria para persistir la notificación con RLS habilitado.
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: nombres estándar alternativos.
- `STORAGE_SUPABASE_URL` y `STORAGE_SUPABASE_SERVICE_KEY`: nombres alternativos admitidos para el recurso de almacenamiento.

No uses prefijos `VITE_` para estas variables. Para desarrollo local, define valores locales en `.env.local` (ignorado por Git); no copies credenciales reales a `.env.example` ni las compartas. Si hay más de un nombre configurado, el webhook conserva esta prioridad: `SUPABASEW_*`, luego los nombres estándar `SUPABASE_*` y finalmente `STORAGE_SUPABASE_*`. La función recibe las credenciales de Supabase explícitamente y no depende de variables heredadas de otros endpoints.

## Supabase

Aplica la migración desde Supabase CLI o ejecuta el SQL de la migración en el SQL Editor. La tabla guarda el ID del mensaje, número del remitente y de WhatsApp, ID del número de teléfono de Meta, tipo y contenido disponible, fecha de Meta, estado, payload y fecha de recepción. Para mensajes multimedia se conserva la información disponible en el webhook (por ejemplo, ID del medio, tipo MIME y caption), no el archivo multimedia en sí. Los estados de mensaje tienen filas separadas del mismo ID de mensaje.

Aplica también `supabase/migrations/20261124190000_whatsapp_assistant.sql`. Crea `whatsapp_conversations` y `whatsapp_messages`, con RLS activado y acceso administrativo solo para `service_role`. La automatización puede pausarse cambiando `automated_status` a `human` para el número correspondiente y reactivarse con `automated`.

Ejemplo para consultar el historial de un remitente:

```sql
SELECT message_id, event_type, sender_number, whatsapp_number, message_type,
       content, meta_timestamp, message_state, received_at
FROM public.whatsapp_webhook_events
WHERE sender_number = '15551234567'
ORDER BY meta_timestamp DESC NULLS LAST, received_at DESC;
```

Los duplicados exactos se ignoran por `event_key`; un mensaje y sus cambios de estado son eventos distintos. Los eventos genéricos que no contienen mensajes/estados también quedan almacenados con el payload original.

## Pruebas locales

1. Define las cuatro variables privadas indicadas arriba en `.env.local`.
2. Ejecuta las pruebas unitarias: `npm run test:webhooks`.
3. Para ejercitar la ruta real de Vercel localmente, usa Vercel CLI y ejecuta `vercel dev` desde la raíz. El endpoint de desarrollo es `http://localhost:3000/api/webhooks/whatsapp`; `vite` por sí solo no ejecuta Vercel Functions.
4. Verifica GET con token válido (debe devolver el challenge), GET inválido (403) y POST firmado. Las pruebas automáticas cubren además mensajes de texto y multimedia, los estados `sent`, `delivered`, `read` y `failed`, firma inválida, duplicados y fallo de persistencia.

Para una prueba manual POST, calcula `X-Hub-Signature-256` como `sha256=` seguido del HMAC hexadecimal de los bytes exactos del archivo JSON, usando `META_APP_SECRET`; no reformatees el JSON después de firmarlo. No registres el secreto en comandos o logs compartidos.

## Despliegue y configuración de Meta

1. Aplica la migración y configura las variables en Vercel.
2. Despliega normalmente con el comando de build existente; no es necesario cambiar el framework ni la salida `dist`.
3. Confirma la función desplegada con un GET de verificación y un POST de prueba generado desde Meta. En un POST correcto la respuesta es HTTP 200 con `EVENT_RECEIVED`; si falla almacenamiento, responde HTTP 503 para permitir reintentos.
4. En Meta for Developers, abre la aplicación vinculada a WhatsApp, agrega/configura el producto WhatsApp y su sección **Webhooks**. Ingresa el callback y el mismo valor privado de `WHATSAPP_VERIFY_TOKEN`; Meta debe completar la verificación GET.
5. Suscribe el objeto de cuenta de WhatsApp Business (`whatsapp_business_account`) al campo `messages`. La suscripción se realiza en Meta y debe corresponder a la cuenta/activos vinculados a la aplicación.
6. Envía un mensaje de prueba y revisa que aparezcan el mensaje y los estados en Supabase.

### Callback de producción

`https://pinturasdiamante.com/api/webhooks/whatsapp`

Si el dominio de producción configurado en Vercel es distinto, usa el dominio canónico de ese proyecto en lugar del anterior.

## Diagnóstico

- **403 en GET:** verifica `hub.mode=subscribe` y que el valor ingresado en Meta coincida con `WHATSAPP_VERIFY_TOKEN`.
- **401 en POST:** comprueba que `META_APP_SECRET` corresponda a esa app; no uses un payload re-serializado para comparar firmas.
- **503 en POST:** revisa las cuatro variables privadas, la migración, permisos de `service_role` y conectividad de Supabase.
- **400 en POST:** el cuerpo firmado no es JSON válido o no cumple la estructura esperada.
- Revisa los logs de la Vercel Function en **Project → Deployments → Functions/Logs**. La función no imprime el token, firma ni payload recibido.
- Ejecuta `npm run test:webhooks` y `npm run build` para reproducir la validación disponible en el repositorio.
