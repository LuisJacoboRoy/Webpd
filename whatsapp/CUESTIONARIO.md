# Cuestionario para evaluar la conexión

Responde solo con información general. **No incluyas contraseñas, API keys, secretos de apps, tokens OAuth, códigos de verificación, números de teléfono de clientes ni datos personales.** Los identificadores de negocio y cuenta también pueden omitirse hasta que se necesiten dentro del flujo autenticado.

## A. Cliente y objetivo

1. ¿Qué producto exacto llamas “Copilot”: Copilot Chat en VS Code, Copilot CLI u otro cliente? ¿Qué versión o canal utilizas?
2. ¿Quieres que el asistente de Copilot opere WhatsApp desde este chat, desde un agente del workspace, o solo buscas ayuda para configurar una integración en tu aplicación?
3. Meta no lista Copilot/VS Code como cliente compatible para este servidor. ¿Tu prioridad es investigar si existe soporte oficial para Copilot, o aceptarías usar temporalmente un cliente que sí aparece en la lista de Meta?
4. Si aceptarías otro cliente, ¿cuál tienes disponible o preferirías: Claude Code, Claude Desktop, ChatGPT, Codex CLI o app Codex?

## B. Cuenta y requisitos de Meta

5. ¿Puedes iniciar sesión en la cuenta de Meta que administra los recursos de WhatsApp? Responde sí/no; no compartas credenciales.
6. ¿Tienes acceso de administrador (`MANAGE`) al negocio y acceso de administrador a una app habilitada para WhatsApp que esté vinculada a ese negocio? Responde sí/no/no estoy seguro.
7. ¿Un administrador aceptó las condiciones de la API de la nube de WhatsApp Business para ese negocio? Responde sí/no/no estoy seguro.
8. ¿La cuenta y los recursos que quieres usar están en un entorno de prueba o de producción?
9. ¿Has visto el servidor MCP disponible en tu cuenta/cliente, o algún mensaje de error durante la conexión? Si hubo error, comparte solo el texto no sensible; elimina IDs, nombres privados, tokens y enlaces de autorización.

## C. Operaciones deseadas

10. ¿Qué necesitas hacer? Marca o enumera solo lo necesario:
    - Consultar negocios, cuentas o números disponibles.
    - Ver el estado de registro de un número.
    - Registrar un número.
    - Consultar, crear, editar o eliminar plantillas.
    - Configurar o suscribir webhooks.
    - Enviar mensajes.
    - Configurar pagos u otra operación.
11. ¿La primera etapa debería limitarse a lectura y diagnóstico? ¿Qué cambios requieren confirmación explícita antes de ejecutarse?
12. Si se enviarán mensajes, ¿qué controles humanos necesitas antes de cada envío (por ejemplo, aprobación del destinatario, plantilla, contenido y número remitente)?
13. ¿La configuración de webhooks ya existe? Si hay que evaluarla, ¿tienes un endpoint HTTPS propio y controlado? No compartas tokens de verificación ni secretos.

## D. Credenciales y límites de alcance

14. ¿Confirmas que no enviarás secretos por el chat y que completarías cualquier OAuth directamente en la interfaz del cliente compatible?
15. ¿Necesitas exclusivamente el MCP remoto de Meta, o estás considerando una integración directa con WhatsApp Cloud API dentro de la aplicación? Son enfoques distintos; una API key o token de la API directa no sustituye al OAuth del MCP.
16. ¿Qué repositorio o aplicación, si alguno, debería integrar una futura solución? La documentación actual no cambia la aplicación Webpd.

## Resultado de la evaluación

- Si el objetivo es usar este servidor directamente desde Copilot/VS Code, primero hay que confirmar soporte oficial del cliente: Meta no lo incluye actualmente en la lista publicada para este servidor.
- Si se elige un cliente compatible y Meta habilitó el servidor para la cuenta, el siguiente paso es conectar el endpoint y completar el OAuth dentro de ese cliente, no en el chat.
- Una vez conectado, verificar con una herramienta de lectura, como `whatsapp_biz_businesses`, antes de plantear operaciones que modifiquen recursos.
- Si se necesita una integración directa con Cloud API, definir ese proyecto por separado y acordar un mecanismo seguro de gestión de secretos antes de implementarlo.
