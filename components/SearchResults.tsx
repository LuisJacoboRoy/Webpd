import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useMetaTags } from '../hooks/useMetaTags';

/**
 * SearchResults Component
 * Muestra resultados de búsqueda de productos y categorías
 * Prioridad: Productos primero, luego categorías
 */
const SearchResults: React.FC = () => {
  const { searchQuery } = useCart();

  // Buscar productos que coincidan con la búsqueda
  const matchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tag.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Buscar categorías que coincidan con la búsqueda
  const matchedCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return CATEGORIES.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Meta tags SEO
  useMetaTags({
    title: `Buscar: "${searchQuery}" | Diamante Oaxaca`,
    description: `Resultados de búsqueda para "${searchQuery}". ${matchedProducts.length} productos encontrados.`,
    ogTitle: `Búsqueda: ${searchQuery}`,
    ogDescription: `Explora los resultados de búsqueda para "${searchQuery}"`,
    ogImage: CATEGORIES[0]?.image || '/img/logo.png',
    ogType: 'website'
  });

  const totalResults = matchedProducts.length + matchedCategories.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Resultados de Búsqueda
        </h1>
        <p className="text-slate-600">
          {searchQuery && `Buscando: "${searchQuery}"`}
          <span className="font-bold text-slate-900"> — {totalResults} resultado{totalResults !== 1 ? 's' : ''}</span>
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sin resultados</h2>
          <p className="text-slate-500 mb-6">
            No encontramos productos o categorías para "{searchQuery}"
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest"
          >
            Ver Catálogo Completo
          </Link>
        </div>
      ) : (
        <div className="space-y-16">
          {/* ========== PRODUCTOS (PRIORIDAD) ========== */}
          {matchedProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-black text-slate-900">Productos</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-sm rounded-full">
                  {matchedProducts.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {matchedProducts.map(product => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group bg-white rounded-[2rem] border border-slate-100 p-4 hover:shadow-2xl transition-all overflow-hidden flex flex-col h-full"
                  >
                    <div className="aspect-[4/3] bg-slate-50 rounded-[1.5rem] flex items-center justify-center overflow-hidden mb-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-slate-200 font-bold text-xs uppercase tracking-widest">Sin Imagen</div>
                      )}
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                        {product.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                      {product.name}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 flex-grow">
                      {product.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-50 text-blue-600 font-black text-xs uppercase group-hover:translate-x-1 transition-transform inline-flex">
                      Ver Detalles →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ========== CATEGORÍAS (SECUNDARIA) ========== */}
          {matchedCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-black text-slate-900">Categorías</h2>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-sm rounded-full">
                  {matchedCategories.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {matchedCategories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/catalog/${cat.id}`}
                    className="group relative h-[300px] rounded-3xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 hover:border-emerald-300 transition-all hover:shadow-2xl"
                  >
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/20 to-transparent z-10" />
                    <div className="relative z-20 text-center p-8">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter transform group-hover:scale-110 transition-transform">
                        {cat.name}
                      </h3>
                      <p className="text-emerald-100 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {cat.description}
                      </p>
                      <div className="mt-4 inline-flex items-center px-4 py-2 bg-white text-emerald-900 font-bold rounded-full text-xs uppercase tracking-widest">
                        Explorar
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA Bottom */}
      {totalResults > 0 && (
        <div className="mt-16 pt-16 border-t border-slate-100 text-center">
          <p className="text-slate-600 mb-6">¿No encontraste lo que buscas?</p>
          <Link
            to="/catalog"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest"
          >
            Explorar Catálogo Completo
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
