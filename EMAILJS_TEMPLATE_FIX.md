# 🚨 Solución Error 422: "The recipients address is empty"

## Problema
EmailJS no está recibiendo la dirección de correo dinámicamente. Error status **422**.

---

## ✅ SOLUCIÓN - Configurar correctamente la plantilla en EmailJS

### Paso 1: Accede al Panel de EmailJS
1. Ve a: https://dashboard.emailjs.com
2. Inicia sesión
3. Selecciona tu proyecto

### Paso 2: Editar la Plantilla (CRÍTICO)
1. En el menú izquierdo, haz clic en **"Email Templates"**
2. Busca **`template_2l07s2f`**
3. Haz clic en el botón de **"Edit"** (lápiz)

### Paso 3: Verificar el Campo "To Email" ⚠️

**Este es el campo MÁS IMPORTANTE**

Busca la sección **"Email Settings"** o **"To Email"** (a menudo está al lado del botón "Edit")

#### ❌ INCORRECTO:
```
vacio (blank)
admin@ejemplo.com (email fijo)
{{to_email}} {{customer_email}} (dos variables)
{to_email} (una sola llave)
```

#### ✅ CORRECTO:
```
{{to_email}}
```

**EXACTAMENTE esto, con dobles llaves `{{` y `}}`**

---

## Paso 4: Verificar el Contenido HTML del Template

En el área donde editas el contenido del email, asegúrate de que uses estas variables:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Confirmación de Pedido</title>
</head>
<body style="font-family: Arial, sans-serif;">
    <h2>¡Hola {{customer_name}}!</h2>
    
    <p>Hemos recibido tu pedido. Aquí están los detalles:</p>
    
    <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
        <p><strong>Email:</strong> {{to_email}}</p>
        <p><strong>Teléfono:</strong> {{customer_phone}}</p>
        <p><strong>Dirección:</strong> {{customer_address}}</p>
        <p><strong>Comentarios:</strong> {{additional_comments}}</p>
        
        <hr>
        
        <p><strong>Artículos del Carrito:</strong></p>
        <p>{{cart_items}}</p>
        <p><strong>Total:</strong> ${{cart_total}} MXN</p>
        <p><strong>Fecha del Pedido:</strong> {{order_date}}</p>
    </div>
    
    <p>Gracias por tu compra en Pinturas Diamante Oaxaca.</p>
</body>
</html>
```

---

## ⚠️ IMPORTANTE: Pasos Finales

### Paso 5: Guardar la Plantilla
1. Haz clic en **"Save"** o **"Update"**
2. Deberías ver un mensaje: ✅ "Template saved successfully"

### Paso 6: Verificar el Service
1. En el menú izquierdo, ve a **"Email Services"**
2. Selecciona tu servicio (Gmail, Outlook, etc.)
3. Confirma que esté **conectado** y **activo** ✅

### Paso 7: Probar
1. Ve a tu sitio: https://pinturasdiamante.com
2. Completa el formulario con:
   - Nombre: `Juan Pérez`
   - Correo: `tu-email@ejemplo.com`
   - Dirección: `Calle Principal 123`
   - Teléfono: `+34 600 123 456`
3. Haz clic en **"Enviar Pedido"**
4. Abre DevTools (F12) → Console

---

## 🧪 Qué Ver en la Consola del Navegador (F12)

### Si funciona correctamente:
```
📧 Parámetros finales a enviar: {
  to_email: "tu-email@ejemplo.com",
  customer_name: "Juan Pérez",
  ...
}
✅ EmailJS.init() completado. Enviando correo...
✅ Respuesta de EmailJS: {
  status: 200,
  text: "OK"
}
🎉 Correo enviado a: tu-email@ejemplo.com
```

### Si sigue fallando:
```
❌ Error procesando pedido: {
  mensaje: "422 status",
  status: 422,
  ...
}
```

**Si ves status 422:** El campo "To Email" en la plantilla NO está configurado como `{{to_email}}`

---

## 🔍 Checklist de Verificación

- [ ] Accedí a https://dashboard.emailjs.com
- [ ] Abrí la plantilla `template_2l07s2f`
- [ ] Verificué que el campo **"To Email"** = `{{to_email}}`
- [ ] El campo "To Email" NO tiene un email fijo
- [ ] El campo "To Email" NO está vacío
- [ ] Guardé los cambios ✅
- [ ] El Email Service está conectado y activo
- [ ] Probé el formulario
- [ ] Abrí F12 → Console para ver los logs
- [ ] Vi el mensaje "status: 200" ✅

---

## 📞 Si persiste...

1. **Toma una captura del campo "To Email"** en EmailJS
2. **Copia TODOS los logs** de la consola (F12)
3. **Comparte ambas cosas** para investigar más

---

## Credenciales del Formulario

Para referencia:
- **Service ID:** `service_w4hr6r7`
- **Template ID:** `template_2l07s2f`
- **Public Key:** `kGZA8SmhiaWwbM2Iq`
- **To Email field:** DEBE ser `{{to_email}}`

**Última actualización:** 31/3/2026
