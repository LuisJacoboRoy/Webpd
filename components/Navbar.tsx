
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../data/products';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen, searchQuery, setSearchQuery } = useCart();

  const isActive = (path: string) => location.pathname === path;
  const isCatalogActive = location.pathname.startsWith('/catalog');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!location.pathname.startsWith('/catalog')) {
      navigate('/catalog');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 350) setIsSticky(true);
      else setIsSticky(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCatalogOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`w-full z-[60] transition-all duration-300 border-b ${isSticky ? 'fixed top-0 bg-white/95 backdrop-blur-md shadow-sm' : 'relative bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-4">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent uppercase tracking-tight">
              Diamante Pinturas Oaxaca
            </Link>
            <div className="hidden sm:block relative ml-4">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Buscar producto..."
                className="block w-64 pl-10 pr-3 py-1 border border-slate-200 rounded-full text-xs focus:ring-2 focus:ring-green-500/20 transition-all bg-slate-50/50"
              />
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-xs font-medium ${isActive('/') ? 'text-green-600' : 'text-slate-500'}`}>Sobre Nosotros</Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                className={`flex items-center gap-1 text-xs font-medium hover:text-green-600 ${isCatalogActive ? 'text-green-600' : 'text-slate-500'}`}
              >
                Catálogo
                <svg className={`h-3 w-3 transition-transform ${isCatalogOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {isCatalogOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-150">
                  <Link to="/catalog" onClick={() => setIsCatalogOpen(false)} className="block px-4 py-2 text-xs font-bold text-green-600 hover:bg-green-50">Ver Todo el Catálogo</Link>
                  <div className="h-px bg-slate-100 my-1" />
                  {CATEGORIES.map(cat => (
                    <Link key={cat.id} to={`/catalog/${cat.id}`} onClick={() => setIsCatalogOpen(false)} className="block px-4 py-2 text-xs text-slate-600 hover:bg-green-50 hover:text-green-600 uppercase font-semibold">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/contact" className={`text-xs font-medium ${isActive('/contact') ? 'text-green-600' : 'text-slate-500'}`}>Contacto</Link>

            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-slate-500 hover:text-green-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {totalItems > 0 && <span className="absolute top-0 right-0 px-1.5 py-0.5 text-[8px] font-bold text-white bg-red-600 rounded-full">{totalItems}</span>}
            </button>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-400">
            {isOpen ? <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-500">Sobre Nosotros</Link>
            <Link to="/catalog" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-bold text-green-600">Catálogo</Link>
            {CATEGORIES.map(cat => (
              <Link key={cat.id} to={`/catalog/${cat.id}`} onClick={() => setIsOpen(false)} className="block px-6 py-1.5 text-xs text-slate-400 uppercase">{cat.name}</Link>
            ))}
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-500">Contacto</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
