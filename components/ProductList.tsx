
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES, SUB_CATEGORIES, PRODUCTS, PRODUCT_COLORS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useMetaTags } from '../hooks/useMetaTags';
import { useJsonLd } from '../hooks/useJsonLd';
import { TwitterPicker, SliderPicker } from 'react-color';
import { BUSINESS_INFO } from '../data/seo';
import { Product } from '../types';

const ProductCard: React.FC<{ product: Product, subCategoryId: string | undefined }> = ({ product: p, subCategoryId }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = React.useState(1);
  const [selectedColor, setSelectedColor] = React.useState<{ name: string, hex: string } | null>(null);
  const [isColorModalOpen, setIsColorModalOpen] = React.useState(false);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-2 hover:shadow-2xl transition-all group overflow-hidden flex flex-col h-full relative">
      {isColorModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsColorModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter text-left">Color - {p.name}</h3>
            <div className="flex flex-col gap-8 mb-8">
              <div className="flex justify-center">
                <TwitterPicker 
                  width="100%"
                  colors={PRODUCT_COLORS.map(c => c.hex)}
                  color={selectedColor?.hex || '#FFFFFF'}
                  onChange={(color) => {
                    const matchedColor = PRODUCT_COLORS.find(c => c.hex.toLowerCase() === color.hex.toLowerCase());
                    setSelectedColor(matchedColor || { name: 'Personalizado', hex: color.hex });
                  }}
                  styles={{
                    default: {
                      card: {
                        boxShadow: 'none',
                        border: '1px solid #f1f5f9',
                        borderRadius: '1.5rem',
                      },
                      body: {
                        padding: '1.2rem',
                      }
                    }
                  }}
                />
              </div>
              <div className="px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ajuste fino</p>
                <SliderPicker 
                  color={selectedColor?.hex || '#FFFFFF'}
                  onChange={(color) => {
                    const matchedColor = PRODUCT_COLORS.find(c => c.hex.toLowerCase() === color.hex.toLowerCase());
                    setSelectedColor(matchedColor || { name: 'Personalizado', hex: color.hex });
                  }}
                />
              </div>
            </div>
            <button 
              onClick={() => setIsColorModalOpen(false)}
              className="w-full py-4 bg-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <Link key={p.id} to={`/product/${p.id}`} className="block">
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
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{p.tag}</span>
        </div>
        
        <Link to={`/product/${p.id}`}>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</h3>
        </Link>
        <p className="text-slate-500 text-sm mt-3 line-clamp-2 leading-relaxed flex-grow">{p.description}</p>
        
        {subCategoryId === 'vinilicas-deco' && (
          <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center border border-slate-100 rounded-lg bg-slate-50/50 overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-1 hover:bg-white text-slate-500 transition-colors text-xs font-bold"
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-8 text-center text-xs font-black text-slate-900 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2 py-1 hover:bg-white text-slate-500 transition-colors text-xs font-bold"
                >
                  +
                </button>
              </div>
              
              <button
                onClick={() => setIsColorModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-600 transition-all group shadow-sm flex-1 justify-center"
              >
                <div 
                  className="w-3 h-3 rounded-full border border-slate-100 shadow-inner"
                  style={{ backgroundColor: selectedColor ? selectedColor.hex : '#f1f5f9' }}
                />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter whitespace-nowrap">
                  {selectedColor ? selectedColor.name : 'Color'}
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                if (!selectedColor) {
                  setIsColorModalOpen(true);
                  return;
                }
                addToCart({ ...p, price: 0, priceLabel: 'Cotizar' }, quantity, selectedColor.name);
              }}
              className="w-full py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 text-[10px] uppercase tracking-widest"
            >
              Añadir +
            </button>
          </div>
        )}

        {!p.subCategoryId?.includes('vinilicas-deco') && (
          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Pinturas Diamante®</span>
            <Link to={`/product/${p.id}`} className="text-blue-600 font-black text-xs uppercase group-hover:translate-x-1 transition-transform">Ver Detalles →</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductList: React.FC = () => {
  const { categoryId, subCategoryId } = useParams<{ categoryId: string, subCategoryId: string }>();
  const category = CATEGORIES.find(c => c.id === categoryId);
  const subCat = SUB_CATEGORIES.find(s => s.id === subCategoryId);
  const { searchQuery } = useCart();
  
  const products = PRODUCTS.filter(p => 
    p.subCategoryId === subCategoryId && 
    (searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Meta tags SEO
  useMetaTags({
    title: `${subCat?.name || 'Productos'} | ${category?.name || 'Catálogo'} | Diamante`,
    description: `Explora nuestra línea de ${subCat?.name?.toLowerCase() || 'productos'} ${category?.name?.toLowerCase() || ''}. ${products.length} productos disponibles.`,
    ogTitle: `${subCat?.name || 'Productos'} | Diamante Oaxaca`,
    ogDescription: `${subCat?.name || 'Productos'} de calidad premium. Explora ${products.length} opciones especializadas.`,
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
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': category?.name,
        'item': `${BUSINESS_INFO.url}/#/catalog/${categoryId}`
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': subCat?.name,
        'item': `${BUSINESS_INFO.url}/#/catalog/${categoryId}/${subCategoryId}`
      }
    ]
  });

  // Schema ItemList para el listado de productos
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': `${subCat?.name} - ${category?.name}`,
    'description': `Listado de ${products.length} productos de ${subCat?.name?.toLowerCase() || 'productos'}`,
    'itemListElement': products.map((p, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'item': {
        '@type': 'Product',
        'name': p.name,
        'url': `${BUSINESS_INFO.url}/#/product/${p.id}`,
        'image': p.ogImage || p.image,
        'description': p.description.substring(0, 160)
      }
    }))
  });

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
        <p className="text-slate-500 mt-2">Explora nuestra gama de {products.length} productos especializados de alta calidad.</p>
        <div className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Categoría: {category.name} | Subcategoría: {subCat.name}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map(p => (
          <ProductCard key={p.id} product={p} subCategoryId={subCategoryId} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
