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
 * PLANTILLA: Order Confirmation
 * USANDO: emailjs.sendForm() (método recomendado para formularios)
 * SERVICE ID: service_w4hr6r7
 * TEMPLATE ID: template_x1or3zu ← Order Confirmation
 * PUBLIC KEY: kGZA8SmhiaWwbM2Iq
 * 
 * CAMPOS REQUERIDOS EN EL FORMULARIO (name attributes):
 * - from_name → nombre del cliente
 * - to_email → correo del cliente (REQUERIDO para "To Email")
 * - phone → teléfono del cliente
 * - address → dirección de envío
 * - message → comentarios adicionales
 * - cart_items → artículos del carrito (hidden)
 * - cart_total → total del carrito (hidden)
 * - order_date → fecha del pedido (hidden)
 * 
 * IMPORTANTE EN EMAILJS DASHBOARD:
 * El campo "To Email" DEBE estar configurado exactamente como: {{to_email}}
 * (con dobles llaves y ese nombre exacto)
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
      const nombre = formData.get('from_name')?.trim();
      const correo = formData.get('to_email')?.trim();
      const telefono = formData.get('phone')?.trim();
      const direccion = formData.get('address')?.trim();

      if (!nombre || !correo || !telefono || !direccion) {
        setMessage({
          text: '❌ Por favor completa todos los campos requeridos.',
          isSuccess: false
        });
        setIsPending(false);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
      if (!emailRegex.test(correo)) {
        setMessage({
          text: '❌ Por favor ingresa un correo electrónico válido.',
          isSuccess: false
        });
        setIsPending(false);
        return;
      }

      console.log('📧 Enviando formulario con EmailJS...');

      // Enviar formulario con EmailJS
      const response = await emailjs.sendForm(
        'service_w4hr6r7',          // Service ID
        'template_x1or3zu',         // Template ID
        form.current               // Referencia al formulario
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

      let errorMsg = '❌ Error al enviar el pedido. Intenta nuevamente más tarde.';

      if (error.message?.includes('recipients')) {
        errorMsg = '❌ Error: Configuración incorrecta del "To Email" en EmailJS.';
      } else if (error.status === 422) {
        errorMsg = '❌ Error 422: Verifica los campos en la plantilla de EmailJS.';
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
          style={styles.button}
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
