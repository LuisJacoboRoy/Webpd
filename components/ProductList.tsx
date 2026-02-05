
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES, SUB_CATEGORIES, PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';

const ProductList: React.FC = () => {
  const { categoryId, subCategoryId } = useParams<{ categoryId: string, subCategoryId: string }>();
  const category = CATEGORIES.find(c => c.id === categoryId);
  const subCat = SUB_CATEGORIES.find(s => s.id === subCategoryId);
  const { searchQuery } = useCart();
  
  const products = PRODUCTS.filter(p => 
    p.subCategoryId === subCategoryId && 
    (searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!category || !subCat) return <div className="p-20 text-center">Contenido no disponible.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <nav className="flex mb-8 text-[10px] font-black uppercase tracking-[0.2em] gap-3">
        <Link to="/catalog" className="text-slate-400 hover:text-blue-600">Catálogo</Link>
        <span className="text-slate-300">/</span>
        <Link to={`/catalog/${categoryId}`} className="text-slate-400 hover:text-blue-600">{category.name}</Link>
        <span className="text-slate-300">/</span>
        <span className="text-blue-600">{subCat.name}</span>
      </nav>

      <div className="mb-12 border-l-4 border-blue-600 pl-6">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{subCat.name}</h1>
        <p className="text-slate-500 mt-2">Explora nuestra gama de productos especializados de alta calidad.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map(p => (
          <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-[2rem] border border-slate-100 p-2 hover:shadow-2xl transition-all group overflow-hidden flex flex-col h-full">
            <div className="aspect-[4/3] bg-slate-50 rounded-[1.8rem] flex items-center justify-center overflow-hidden relative">
              {p.image ? (
                <img 
                  src={p.image} 
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-slate-200 font-bold uppercase tracking-widest text-xs">Espacio para Fotografía</div>
              )}
              <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 bg-blue-50 self-start px-2 py-0.5 rounded">{p.tag}</span>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</h3>
              <p className="text-slate-500 text-sm mt-3 line-clamp-2 leading-relaxed flex-grow">{p.description}</p>
              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Pinturas Diamante®</span>
                <span className="text-blue-600 font-black text-xs uppercase group-hover:translate-x-1 transition-transform">Ver Detalles →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
