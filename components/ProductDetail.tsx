
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS, CATEGORIES, SUB_CATEGORIES } from '../data/products';
import { useCart } from '../context/CartContext';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = PRODUCTS.find(p => p.id === productId);
  const { addToCart } = useCart();

  // Actualizar Open Graph meta tags
  useEffect(() => {
    if (product) {
      document.title = product.ogTitle || `${product.name} - Pinturas Diamante`;
      
      // Actualizar/crear meta tags
      const updateMeta = (name: string, content: string) => {
        let meta = document.querySelector(`meta[property="${name}"]`) || 
                   document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(name.includes('og:') ? 'property' : 'name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateMeta('og:title', product.ogTitle || `${product.name} - Pinturas Diamante`);
      updateMeta('og:description', product.ogDescription || product.description);
      updateMeta('og:type', 'product');
      if (product.ogImage) updateMeta('og:image', product.ogImage);
      updateMeta('description', product.ogDescription || product.description);
    }
  }, [product]);

  if (!product) return <div className="p-20 text-center">Producto no encontrado.</div>;

  const category = CATEGORIES.find(c => c.id === product.categoryId);
  const subCat = SUB_CATEGORIES.find(s => s.id === product.subCategoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <nav className="flex mb-12 text-[10px] font-bold uppercase tracking-widest gap-3">
        <Link to="/catalog" className="text-slate-400">Catálogo</Link>
        <span className="text-slate-300">/</span>
        <Link to={`/catalog/${product.categoryId}`} className="text-slate-400">{category?.name}</Link>
        <span className="text-slate-300">/</span>
        <Link to={`/catalog/${product.categoryId}/${product.subCategoryId}`} className="text-slate-400">{subCat?.name}</Link>
        <span className="text-slate-300">/</span>
        <span className="text-blue-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="aspect-square bg-slate-100 rounded-[3rem] border border-slate-200 flex items-center justify-center relative shadow-inner overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-slate-400 font-bold uppercase tracking-widest text-sm text-center px-6">Espacio para Fotografía del Producto</span>
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-8">
            <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest mb-4">
              {product.tag}
            </span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-6">
              {product.name}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Ficha Técnica Destacada</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Máxima durabilidad y resistencia Diamante®
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Alto poder cubriente y acabado profesional
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Formulación optimizada para el clima de Oaxaca
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => addToCart({ ...product, price: 0, priceLabel: 'Precio a Cotizar' })}
              className="flex-1 px-8 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 text-sm uppercase tracking-widest"
            >
              Añadir al Carrito
            </button>
            <Link 
              to="/contact" 
              className="px-8 py-5 bg-white text-slate-900 font-black rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all text-sm uppercase tracking-widest text-center"
            >
              ¿Cómo comprar?
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-blue-600">D</div>)}
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Producto verificado por Pinturas Diamante Oaxaca
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
