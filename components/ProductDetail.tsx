import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { PRODUCTS, CATEGORIES, SUB_CATEGORIES, PRODUCT_COLORS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useHelmetJsonLd } from '../hooks/useHelmet';
import { BUSINESS_INFO } from '../data/seo';
import { TwitterPicker, SliderPicker } from 'react-color';

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
  const [quantity, setQuantity] = React.useState(1);
  const [selectedColor, setSelectedColor] = React.useState<{ name: string, hex: string } | null>(null);

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

  // og:image: usa la imagen real del producto con URL absoluta
  const imageUrl = useMemo(() => {
    const src = product.ogImage || product.image;
    if (!src) return BUSINESS_INFO.logo;
    // Si ya es una URL absoluta (http/https) la devuelve tal cual
    if (src.startsWith('http')) return src;
    // Si es ruta relativa, construye URL absoluta
    return `${BUSINESS_INFO.url}${src.startsWith('/') ? '' : '/'}${src}`;
  }, [product]);

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

            <div className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100 flex flex-col gap-6">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Cantidad</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                      -
                    </button>
                    <input 
                      id="quantity"
                      name="quantity"
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 text-center font-black text-slate-900 border-x border-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unidades</span>
                </div>
              </div>

              {product.subCategoryId === 'vinilicas-deco' && (
                <div className="w-full flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Color Seleccionado</h4>
                    {selectedColor && (
                      <span className="text-xs font-black text-slate-900 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{selectedColor.name}</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-full sm:w-auto flex justify-center">
                      <TwitterPicker 
                        width="276px"
                        colors={PRODUCT_COLORS.map(c => c.hex)}
                        color={selectedColor?.hex || '#FFFFFF'}
                        onChange={(color) => {
                          const matchedColor = PRODUCT_COLORS.find(c => c.hex.toLowerCase() === color.hex.toLowerCase());
                          setSelectedColor(matchedColor || { name: 'Personalizado', hex: color.hex });
                        }}
                        triangle="hide"
                        styles={{
                          default: {
                            card: { boxShadow: 'none', border: 'none', background: 'transparent' },
                            body: { padding: 0 }
                          }
                        }}
                      />
                    </div>
                    <div className="w-full sm:flex-1 px-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center sm:text-left">Ajuste fino (Tonalidad)</p>
                      <SliderPicker 
                        color={selectedColor?.hex || '#FFFFFF'}
                        onChange={(color) => {
                          const matchedColor = PRODUCT_COLORS.find(c => c.hex.toLowerCase() === color.hex.toLowerCase());
                          setSelectedColor(matchedColor || { name: 'Personalizado', hex: color.hex });
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  if (product.subCategoryId === 'vinilicas-deco' && !selectedColor) {
                    alert('Por favor, selecciona un color en el panel antes de añadir al carrito.');
                    return;
                  }
                  // Si el color es personalizado, pasamos el hexadecimal como identificador
                  const colorIdentifier = selectedColor?.name === 'Personalizado' 
                    ? selectedColor.hex.toUpperCase() 
                    : selectedColor?.name;
                    
                  addToCart({ ...product, price: 0, priceLabel: 'Precio a Cotizar' }, quantity, colorIdentifier);
                }}
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

            <div className="mt-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Contacto rápido</p>
              <div className="flex flex-wrap gap-3">
                {/* Consultar Precio (Llamada) */}
                <a
                  href={`tel:${Math.random() > 0.5 ? '9511433467' : '9517683049'}`}
                  className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-blue-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                  </svg>
                  Consultar Precio
                </a>
                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-[#1877F2] text-white font-black rounded-xl hover:bg-[#166FE5] transition-all text-xs uppercase tracking-widest shadow-lg shadow-blue-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                  Facebook
                </a>
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`¡Mira este producto de Pinturas Diamante! ${product.name} - ${canonicalUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white font-black rounded-xl hover:bg-[#1ebe59] transition-all text-xs uppercase tracking-widest shadow-lg shadow-green-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                   </svg>
                   WhatsApp
                 </a>
               </div>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-blue-600">D</div>)}
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
