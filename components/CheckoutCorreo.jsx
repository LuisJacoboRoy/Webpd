'use client';

import { useActionState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

// ✅ Inicializar EmailJS al cargar el módulo
if (typeof window !== 'undefined') {
  emailjs.init('kGZA8SmhiaWwbM2Iq'); // Public Key
}

/**
 * ⚠️ CONFIGURACIÓN IMPORTANTE DE EMAILJS ⚠️
 * 
 * INICIALIZACIÓN: EmailJS se inicializa automáticamente con la Public Key
 * EMAIL SERVICE: service_w4hr6r7
 * PLANTILLA: template_2l07s2f
 * 
 * CONFIGURACIÓN REQUERIDA EN EMAILJS DASHBOARD:
 * 
 * 1. En el panel de EmailJS, ve a tu plantilla "template_2l07s2f"
 * 2. En el campo "Send To" (To Email), coloca: {{to_email}}
 * 3. Los campos disponibles en esta plantilla son:
 *    - to_email         → dirección del cliente
 *    - customer_name    → nombre del cliente
 *    - customer_email   → email del cliente
 *    - customer_phone   → teléfono del cliente
 *    - customer_address → dirección de envío
 *    - additional_comments → comentarios adicionales
 *    - cart_items       → artículos del carrito
 *    - cart_total       → total del carrito
 *    - order_date       → fecha del pedido
 * 
 * SI RECIBE ERROR "The recipients address is empty" (422):
 * ✓ Verifica que el campo "Send To" sea: {{to_email}} (con {{  }})
 * ✓ Que NO haya un email fijo o vacío en "Send To"
 * ✓ Que el email del cliente no esté vacío o inválido
 * ✓ Revisa los logs de la consola (F12) para ver los parámetros enviados
 */

// Función de acción para procesar el formulario de pedido por correo
async function procesarPedidoPorCorreo(prevState, formData) {
  try {
    // Objeto simulado del carrito de compras
    const carrito = {
      items: ["Producto 1", "Producto 2", "Producto 3"],
      total: 500,
      fecha: new Date().toLocaleDateString('es-ES')
    };

    // Extraer datos del FormData
    const nombre = formData.get('nombre');
    const correo = formData.get('correo');
    const direccion = formData.get('direccion');
    const telefono = formData.get('telefono');
    const comentarios = formData.get('comentarios') || 'Sin comentarios adicionales';

    // Validación básica en servidor
    if (!nombre || !correo || !direccion || !telefono) {
      return {
        exito: false,
        mensaje: 'Por favor completa todos los campos requeridos.'
      };
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      return {
        exito: false,
        mensaje: 'Por favor ingresa un correo electrónico válido.'
      };
    }

    // Configurar las variables para la plantilla de EmailJS
    const templateParams = {
      to_email: correo.trim(),
      customer_name: nombre.trim(),
      customer_email: correo.trim(),
      customer_phone: telefono.trim(),
      customer_address: direccion.trim(),
      additional_comments: comentarios.trim(),
      cart_items: carrito.items.join(', '),
      cart_total: carrito.total,
      order_date: carrito.fecha
    };

    console.log('📧 Enviando parámetros:', templateParams);

    // Enviar correo usando EmailJS
    const response = await emailjs.send(
      'service_w4hr6r7',         // Service ID
      'template_2l07s2f',        // Template ID
      templateParams             // Template parameters
    );

    console.log('✅ Respuesta de EmailJS:', response);

    // Verificar respuesta exitosa
    if (response.status === 200) {
      return {
        exito: true,
        mensaje: '¡Pedido enviado correctamente! Recibirás confirmación en tu correo electrónico.'
      };
    } else {
      throw new Error(`Error al enviar el correo. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error procesando pedido:', error);
    return {
      exito: false,
      mensaje: `Error al enviar el pedido: ${error.message || 'Intenta nuevamente más tarde.'}`
    };
  }
}

// Componente CheckoutCorreo
export default function CheckoutCorreo() {
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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Enviar Pedido por Correo</h1>

      <form action={formAction} style={styles.form}>
        {/* Campo: Nombre Completo */}
        <div style={styles.formGroup}>
          <label htmlFor="nombre" style={styles.label}>
            Nombre Completo <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Juan Pérez García"
            required
            disabled={isPending}
            style={styles.input}
          />
        </div>

        {/* Campo: Correo Electrónico */}
        <div style={styles.formGroup}>
          <label htmlFor="correo" style={styles.label}>
            Correo Electrónico <span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            placeholder="tu.email@ejemplo.com"
            required
            disabled={isPending}
            style={styles.input}
          />
        </div>

        {/* Campo: Dirección de Envío */}
        <div style={styles.formGroup}>
          <label htmlFor="direccion" style={styles.label}>
            Dirección de Envío <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            placeholder="Calle Principal 123, Apt 4B, Ciudad"
            required
            disabled={isPending}
            style={styles.input}
          />
        </div>

        {/* Campo: Teléfono */}
        <div style={styles.formGroup}>
          <label htmlFor="telefono" style={styles.label}>
            Teléfono <span style={styles.required}>*</span>
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            placeholder="+34 600 123 456"
            required
            disabled={isPending}
            style={styles.input}
          />
        </div>

        {/* Campo: Comentarios Adicionales */}
        <div style={styles.formGroup}>
          <label htmlFor="comentarios" style={styles.label}>
            Comentarios Adicionales
          </label>
          <textarea
            id="comentarios"
            name="comentarios"
            placeholder="Agrega cualquier nota especial para tu pedido..."
            disabled={isPending}
            style={styles.textarea}
          />
        </div>

        {/* Botón de Envío */}
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
