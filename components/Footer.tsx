
import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products';

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
              <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider">Productos</h4>
              {CATEGORIES.map(cat => (
                <Link key={cat.id} to={`/catalog/${cat.id}`} className="text-slate-500 text-sm hover:text-blue-600 capitalize transition-colors">
                  {cat.name.toLowerCase()}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider">Ubicaciones</h4>
              <Link to="/contact" className="text-slate-500 text-sm hover:text-blue-600 transition-colors">Suc. Ferrocarril</Link>
              <Link to="/contact" className="text-slate-500 text-sm hover:text-blue-600 transition-colors">Suc. Las Culturas</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider">Empresa</h4>
              <Link to="/" className="text-slate-500 text-sm hover:text-blue-600 transition-colors">Sobre Nosotros</Link>
              <Link to="/contact" className="text-slate-500 text-sm hover:text-blue-600 transition-colors">Sucursales</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Pinturas Diamante Oaxaca. Todos los derechos reservados.</p>
          <div className="flex gap-4 items-center">
            <span>Calidad</span>
            <a 
              href="https://diamantepinturas.com" 
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
