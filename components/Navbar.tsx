
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { CATALOG_PATH, categoryPath, productPath } from '../utils/routes';

const SearchAutocomplete: React.FC<{ id: string; className: string }> = ({ id, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useCart();
  const listId = `${id}-suggestions`;
  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('es');
    if (!query) return [];

    return PRODUCTS.filter(product =>
      `${product.name} ${product.description} ${product.tag}`.toLocaleLowerCase('es').includes(query)
    ).slice(0, 6);
  }, [searchQuery]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const submitSearch = () => {
    if (!searchQuery.trim()) return;
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <input
        id={id}
        name={id}
        type="search"
        role="combobox"
        aria-label="Buscar productos"
        aria-autocomplete="list"
        aria-expanded={isOpen && suggestions.length > 0}
        aria-controls={listId}
        value={searchQuery}
        onChange={event => {
          setSearchQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submitSearch();
          } else if (event.key === 'ArrowDown' && suggestions.length > 0) {
            event.preventDefault();
            document.getElementById(listId)?.querySelector<HTMLAnchorElement>('a')?.focus();
          } else if (event.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        placeholder="Buscar producto..."
        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full text-xs focus:ring-2 focus:ring-green-500/20 transition-all bg-slate-50/50"
      />
      {isOpen && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sugerencias de productos"
          className="absolute z-[120] top-full mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          {suggestions.map(product => (
            <li key={product.id} role="option" aria-selected="false">
              <Link
                to={productPath(product)}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-green-50 focus:bg-green-50 focus:outline-none"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt=""
                    className="h-12 w-12 flex-none rounded-lg bg-slate-100 object-contain p-1"
                  />
                ) : (
                  <span aria-hidden="true" className="h-12 w-12 flex-none rounded-lg bg-slate-100" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-slate-800">{product.name}</span>
                  <span className="block truncate text-[10px] text-slate-500">
                    https://pinturasdiamante.com{productPath(product)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { totalItems, setIsCartOpen, cart, totalPrice } = useCart();

  const isActive = (path: string) => location.pathname === path;
  const isCatalogActive = location.pathname.startsWith(CATALOG_PATH) ||
    location.pathname.startsWith('/categoria');

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
    <nav className={`w-full z-[90] transition-all duration-300 border-b ${isSticky ? 'fixed top-0 bg-white/95 backdrop-blur-md shadow-sm' : 'relative bg-green-600/10 border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-4">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent uppercase tracking-tight">
              Diamante Pinturas Oaxaca
            </Link>
            <SearchAutocomplete id="search" className="hidden sm:block ml-4 w-64" />
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-xs font-bold ${isActive('/') ? 'text-green-600' : 'text-slate-500'}`}>Sobre Nosotros</Link>

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
                  <Link to={CATALOG_PATH} onClick={() => setIsCatalogOpen(false)} className="block px-4 py-2 text-xs font-bold text-green-600 hover:bg-green-50">Ver Todo el Catálogo</Link>
                  <div className="h-px bg-slate-100 my-1" />
                  {CATEGORIES.map(cat => (
                    <Link key={cat.id} to={categoryPath(cat.id)} onClick={() => setIsCatalogOpen(false)} className="block px-4 py-2 text-xs text-slate-600 hover:bg-green-50 hover:text-green-600 uppercase font-semibold">
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

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-400"
            aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-navigation" className="md:hidden bg-white border-b border-slate-200 max-h-[calc(100vh-64px)] overflow-y-auto">
          {/* Buscador móvil */}
          <div className="px-4 py-3 border-b border-slate-100">
            <SearchAutocomplete id="search-mobile" className="w-full" />
          </div>

          {/* Menú de navegación */}
          <div className="px-2 pt-2 pb-3 space-y-1 border-b border-slate-100">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-500 hover:text-green-600">Principal</Link>
            <Link to={CATALOG_PATH} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-bold text-green-600">Catálogo</Link>
            {CATEGORIES.map(cat => (
              <Link key={cat.id} to={categoryPath(cat.id)} onClick={() => setIsOpen(false)} className="block px-6 py-1.5 text-xs text-slate-400 uppercase hover:text-slate-600">{cat.name}</Link>
            ))}
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-500 hover:text-green-600">Contactanos</Link>
          </div>

          {/* Mini Carrito */}
          <div className="px-4 py-4 space-y-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Tu Carrito</h3>
              <span className="text-xs font-black bg-red-600 text-white px-2 py-1 rounded-full">{totalItems}</span>
            </div>
            
            {cart.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Tu carrito está vacío</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.cartItemId || item.id} className="flex justify-between items-start text-xs p-2 bg-slate-50 rounded">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-slate-500 text-[10px]">Cant: {item.quantity}</p>
                      {item.color && <p className="text-blue-600 font-bold text-[10px]">{item.color}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total y Botón */}
            {cart.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center font-bold mb-3">
                  <span className="text-slate-600">Total:</span>
                  <span className="text-lg text-green-600">${totalPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {setIsCartOpen(true); setIsOpen(false);}}
                  className="w-full py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-all"
                >
                  Ver Carrito Completo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
