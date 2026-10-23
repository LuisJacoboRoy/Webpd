
import React from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS_LOCATIONS } from '../data/seo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-start gap-8">
          <div className="flex items-center justify-center">
            <img
              src="/img/iso.png"
              alt="Certificación ISO 9001:2015 de Pinturas Diamante"
              className="h-[150px] w-auto max-w-full object-contain"
              loading="lazy"
            />
          </div>

          <div className="text-left max-w-sm">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">
              Pinturas Diamante
            </span>
            <p className="text-slate-500 text-sm mt-2">
              Distribuidores autorizados en Oaxaca para todo México. Calidad que transforma tus espacios.
            </p>
          </div>

          {BUSINESS_LOCATIONS.map(location => (
            <div key={location.id} className="flex flex-col gap-1">
              <p className="text-slate-700 text-sm font-semibold">{location.name}</p>
              <address className="text-slate-500 text-sm not-italic">
                {location.address}, {location.city}, Oaxaca, C.P. {location.postalCode}
              </address>
              {[location.phone, location.mobile].map((phone, index) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  className="text-blue-600 text-sm hover:underline transition-colors"
                >
                  {index === 0 ? 'Teléfono' : 'Celular'}: {phone}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Pinturas Diamante Oaxaca. Todos los derechos reservados.</p>
          <div className="flex gap-4 items-center">
            <span>Calidad</span>
            <a
              href="https://diamantepinturas.com.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-bold hover:underline"
            >
              Diamante®
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
