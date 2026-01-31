
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES, SUB_CATEGORIES } from '../data/products';

const SubCategorySelector: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = CATEGORIES.find(c => c.id === categoryId);
  const subCats = SUB_CATEGORIES.filter(s => s.categoryId === categoryId);

  if (!category) return <div className="p-20 text-center text-slate-500">Categoría no encontrada.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <nav className="flex mb-8 text-xs font-bold uppercase tracking-widest gap-2">
        <Link to="/catalog" className="text-slate-400 hover:text-blue-600 transition-colors">CATÁLOGO</Link>
        <span className="text-slate-300">/</span>
        <span className="text-blue-600">{category.name}</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">{category.name}</h1>
        <p className="text-slate-500 text-lg">{category.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {subCats.map(sub => (
          <Link 
            key={sub.id} 
            to={`/catalog/${categoryId}/${sub.id}`}
            className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{sub.name}</h3>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-tighter">Ver Productos →</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubCategorySelector;
