'use client';

import { useActionState, useRef, useEffect } from 'react';
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
 * USANDO: emailjs.sendForm() (método recomendado para formularios)
 * SERVICE ID: service_w4hr6r7
 * TEMPLATE ID: template_x1or3zu
 * PUBLIC KEY: kGZA8SmhiaWwbM2Iq
 * 
 * CAMPOS ESPERADOS EN LA PLANTILLA (case-sensitive):
 * - to_email → correo del cliente (REQUERIDO para "To Email")
 * - from_name → nombre del cliente
 * - from_email → email del cliente
 * - phone → teléfono del cliente
 * - address → dirección de envío
 * - message → comentarios adicionales
 * - cart_items → artículos del carrito
 * - cart_total → total del carrito
 * - order_date → fecha del pedido
 * 
 * IMPORTANTE EN EMAILJS DASHBOARD:
 * El campo "To Email" DEBE estar configurado exactamente como: {{to_email}}
 * (con dobles llaves y ese nombre exacto)
 */

// Función de acción para procesar el formulario de pedido por correo
async function procesarPedidoPorCorreo(prevState, formData) {
  try {
    // Extraer datos del FormData
    let nombre = formData.get('from_name');
    let correo = formData.get('to_email');
    let direccion = formData.get('address');
    let telefono = formData.get('phone');
    let comentarios = formData.get('message') || 'Sin comentarios adicionales';

    // ✅ LIMPIEZA AGRESIVA
    nombre = nombre?.trim().replace(/\s+/g, ' ') || '';
    correo = correo?.trim().toLowerCase().replace(/\s/g, '') || '';
    direccion = direccion?.trim().replace(/\s+/g, ' ') || '';
    telefono = telefono?.trim().replace(/\s/g, '') || '';
    comentarios = comentarios?.trim().replace(/\s+/g, ' ') || 'Sin comentarios adicionales';

    // Validación básica
    if (!nombre || !correo || !direccion || !telefono) {
      console.warn('❌ Validación fallida - Campos vacíos:', {
        nombre: !nombre,
        correo: !correo,
        direccion: !direccion,
        telefono: !telefono
      });
      return {
        exito: false,
        mensaje: 'Por favor completa todos los campos requeridos.'
      };
    }

    // Validar formato de email
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(correo)) {
      console.warn('❌ Formato de email inválido:', correo);
      return {
        exito: false,
        mensaje: 'Por favor ingresa un correo electrónico válido.'
      };
    }

    // Obtener los items del carrito desde el formulario
    let cartItemsText = formData.get('cart_items') || 'Sin productos';
    let cartTotal = formData.get('cart_total') || '0';

    // Objeto del carrito
    const carrito = {
      items: cartItemsText,
      total: cartTotal,
      fecha: new Date().toLocaleDateString('es-ES')
    };

    // ✅ Parámetros que se enviarán a EmailJS
    const templateParams = {
      to_email: correo,              // ← CRÍTICO: variable para "Send To"
      from_name: nombre,             // ← nombre del cliente
      from_email: correo,            // ← email del cliente
      phone: telefono,               // ← teléfono
      address: direccion,            // ← dirección
      message: comentarios,          // ← comentarios
      cart_items: carrito.items,
      cart_total: carrito.total,
      order_date: carrito.fecha
    };

    console.log('📧 ENVIANDO PARÁMETROS A EMAILJS:', templateParams);

    // ✅ Validación final
    if (!templateParams.to_email || templateParams.to_email.length === 0) {
      console.error('🚨 ERROR CRÍTICO: to_email está vacío');
      return {
        exito: false,
        mensaje: 'Error: El correo electrónico no pudo procesarse.'
      };
    }

    // ✅ ENVIAR CON emailjs.send() (parámetros)
    console.log('🚀 Llamando emailjs.send()...');
    
    const response = await emailjs.send(
      'service_w4hr6r7',          // Service ID
      'template_x1or3zu',         // Template ID actualizado
      templateParams              // Parámetros
    );

    console.log('✅ Respuesta de EmailJS:', {
      status: response.status,
      text: response.text
    });

    if (response.status === 200) {
      console.log('🎉 EMAIL ENVIADO EXITOSAMENTE A:', correo);
      return {
        exito: true,
        mensaje: '¡Pedido enviado correctamente! Recibirás confirmación en tu correo electrónico.'
      };
    } else {
      throw new Error(`Status: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ ERROR EN EMAILJS:', {
      message: error.message,
      status: error.status || 'sin status',
      response: error.response || 'sin response',
      toString: error.toString()
    });

    let mensajeError = 'Error al enviar el pedido. Intenta nuevamente más tarde.';

    if (error.message?.includes('recipients')) {
      mensajeError = '❌ Error: El campo "To Email" en EmailJS no está configurado como {{to_email}}';
    } else if (error.status === 422) {
      mensajeError = '❌ Error 422: Verifica la configuración del "To Email" en el template.';
    } else if (error.message?.includes('service')) {
      mensajeError = '❌ Error de configuración: Verifica Service ID o Template ID.';
    }

    return {
      exito: false,
      mensaje: mensajeError
    };
  }
}

// Componente CheckoutCorreo
export default function CheckoutCorreo({ cartItems = [], cartTotal = 0, onSuccess }) {
  const [state, formAction, isPending] = useActionState(procesarPedidoPorCorreo, {
    exito: null,
    mensaje: ''
  });

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
    buttonHover: {
      backgroundColor: isPending ? '#007bff' : '#0056b3'
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

  useEffect(() => {
    // Cargar el script de EmailJS desde el CDN
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Eliminar el script cuando el componente se desmonte
      document.body.removeChild(script);
    };
  }, []);

  // Llamar onSuccess cuando el email se envía correctamente
  useEffect(() => {
    if (state?.exito && onSuccess) {
      const timer = setTimeout(() => {
        onSuccess();
      }, 1500); // Esperar 1.5 segundos antes de ejecutar onSuccess

      return () => clearTimeout(timer);
    }
  }, [state?.exito, onSuccess]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Enviar Pedido por Correo</h1>

      <form id="contact-form" action={formAction} style={styles.form}>
        {/* Campo oculto con fecha dinámica */}
        <input type="hidden" name="time" value={new Date().toISOString()} />

        {/* Campo oculto para el subject del correo */}
        <input type="hidden" name="subject" value="Pedido Realizado" />

        {/* Campo oculto con los items del carrito formateados */}
        <input type="hidden" name="cart_items" value={
          cartItems.length > 0 
            ? cartItems.map((item, idx) => {
                const colorInfo = item.color ? ` (Color: ${item.color})` : '';
                return `${idx + 1}. ${item.name} - Cant. ${item.quantity}${colorInfo}`;
              }).join(' | ')
            : 'Sin productos'
        } />

        {/* Campo oculto con el total del carrito */}
        <input type="hidden" name="cart_total" value={cartTotal || '0'} />

        {/* Campo para el nombre del cliente */}
        <div style={styles.formGroup}>
          <label htmlFor="from_name" style={styles.label}>
            Nombre Completo <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="from_name"
            name="from_name"
            placeholder="Escriba su nombre"
            required
            disabled={isPending}
            autoComplete="name"
            style={styles.input}
          />
        </div>

        {/* Campo para el correo del cliente - CRÍTICO: name debe ser to_email */}
        <div style={styles.formGroup}>
          <label htmlFor="to_email" style={styles.label}>
            Correo Electrónico <span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="to_email"
            name="to_email"
            placeholder="tu.email@electronico.com"
            required
            disabled={isPending}
            autoComplete="email"
            style={styles.input}
          />
        </div>

        {/* Campo para el teléfono del cliente */}
        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.label}>
            Teléfono <span style={styles.required}>*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Numero de contacto"
            required
            disabled={isPending}
            autoComplete="tel"
            style={styles.input}
          />
        </div>

        {/* Campo para la dirección del cliente */}
        <div style={styles.formGroup}>
          <label htmlFor="address" style={styles.label}>
            Dirección de Envío <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Calle 123, colonia, Ciudad"
            required
            disabled={isPending}
            autoComplete="street-address"
            style={styles.input}
          />
        </div>

        {/* Campo para el mensaje del cliente */}
        <div style={styles.formGroup}>
          <label htmlFor="message" style={styles.label}>
            Comentarios Adicionales
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Agrega cualquier nota especial para tu pedido..."
            disabled={isPending}
            autoComplete="off"
            style={styles.textarea}
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            ...styles.button,
            ...(isPending && styles.buttonHover)
          }}
          onMouseEnter={(e) => {
            if (!isPending) e.target.style.backgroundColor = '#0056b3';
          }}
          onMouseLeave={(e) => {
            if (!isPending) e.target.style.backgroundColor = '#007bff';
          }}
        >
          {isPending ? 'Enviando pedido...' : 'Enviar Pedido'}
        </button>

        {/* Indicador de carga */}
        {isPending && (
          <div style={styles.loadingText}>
            Procesando tu pedido, por favor espera...
          </div>
        )}
      </form>

      {/* Mensaje de éxito o error */}
      {state?.mensaje && (
        <div
          style={{
            ...styles.message,
            ...(state.exito ? styles.successMessage : styles.errorMessage)
          }}
        >
          {state.mensaje}
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
