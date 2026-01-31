
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

const CategoryOne: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, searchQuery } = useCart();

  const allProducts: Product[] = [
    // Fix: Added missing required properties (categoryId, subCategoryId, description) to satisfy Product interface
    { 
      id: '1', 
      name: 'Diamante Premium', 
      price: 1200, 
      priceLabel: '$1,200 Cubeta', 
      tag: 'Vinílicas', 
      image: 'https://picsum.photos/seed/paint1/400/225',
      categoryId: 'decorativo',
      subCategoryId: 'vinilicas-deco',
      description: 'Pintura vinílica de alta gama.'
    },
    { 
      id: '2', 
      name: 'Brillo Extremo', 
      price: 450, 
      priceLabel: '$450 Galón', 
      tag: 'Esmaltes', 
      image: 'https://picsum.photos/seed/paint2/400/225',
      categoryId: 'decorativo',
      subCategoryId: 'esmaltes-deco',
      description: 'Esmalte brillante de secado rápido.'
    },
    { 
      id: '3', 
      name: 'Sello Total 10', 
      price: 1800, 
      priceLabel: '$1,800 Cubeta', 
      tag: 'Impermeabilizantes', 
      image: 'https://picsum.photos/seed/paint3/400/225',
      categoryId: 'decorativo',
      subCategoryId: 'imper-deco',
      description: 'Impermeabilizante acrílico de larga duración.'
    },
    { 
      id: '4', 
      name: 'Protección Epóxica', 
      price: 2500, 
      priceLabel: '$2,500 Kit', 
      tag: 'Industriales', 
      image: 'https://picsum.photos/seed/paint4/400/225',
      categoryId: 'automotriz',
      subCategoryId: 'poliuretano-auto',
      description: 'Recubrimiento industrial de alta resistencia.'
    },
    { 
      id: '5', 
      name: 'Vinilo Económico', 
      price: 800, 
      priceLabel: '$800 Cubeta', 
      tag: 'Vinílicas', 
      image: 'https://picsum.photos/seed/paint5/400/225',
      categoryId: 'decorativo',
      subCategoryId: 'vinilicas-deco',
      description: 'Pintura vinílica de buen rendimiento.'
    },
    { 
      id: '6', 
      name: 'Primer Metal', 
      price: 320, 
      priceLabel: '$320 Galón', 
      tag: 'Esmaltes', 
      image: 'https://picsum.photos/seed/paint6/400/225',
      categoryId: 'automotriz',
      subCategoryId: 'primarios-auto',
      description: 'Primario anticorrosivo para superficies metálicas.'
    },
  ];

  const filteredProducts = useMemo(() => {
    const categoryIdParam = parseInt(id || '1');
    const startIdx = (categoryIdParam - 1) % allProducts.length;
    const categorySpecific = [...allProducts.slice(startIdx), ...allProducts.slice(0, startIdx)].slice(0, 6);

    return categorySpecific.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, id, allProducts]);

  const getCategoryName = (cid: string | undefined) => {
    switch(cid) {
      case '1': return 'Pinturas Vinílicas';
      case '2': return 'Esmaltes';
      case '3': return 'Impermeabilizantes';
      case '4': return 'Productos Industriales';
      default: return 'Línea Diamante';
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900">{getCategoryName(id)}</h2>
        <p className="mt-2 text-slate-500">
          {searchQuery 
            ? `Buscando "${searchQuery}" en ${getCategoryName(id)}` 
            : `Explora nuestra selección de alta calidad para tus proyectos.`}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500 italic">No se encontraron productos.</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 font-bold">Ver todo</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => (
            <div key={p.id} className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300">
              <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                 <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{p.tag}</span>
                  <span className="font-bold text-slate-900">{p.priceLabel}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Producto Diamante® de alta durabilidad and cobertura excepcional para resultados profesionales.
                </p>
                
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => addToCart(p)}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 text-sm"
                  >
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategoryOne;
