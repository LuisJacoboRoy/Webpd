
import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products';

const CatalogCategories: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 uppercase tracking-tight">Nuestro Catálogo</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Selecciona una de nuestras líneas especializadas para encontrar el producto ideal para tu proyecto.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CATEGORIES.map(cat => (
          <Link 
            key={cat.id} 
            to={`/catalog/${cat.id}`}
            className="group relative h-[400px] rounded-3xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 hover:border-blue-300 transition-all hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-transparent z-10" />
            <div className="relative z-20 text-center p-8">
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter transform group-hover:scale-110 transition-transform">{cat.name}</h2>
              <p className="text-blue-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity leading-snug">{cat.description}</p>
              <div className="mt-6 inline-flex items-center px-6 py-2 bg-white text-blue-900 font-bold rounded-full text-xs uppercase tracking-widest shadow-lg">
                Explorar Línea
              </div>
            </div>
            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity">
               <div className="w-full h-full bg-blue-600 flex items-center justify-center text-blue-200 font-bold text-8xl opacity-10 uppercase select-none">
                 {cat.name.charAt(0)}
               </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CatalogCategories;
