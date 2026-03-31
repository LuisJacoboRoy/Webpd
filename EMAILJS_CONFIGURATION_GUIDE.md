# 📧 Guía de Configuración de EmailJS

## Problema Actual
Error: **"The recipients address is empty"** (Status 422)

Esto significa que EmailJS no está recibiendo la dirección de correo del destinatario correctamente.

---

## ✅ Solución Paso a Paso

### 1. **Acceder al Panel de EmailJS**
1. Ve a [emailjs.com](https://emailjs.com)
2. Inicia sesión con tus credenciales
3. Selecciona tu proyecto (Pinturas Diamante)

### 2. **Editar la Plantilla**
1. En el menú lateral, ve a **"Email Templates"**
2. Busca la plantilla **`template_2l07s2f`**
3. Haz clic en **"Edit"** (Editar)

### 3. **Configurar el Campo "Send To"** ⚠️ CRÍTICO
1. Ubica el campo **"Send To"** en la plantilla
2. **REEMPLAZA** lo que esté allí con exactamente esto:
   ```
   {{to_email}}
   ```
   (Incluye las dobles llaves `{{` y `}}`)

3. **NO pongas** una dirección de correo fija ni dejes vacío

### 4. **Verificar los Campos de la Plantilla**
Asegúrate de que tu plantilla use estas variables:

```html
<p><strong>Nombre:</strong> {{customer_name}}</p>
<p><strong>Email:</strong> {{customer_email}}</p>
<p><strong>Teléfono:</strong> {{customer_phone}}</p>
<p><strong>Dirección:</strong> {{customer_address}}</p>
<p><strong>Comentarios:</strong> {{additional_comments}}</p>
<p><strong>Artículos:</strong> {{cart_items}}</p>
<p><strong>Total:</strong> {{cart_total}} MXN</p>
<p><strong>Fecha:</strong> {{order_date}}</p>
```

### 5. **Guardar los Cambios**
1. Haz clic en **"Save"** (Guardar)
2. Deberías ver un mensaje de confirmación

---

## 🧪 Prueba del Formulario

Después de guardar:

1. Ve a tu sitio web: https://pinturasdiamante.com
2. Rellena el formulario "Enviar Pedido por Correo" con:
   - **Nombre:** Juan Pérez
   - **Correo:** tu-email@ejemplo.com
   - **Dirección:** Calle Principal 123
   - **Teléfono:** +34 600 123 456
   - **Comentarios:** Prueba del sistema

3. Haz clic en **"Enviar Pedido"**

### ✅ Resultado Esperado
- Deberías recibir un correo en `tu-email@ejemplo.com`
- El mensaje debe contener toda la información del formulario
- En el panel de EmailJS, el evento debe mostrar **Status: 200** (éxito)

---

## ❌ Si sigue sin funcionar

### Verificar en la consola del navegador (F12)
Busca los logs que dirán:
```
📧 Enviando parámetros: { to_email: "...", customer_name: "...", ... }
✅ Respuesta de EmailJS: { status: 200, ... }
```

### Validar credenciales
En el archivo [components/CheckoutCorreo.jsx](components/CheckoutCorreo.jsx), línea 67-71, verifica que sean correctas:
- **Service ID:** `service_w4hr6r7`
- **Template ID:** `template_2l07s2f`
- **Public Key:** `kGZA8SmhiaWwbM2Iq`

Si no coinciden, actualiza con tus credenciales reales.

### Revisar el servicio de Email
1. En EmailJS, ve a **"Email Services"**
2. Verifica que tu servicio SMTP esté:
   - ✅ Conectado correctamente
   - ✅ Activo (no deshabilitado)
   - ✅ Con credenciales válidas

---

## 📋 Checklist Final

- [ ] Campo "Send To" = `{{to_email}}`
- [ ] Plantilla usa todas las variables necesarias
- [ ] Email Service está conectado y activo
- [ ] Service ID, Template ID y Public Key son correctos
- [ ] Probé el formulario y recibí el email
- [ ] Email contiene toda la información del formulario

---

## 📞 Contacto / Soporte
Si persiste el problema:
1. Revisa los **Event Logs** en el panel de EmailJS
2. Verifica el **Response** exacto del error
3. Compara con esta guía punto por punto

**Última actualización:** 31/3/2026
