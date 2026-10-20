
import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products';
import { BUSINESS_LOCATIONS } from '../data/seo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="text-left max-w-sm">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">
              Pinturas Diamante
            </span>
            <p className="text-slate-500 text-sm mt-2">
              Distribuidores autorizados en Oaxaca para todo México. Calidad que transforma tus espacios.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div className="flex flex-col gap-2">
              <p className="text-slate-900 font-bold text-sm uppercase tracking-wider">Líneas de pintura</p>
              {CATEGORIES.map(cat => (
                <Link key={cat.id} to={`/catalog/${cat.id}`} className="text-slate-500 text-sm hover:text-blue-600 capitalize transition-colors">
                  Ver pinturas {cat.name.toLowerCase()}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-4 max-w-xs">
              <p className="text-slate-900 font-bold text-sm uppercase tracking-wider">Sucursales en Oaxaca</p>
              {BUSINESS_LOCATIONS.map(location => (
                <div key={location.id} className="flex flex-col gap-1">
                  <p className="text-slate-700 text-sm font-semibold">{location.name}</p>
                  <address className="text-slate-500 text-sm not-italic">
                    {location.address}, {location.city}, Oaxaca, C.P. {location.postalCode}
                  </address>
                  <Link
                    to="/contact"
                    className="text-blue-600 text-sm hover:underline transition-colors"
                  >
                    Ver horarios y cómo llegar a {location.name}
                  </Link>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-slate-900 font-bold text-sm uppercase tracking-wider">Empresa</p>
              <Link to="/" className="text-slate-500 text-sm hover:text-blue-600 transition-colors">Conoce Pinturas Diamante en Oaxaca</Link>
              <Link to="/contact" className="text-slate-500 text-sm hover:text-blue-600 transition-colors">Contacto y sucursales en Oaxaca</Link>
            </div>
          </div>
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
