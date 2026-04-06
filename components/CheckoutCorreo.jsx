'use client';

import { useRef, useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';

// ✅ Inicializar EmailJS al cargar el módulo (ÚNICA VEZ)
if (typeof window !== 'undefined') {
  emailjs.init({
    publicKey: 'kGZA8SmhiaWwbM2Iq',
    limitRate: {
      id: 'app',
      throttle: 50, // límite: 1 email cada 50ms
    },
  });
}

/**
 * ⚠️ CONFIGURACIÓN CRÍTICA DE EMAILJS ⚠️
 * 
 * PLANTILLA: Order Confirmation (template_x1or3zu)
 * USANDO: emailjs.sendForm() (método recomendado para formularios)
 * SERVICE ID: service_w4hr6r7
 * TEMPLATE ID: template_x1or3zu ← Order Confirmation
 * PUBLIC KEY: kGZA8SmhiaWwbM2Iq
 * 
 * CAMPOS ESPERADOS POR LA PLANTILLA (name attributes - CRÍTICOS):
 * - email → correo del cliente (REQUERIDO para "To Email" → {{email}})
 * - name → nombre del cliente ({{name}})
 * - phone → teléfono ({{phone}})
 * - address → dirección ({{address}})
 * - message → comentarios ({{#message}}...{{/message}})
 * - order_date → fecha del pedido ({{order_date}})
 * - order_time → hora del pedido ({{order_time}}) ← NUEVO
 * - order_items → artículos desglosados como texto simple
 * - total_price → precio total (muestra "-" si es 0)
 * 
 * ⚠️ IMPORTANTE:
 * - NO cambiar los nombres de los campos sin actualizar la plantilla en EmailJS
 * - El campo email DEBE estar en "To Email" como {{email}} en el dashboard
 * - readOnly en inputs para evitar que se excluyan de FormData
 * - VALIDACIÓN: email requerido (si está vacío, error 422)
 * - order_time se calcula automáticamente en sendEmail
 * 
 * HISTORIAL DE FIXES:
 * [1] Error 422 "recipients address empty" → Cambiar disabled por readOnly
 * [2] Mejora: Desglose con imágenes y colores
 * [3] Mejora: Agregada hora del pedido (order_time)
 */

// Componente CheckoutCorreo
export default function CheckoutCorreo({ cartItems = [], cartTotal = 0, onSuccess }) {
  const form = useRef();
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState({ text: '', isSuccess: false });

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setMessage({ text: '', isSuccess: false });

    try {
      // Validar que el formulario tenga datos
      const formData = new FormData(form.current);
      const name = formData.get('name')?.trim();
      const email = formData.get('email')?.trim();

      console.log('📋 Datos del formulario:', {
        name,
        email,
        order_date: formData.get('order_date'),
        total_price: formData.get('total_price'),
        items_count: cartItems.length
      });

      if (!name || !email) {
        setMessage({
          text: '❌ Por favor completa el nombre y correo electrónico.',
          isSuccess: false
        });
        setIsPending(false);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
      if (!emailRegex.test(email)) {
        setMessage({
          text: '❌ Por favor ingresa un correo electrónico válido.',
          isSuccess: false
        });
        setIsPending(false);
        return;
      }

      // ✅ GENERAR DESGLOSE COMPLETO DE ITEMS CON IMÁGENES Y COLORES
      const itemsDesglose = cartItems.length > 0 
        ? cartItems.map((item, idx) => {
            const colorInfo = item.color ? item.color : 'N/A';
            const priceDisplay = item.price && item.price > 0 ? `$${item.price}` : '-';
            return {
              numero: idx + 1,
              nombre: item.name,
              cantidad: item.quantity,
              color: colorInfo,
              precio: priceDisplay,
              imagen: item.image || 'Sin imagen',
              sku: item.id,
              texto: `${idx + 1}. ${item.name} (Cant: ${item.quantity}${colorInfo !== 'N/A' ? ', Color: ' + colorInfo : ''}) - ${priceDisplay}`
            };
          })
        : [];

      // Formato texto simple para email (fallback)
      const itemsTexto = itemsDesglose.length > 0
        ? itemsDesglose.map(it => it.texto).join('\n')
        : 'Sin productos';

      // Obtener hora actual
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const orderTime = `${hours}:${minutes}`;

      // Obtener fecha en formato español
      const orderDate = new Date().toLocaleDateString('es-ES');

      console.log('✅ Validación pasada');
      console.log('📦 Items a enviar:', itemsDesglose);
      console.log('⏰ Hora del pedido:', orderTime);
      console.log('📧 Enviando email con EmailJS.send()...');

      // ✅ PREPARAR OBJETO CON TODA LA ESTRUCTURA PARA LA PLANTILLA
      // Usar emailjs.send() para poder enviar objetos complejos (no solo strings)
      const templateParams = {
        email: email,                    // Para "To Email" en EmailJS
        name: name,
        phone: formData.get('phone')?.trim() || 'No proporcionado',
        address: formData.get('address')?.trim() || 'No proporcionado',
        message: formData.get('message')?.trim() || '',
        order_date: orderDate,
        order_time: orderTime,
        total_price: cartTotal && cartTotal > 0 ? `$${cartTotal}` : '-',
        order_items: itemsTexto,        // Para texto simple en plantilla
        // ✅ ITEMS COMO ARRAY PARA LOOPS EN LA PLANTILLA
        items: itemsDesglose.map(it => ({
          quantity: it.cantidad,
          name: it.nombre,
          color: it.color,
          price: it.precio,
          image: it.imagen,
          sku: it.sku
        }))
      };

      // Enviar con emailjs.send() para mejor control de datos
      const response = await emailjs.send(
        'service_w4hr6r7',          // Service ID
        'template_x1or3zu',         // Template ID
        templateParams,             // Objeto con datos estructurados
        {
          publicKey: 'kGZA8SmhiaWwbM2Iq'  // Especificar public key explícitamente
        }
      );

      console.log('✅ Email enviado exitosamente:', response);

      setMessage({
        text: '✅ ¡Pedido enviado correctamente! Recibirás confirmación en tu correo.',
        isSuccess: true
      });

      // Resetear formulario
      form.current.reset();

      // Llamar callback onSuccess después de 1.5 segundos
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        status: error.status,
        text: error.text
      });

      let errorMsg = '❌ Error al enviar el pedido. Intenta nuevamente más tarde.';

      if (error.message?.includes('recipients')) {
        errorMsg = '❌ Error: El correo no puede estar vacío. Verifica el campo de email.';
      } else if (error.status === 422) {
        errorMsg = '❌ Error 422: El correo está vacío. Por favor, rellena el campo de email.';
      } else if (error.message?.includes('service')) {
        errorMsg = '❌ Error: Service ID o Template ID inválidos.';
      }

      setMessage({
        text: errorMsg,
        isSuccess: false
      });

    } finally {
      setIsPending(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      color: '#333',
      textAlign: 'center'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.95rem',
      fontWeight: '500',
      color: '#444',
      marginBottom: '0.25rem'
    },
    input: {
      padding: '0.75rem',
      fontSize: '1rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontFamily: 'inherit',
      transition: 'border-color 0.3s ease',
      cursor: isPending ? 'not-allowed' : 'text',
      opacity: isPending ? 0.7 : 1,
      backgroundColor: isPending ? '#f5f5f5' : '#fff'
    },
    textarea: {
      padding: '0.75rem',
      fontSize: '1rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontFamily: 'inherit',
      minHeight: '100px',
      resize: 'vertical',
      transition: 'border-color 0.3s ease',
      cursor: isPending ? 'not-allowed' : 'text',
      opacity: isPending ? 0.7 : 1,
      backgroundColor: isPending ? '#f5f5f5' : '#fff'
    },
    required: {
      color: '#d32f2f'
    },
    button: {
      padding: '0.875rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      color: '#fff',
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: '4px',
      cursor: isPending ? 'not-allowed' : 'pointer',
      opacity: isPending ? 0.7 : 1,
      transition: 'background-color 0.3s ease',
      marginTop: '1rem'
    },
    message: {
      padding: '1rem',
      borderRadius: '4px',
      marginTop: '1.5rem',
      fontSize: '0.95rem',
      fontWeight: '500',
      animation: 'slideIn 0.3s ease-out'
    },
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    loadingText: {
      fontSize: '0.9rem',
      color: '#666',
      textAlign: 'center',
      marginTop: '0.5rem'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Enviar Pedido por Correo</h1>

      <form ref={form} id="contact-form" onSubmit={sendEmail} style={styles.form}>
        {/* Campo oculto con la fecha del pedido */}
        <input type="hidden" name="order_date" value={new Date().toLocaleDateString('es-ES')} />

        {/* Campo oculto con la hora del pedido (se actualiza en sendEmail) */}
        <input type="hidden" name="order_time" value="--:--" />

        {/* Campo oculto con los items del pedido (se actualiza en sendEmail) */}
        <input type="hidden" name="order_items" value="Procesando items..." />

        {/* Campo oculto con el total del pedido - Muestra "-" si es 0 */}
        <input 
          type="hidden" 
          name="total_price" 
          value={cartTotal && cartTotal > 0 ? `$${cartTotal}` : '-'} 
        />

        {/* 
          ⚠️ CAMPOS CRÍTICOS - NO CAMBIAR SIN ACTUALIZAR PLANTILLA EMAILJS
          Los nombres (name) de estos campos deben coincidir exactamente con
          las variables en la plantilla de EmailJS (template_x1or3zu)
          https://dashboard.emailjs.com/admin/templates/template_x1or3zu
        */}

        {/* Campo para el nombre del cliente - {{name}} en plantilla */}
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>
            Nombre Completo <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Escriba su nombre"
            required
            readOnly={isPending}
            autoComplete="name"
            style={styles.input}
          />
        </div>

        {/* 
          ⚠️ CRÍTICO: Campo email - Debe estar en "To Email" como {{email}}
          Si cambia el nombre, actualizar en EmailJS dashboard
        */}
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>
            Correo Electrónico <span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="tu.email@electronico.com"
            required
            readOnly={isPending}
            autoComplete="email"
            style={styles.input}
          />
        </div>

        {/* Campos opcionales - Se envían a la plantilla si se rellenan */}
        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.label}>
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Numero de contacto"
            readOnly={isPending}
            autoComplete="tel"
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="address" style={styles.label}>
            Dirección de Envío
          </label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Calle 123, colonia, Ciudad"
            readOnly={isPending}
            autoComplete="street-address"
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="message" style={styles.label}>
            Comentarios Adicionales
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Agrega cualquier nota especial para tu pedido..."
            readOnly={isPending}
            autoComplete="off"
            style={styles.textarea}
          />
        </div>

        {/* 
          Botón de envío
          IMPORTANTE: type="submit" dispara onSubmit del formulario
          NO cambiar a onClick, mantener onSubmit para consistencia
        */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            ...styles.button,
            opacity: isPending ? 0.6 : 1,
            cursor: isPending ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isPending) e.target.style.backgroundColor = '#0056b3';
          }}
          onMouseLeave={(e) => {
            if (!isPending) e.target.style.backgroundColor = '#007bff';
          }}
        >
          {isPending ? '⏳ Enviando pedido...' : '📤 Enviar Pedido'}
        </button>

        {/* Indicador de carga */}
        {isPending && (
          <div style={styles.loadingText}>
            Procesando tu pedido, por favor espera...
          </div>
        )}
      </form>

      {/* Mensaje de éxito o error */}
      {message.text && (
        <div
          style={{
            ...styles.message,
            ...(message.isSuccess ? styles.successMessage : styles.errorMessage)
          }}
        >
          {message.text}
        </div>
      )}

      {/* Estilos globales para la animación */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
        }

        input:disabled,
        textarea:disabled {
          background-color: #f5f5f5;
          color: #666;
        }
      `}</style>
    </div>
  );
}
