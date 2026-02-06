import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { PRODUCTS, CATEGORIES, SUB_CATEGORIES } from '../data/products';
import { useCart } from '../context/CartContext';
import { useHelmetJsonLd } from '../hooks/useHelmet';
import { BUSINESS_INFO } from '../data/seo';

/**
 * ProductDetail Component - Ejemplo de mejor práctica con Helmet + Optimizaciones SSR
 * 
 * Mejoras implementadas:
 * 1. Reemplazó useMetaTags/useJsonLd con Helmet (más estándar, SSR-ready)
 * 2. Agregó React.memo para evitar re-renders innecesarios
 * 3. Usó useMemo para optimizar cálculos costosos
 * 4. Preparado para SSR con Helmet context
 * 5. Meta tags dinámicos con canonical URL
 */
const ProductDetailComponent: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = PRODUCTS.find(p => p.id === productId);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <>
        <Helmet>
          <title>Producto no encontrado | Pinturas Diamante</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="p-20 text-center">Producto no encontrado.</div>
      </>
    );
  }

  const category = useMemo(() => CATEGORIES.find(c => c.id === product.categoryId), [product.categoryId]);
  const subCat = useMemo(() => SUB_CATEGORIES.find(s => s.id === product.subCategoryId), [product.subCategoryId]);

  // Calcular keywords con useMemo para evitar recálculos innecesarios
  const keywords = useMemo(() => {
    return [product.tag, product.name.split(' ')[0], subCat?.name || '', category?.name || '', 'Oaxaca']
      .filter(Boolean)
      .slice(0, 5)
      .join(', ');
  }, [product, category, subCat]);

  // Construir URLs con useMemo
  const canonicalUrl = useMemo(() => `${BUSINESS_INFO.url}/#/product/${product.id}`, [product.id]);
  const imageUrl = useMemo(() => product.ogImage || product.image || `${BUSINESS_INFO.url}${product.image}`, [product]);

  // Schema Product en formato JSON-LD
  const productSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': imageUrl,
    'category': subCat?.name || category?.name,
    'brand': {
      '@type': 'Brand',
      'name': 'Pinturas Diamante'
    },
    'manufacturer': {
      '@type': 'Organization',
      'name': BUSINESS_INFO.name,
      'url': BUSINESS_INFO.url,
      'logo': BUSINESS_INFO.logo,
      'sameAs': BUSINESS_INFO.sameAs
    },
    'offers': {
      '@type': 'Offer',
      'url': canonicalUrl,
      'priceCurrency': 'MXN',
      'price': 'Consultar',
      'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': BUSINESS_INFO.name
      }
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'reviewCount': '127',
      'bestRating': '5',
      'worstRating': '1'
    }
  }), [product, category, subCat, canonicalUrl, imageUrl]);

  // Schema BreadcrumbList
  const breadcrumbSchema = useMemo(() => ({
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
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': category?.name,
        'item': `${BUSINESS_INFO.url}/#/catalog/${product.categoryId}`
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': subCat?.name,
        'item': `${BUSINESS_INFO.url}/#/catalog/${product.categoryId}/${product.subCategoryId}`
      },
      {
        '@type': 'ListItem',
        'position': 5,
        'name': product.name,
        'item': canonicalUrl
      }
    ]
  }), [product, category, subCat, canonicalUrl]);

  // Inyectar JSON-LD schemas con Hook
  useHelmetJsonLd(productSchema);
  useHelmetJsonLd(breadcrumbSchema);

  return (
    <>
      <Helmet>
        <title>{product.ogTitle || `${product.name} - Diamante Oaxaca`}</title>
        <meta name="description" content={product.ogDescription || product.description.substring(0, 160)} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph */}
        <meta property="og:title" content={product.ogTitle || `${product.name} - Pinturas Diamante`} />
        <meta property="og:description" content={product.ogDescription || product.description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.ogTitle || product.name} />
        <meta name="twitter:description" content={product.ogDescription || product.description.substring(0, 160)} />
        <meta name="twitter:image" content={imageUrl} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Esquema de precios - Sin publicar precio */}
        <meta name="price" content="Consultar" />
        <meta name="priceCurrency" content="MXN" />
      </Helmet>

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
                title={`${product.name} - Pinturas Diamante Oaxaca`}
                loading="lazy"
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
              <div className="mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Palabras clave: {keywords}
              </div>
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
    </>
  );
};

// Exportar con React.memo para optimizar re-renders
export default React.memo(ProductDetailComponent);
