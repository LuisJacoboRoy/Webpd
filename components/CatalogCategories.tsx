
import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products';
import { useMetaTags } from '../hooks/useMetaTags';
import { useJsonLd } from '../hooks/useJsonLd';
import { BUSINESS_INFO, SEO_KEYWORDS } from '../data/seo';

const CatalogCategories: React.FC = () => {
  // Meta tags SEO
  useMetaTags({
    title: 'Catálogo de Pinturas | Diamante Oaxaca',
    description: 'Explora nuestro catálogo de pinturas especializadas: automotriz, maderas y decorativo. Soluciones de pintura de alta gama.',
    ogTitle: 'Nuestro Catálogo | Diamante Oaxaca',
    ogDescription: 'Productos de pintura premium para automotriz, maderas y espacios decorativos',
    ogImage: BUSINESS_INFO.logo,
    ogType: 'website'
  });

  // Schema BreadcrumbList
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Inicio',
        'item': `${BUSINESS_INFO.url}/#/`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Catálogo',
        'item': `${BUSINESS_INFO.url}/#/catalog`
      }
    ]
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 uppercase tracking-tight">Nuestro Catálogo</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Selecciona una de nuestras líneas especializadas para encontrar el producto ideal para tu proyecto.</p>
        <div className="mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Palabras clave: {SEO_KEYWORDS.home.join(', ')}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CATEGORIES.map(cat => (
          <Link 
            key={cat.id} 
            to={`/catalog/${cat.id}`}
            className="group relative h-[400px] rounded-3xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 hover:border-blue-300 transition-all hover:shadow-2xl"
            title={cat.description}
          >
            {cat.image && (
              <img 
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-transparent z-10" />
            <div className="relative z-20 text-center p-8">
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter transform group-hover:scale-110 transition-transform">{cat.name}</h2>
              <p className="text-blue-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity leading-snug">{cat.description}</p>
              <div className="mt-6 inline-flex items-center px-6 py-2 bg-white text-blue-900 font-bold rounded-full text-xs uppercase tracking-widest shadow-lg">
                Explorar Línea
              </div>
            </div>
            {!cat.image && (
              <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity">
                 <div className="w-full h-full bg-blue-600 flex items-center justify-center text-blue-200 font-bold text-8xl opacity-10 uppercase select-none">
                   {cat.name.charAt(0)}
                 </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CatalogCategories;
