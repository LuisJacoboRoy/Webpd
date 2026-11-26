import React, { useState } from 'react';
import { BUSINESS_LOCATIONS } from '../data/seo';

const WhatsAppFloatingContact: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <section
          id="whatsapp-branch-options"
          aria-labelledby="whatsapp-branch-title"
          className="absolute bottom-16 right-0 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        >
          <h2 id="whatsapp-branch-title" className="mb-3 text-sm font-bold text-slate-900">
            Elige una sucursal
          </h2>
          <div className="space-y-2">
            {BUSINESS_LOCATIONS.map(location => {
              const phoneNumber = location.mobile.replace(/\D/g, '');
              const message = encodeURIComponent('Hola, quisiera información sobre sus productos.');

              return (
                <a
                  key={location.id}
                  href={`https://wa.me/${phoneNumber}?text=${message}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Contactar por WhatsApp a ${location.name} en una nueva pestaña`}
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                  <span>{location.name}</span>
                  <span aria-hidden="true" className="shrink-0 text-xs text-emerald-700">
                    WhatsApp
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <button
        type="button"
        aria-label={isOpen ? 'Cerrar opciones de WhatsApp' : 'Elegir sucursal para WhatsApp'}
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'whatsapp-branch-options' : undefined}
        onClick={() => setIsOpen(open => !open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .14 5.35.14 11.93c0 2.1.55 4.16 1.6 5.97L.04 24l6.25-1.64a11.9 11.9 0 0 0 5.78 1.48h.01c6.58 0 11.94-5.35 11.94-11.93 0-3.19-1.24-6.19-3.5-8.43ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.9 9.9 0 0 1-1.52-5.26c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.15 1.04 7.03 2.92a9.89 9.89 0 0 1 2.91 7.03c0 5.48-4.46 9.94-9.94 9.94Zm5.46-7.45c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      </button>
    </div>
  );
};

export default WhatsAppFloatingContact;
