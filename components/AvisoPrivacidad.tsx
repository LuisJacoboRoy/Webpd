import React from 'react';
import { useMetaTags } from '../hooks/useMetaTags';
import { BUSINESS_INFO, BUSINESS_LOCATIONS } from '../data/seo';

const AvisoPrivacidad: React.FC = () => {
  useMetaTags({
    title: 'Aviso de privacidad | Pinturas Diamante',
    description: 'Conoce cómo Pinturas Diamante trata y protege los datos personales que proporcionas al usar este sitio.',
    ogTitle: 'Aviso de privacidad | Pinturas Diamante',
    ogDescription: 'Información sobre el tratamiento de datos personales en el sitio de Pinturas Diamante.',
    ogType: 'website',
    ogUrl: `${BUSINESS_INFO.url}/aviso-de-privacidad`,
    canonicalUrl: `${BUSINESS_INFO.url}/aviso-de-privacidad`,
  });

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-slate-700">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Pinturas Diamante</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">Aviso de privacidad</h1>
        <p className="mt-3 text-sm text-slate-500">Última actualización: 5 de noviembre de 2026</p>
      </header>

      <div className="space-y-8 leading-7">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Responsable y domicilio</h2>
          <p className="mt-2">
            Pinturas Diamante (en adelante, “Pinturas Diamante”) es responsable del tratamiento de los datos
            personales que recaba a través de <a className="text-blue-700 underline" href={BUSINESS_INFO.url}>{BUSINESS_INFO.url}</a>.
            Para asuntos de privacidad puedes contactarnos en{' '}
            <a className="text-blue-700 underline" href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a>
            {' '}o en nuestras sucursales:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            {BUSINESS_LOCATIONS.map(location => (
              <li key={location.id}>
                {location.name}: {location.address}, {location.city}, Oaxaca, C.P. {location.postalCode}.
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Datos que podemos recabar</h2>
          <p className="mt-2">
            Cuando envías un pedido o solicitud desde el sitio, podemos recibir tu nombre, correo electrónico,
            teléfono, domicilio, comentarios, productos seleccionados, cantidades, colores y datos relacionados
            con la solicitud. El sitio no solicita datos de tarjetas bancarias ni procesa pagos en línea.
          </p>
          <p className="mt-2">
            Al navegar, también pueden generarse datos técnicos y de uso, como dirección IP, tipo de navegador,
            páginas visitadas, identificadores de cookies y actividad general en el sitio, mediante los servicios
            de medición indicados en este aviso.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Finalidades</h2>
          <p className="mt-2">Usamos los datos para las siguientes finalidades necesarias para atenderte:</p>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li>Recibir, revisar y dar seguimiento a pedidos, cotizaciones y solicitudes de contacto.</li>
            <li>Contactarte para aclaraciones y atención relacionada con tu solicitud.</li>
            <li>Preparar y enviar por correo electrónico los detalles del pedido que nos compartiste.</li>
            <li>Operar, proteger y mantener el sitio y sus servicios.</li>
          </ul>
          <p className="mt-3">
            También utilizamos información de navegación para medir el uso del sitio y mejorar su funcionamiento
            y contenido. Puedes limitar cookies y almacenamiento local desde la configuración de tu navegador;
            algunas funciones, como conservar el carrito, podrían dejar de funcionar.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Servicios de terceros y transferencias</h2>
          <p className="mt-2">
            Para operar el sitio y atender tus solicitudes podemos apoyarnos en proveedores tecnológicos que
            procesan información por cuenta nuestra, incluidos:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              EmailJS, para transmitir por correo los datos del pedido o solicitud que envías.
            </li>
            <li>
              Google Analytics y Ahrefs Analytics, para obtener mediciones de uso y rendimiento del sitio.
            </li>
            <li>
              Vercel y Supabase, para alojar el sitio y proporcionar servicios técnicos y administrativos.
            </li>
            <li>
              Google Gemini, cuando el personal autorizado usa herramientas internas para generar textos o imágenes.
            </li>
            <li>
              Meta Platforms, para programar publicaciones autorizadas de la página de Facebook de Pinturas Diamante.
              Este sitio no usa Facebook Login ni la integración de Meta para obtener perfiles o mensajes de sus visitantes.
            </li>
          </ul>
          <p className="mt-3">
            Estos proveedores pueden tratar datos en servidores fuera de México conforme a sus propios términos y
            políticas de privacidad. Consulta sus avisos:{' '}
            <a className="text-blue-700 underline" href="https://www.emailjs.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">EmailJS</a>,{' '}
            <a className="text-blue-700 underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google</a>,{' '}
            <a className="text-blue-700 underline" href="https://ahrefs.com/privacy-policy" target="_blank" rel="noopener noreferrer">Ahrefs</a>,{' '}
            <a className="text-blue-700 underline" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel</a>,{' '}
            <a className="text-blue-700 underline" href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase</a>{' '}
            y <a className="text-blue-700 underline" href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">Meta</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Conservación y seguridad</h2>
          <p className="mt-2">
            Conservamos la información el tiempo necesario para atender la solicitud y cumplir las obligaciones
            aplicables. Aplicamos medidas administrativas y técnicas razonables para protegerla; ningún medio de
            transmisión o almacenamiento puede garantizar seguridad absoluta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Derechos sobre tus datos</h2>
          <p className="mt-2">
            Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos, así como
            limitar su uso o divulgación, escribiendo a{' '}
            <a className="text-blue-700 underline" href={`mailto:${BUSINESS_INFO.email}?subject=Privacidad%20de%20datos`}>
              {BUSINESS_INFO.email}
            </a>
            {' '}con el asunto “Privacidad de datos”. Describe tu solicitud e incluye datos para que podamos
            identificar la información correspondiente; podremos solicitar información adicional para verificar
            tu identidad y responder conforme a la legislación aplicable.
          </p>
          <p className="mt-2">
            También puedes desactivar cookies desde tu navegador. Para dejar de conservar el carrito en este
            dispositivo, elimina los datos del sitio o su almacenamiento local desde la configuración del navegador.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Cambios a este aviso</h2>
          <p className="mt-2">
            Publicaremos cualquier actualización en esta misma página. Te recomendamos consultarla periódicamente.
          </p>
        </section>
      </div>
    </article>
  );
};

export default AvisoPrivacidad;
