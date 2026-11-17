# WhatsApp Business Tools MCP

Esta carpeta reúne los requisitos conocidos y las preguntas necesarias para evaluar el uso del MCP de WhatsApp Business con Copilot en VS Code.

## Compatibilidad conocida

La documentación de Meta consultada describe el servidor `WhatsApp Business Tools` en `https://mcp.facebook.com/whatsapp_business_tools`, con transporte HTTP transmitible y autenticación OAuth de Meta. Para este servidor, Meta enumera Claude Code, Claude Desktop, ChatGPT, Codex CLI y la app Codex como clientes compatibles. **No enumera Copilot ni VS Code**, así que no hay base documental para afirmar que Copilot pueda registrarse, completar OAuth o usar las herramientas de este servidor.

La guía general de Meta indica que cada servidor reconoce clientes específicos. Por lo tanto, añadir la URL a una configuración no garantiza la conexión: el servidor debe reconocer el cliente, y Meta está implementando el acceso gradualmente. No se debe intentar sortear el reconocimiento del cliente con credenciales o callbacks inventados.

## Qué haría falta si se usa un cliente compatible

1. Usar una versión actual de uno de los clientes enumerados por Meta.
2. Conectar el endpoint del servidor desde ese cliente e iniciar el flujo OAuth de Meta desde el propio cliente. Para este servidor, la página de Meta indica que no se requiere un identificador de cliente ni configurar una app de Meta o una URI de redirección.
3. Autorizar únicamente los negocios y recursos necesarios durante el consentimiento OAuth.
4. Contar con acceso de administrador al negocio (`MANAGE`) y a una app de Meta habilitada para WhatsApp y vinculada al negocio. Para enviar mensajes o registrar números, un administrador también debe haber aceptado las condiciones de la API de la nube de WhatsApp Business.
5. Comprobar la conexión primero con una herramienta de lectura, por ejemplo `whatsapp_biz_businesses`, y revisar los errores de autorización o permisos antes de intentar cambios.

La disponibilidad puede variar durante el despliegue beta. La lista de herramientas también puede cambiar.

## OAuth del MCP no es una API key

La autenticación documentada para este MCP es OAuth de Meta en el cliente compatible. **No compartas en este chat contraseñas, códigos de verificación, tokens OAuth, secretos de apps ni API keys.** No guardes esos valores en este repositorio.

Una integración directa distinta con WhatsApp Cloud API podría necesitar credenciales y configuración propias; no forma parte de este plan ni es requisito documentado para conectar este MCP. Si más adelante se evalúa esa integración, definir primero el almacenamiento seguro de secretos y el alcance antes de crear archivos o pedir credenciales.

## Acciones que pueden modificar recursos

El servidor puede enumerar negocios, cuentas y números, pero también ofrece herramientas que, según la documentación, pueden registrar números, crear/actualizar/eliminar plantillas, configurar webhooks, cambiar pagos o enviar mensajes. Empezar por consultas de lectura. Antes de cualquier operación que cambie recursos, confirmar el negocio, la cuenta, el número o destino y el cambio concreto. Para mensajes, Meta indica confirmar el destinatario antes del envío.

## Siguiente paso

Completa [CUESTIONARIO.md](./CUESTIONARIO.md) sin incluir secretos. Con las respuestas se podrá determinar si conviene buscar soporte oficial de Copilot/VS Code, utilizar uno de los clientes compatibles o posponer la conexión. Esta documentación no configura el MCP ni realiza el inicio de sesión.

## Fuentes oficiales

- [MCP de herramientas de WhatsApp Business](https://developers.facebook.com/documentation/mcp/whatsapp-business-tools-mcp)
- [Conectar un cliente de MCP a Meta](https://developers.facebook.com/documentation/mcp/connect-an-mcp-client)
