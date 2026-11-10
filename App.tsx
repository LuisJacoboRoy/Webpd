
import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { HelmetProvider, Helmet } from '@dr.pogodin/react-helmet';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import PaginaResena from './components/PaginaResena';
import { ReviewRedirectProvider } from './context/ReviewRedirectContext';


// Eager-loaded components (críticos para LCP)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ImageSlider from './components/ImageSlider';
import CartDrawer from './components/CartDrawer';
import HeroHeader from './components/HeroHeader';
import { CartProvider } from './context/CartContext';
import { useJsonLd } from './hooks/useJsonLd';
import { useFavicon, useBeforeUnloadWarning } from './hooks/usePersistence';
import { useScrollToTop } from './hooks/useScrollToTop';
import { BUSINESS_INFO } from './data/seo';
import { generateBusinessLocationSchemas } from './utils/localBusinessSchema';
import { CATEGORIES, PRODUCTS, SUB_CATEGORIES } from './data/products';
import { categoryPath, findProductBySlug, productPath, productSlug as getProductSlug } from './utils/routes';
import Admin from './components/admin/Admin';

declare const __BASE_URL__: string;

// Lazy-loaded route components (code splitting)
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const CatalogCategories = lazy(() => import('./components/CatalogCategories'));
const SubCategorySelector = lazy(() => import('./components/SubCategorySelector'));
const ProductList = lazy(() => import('./components/ProductList'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const SearchResults = lazy(() => import('./components/SearchResults'));
const AvisoPrivacidad = lazy(() => import('./components/AvisoPrivacidad'));
const BusinessLocationPage = lazy(() => import('./components/BusinessLocationPage'));

const REVIEW_EXIT_PROMPT_KEY = 'webpd-review-exit-prompt-shown';

const getHistoryIndex = (state: unknown): number | null => {
  if (typeof state !== 'object' || state === null || !('idx' in state)) return null;
  return typeof state.idx === 'number' ? state.idx : null;
};

const hasShownReviewExitPrompt = (): boolean => {
  try {
    return window.localStorage.getItem(REVIEW_EXIT_PROMPT_KEY) === 'true';
  } catch (error) {
    console.error('No se pudo consultar si ya se mostró el aviso de reseña.', error);
    return false;
  }
};

const markReviewExitPromptShown = (): void => {
  try {
    window.localStorage.setItem(REVIEW_EXIT_PROMPT_KEY, 'true');
  } catch (error) {
    console.error('No se pudo guardar que ya se mostró el aviso de reseña.', error);
  }
};

const LegacyProductRedirect: React.FC = () => {
  const { productId = '' } = useParams<{ productId: string }>();
  const product = PRODUCTS.find(item => item.id === productId);
  return <Navigate to={product ? productPath(product) : '/'} replace />;
};

const LegacyCategoryRedirect: React.FC = () => {
  const { categoryId = '' } = useParams<{ categoryId: string }>();
  const category = CATEGORIES.find(item => item.id === categoryId);
  return <Navigate to={category ? categoryPath(categoryId) : '/'} replace />;
};

const LegacySubCategoryRedirect: React.FC = () => {
  const { categoryId = '', subCategoryId = '' } = useParams<{
    categoryId: string;
    subCategoryId: string;
  }>();
  const subCategory = SUB_CATEGORIES.find(item =>
    item.categoryId === categoryId && item.id === subCategoryId
  );
  return <Navigate to={subCategory ? categoryPath(categoryId, subCategoryId) : '/'} replace />;
};

const ProductSlugRedirect: React.FC = () => {
  const { productSlug = '' } = useParams<{ productSlug: string }>();
  const product = findProductBySlug(productSlug);
  if (!product) return <Navigate to="/" replace />;
  return productSlug === getProductSlug(product)
    ? <ProductDetail />
    : <Navigate to={productPath(product)} replace />;
};

// Loading component para Suspense
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const SiteContent: React.FC = () => {
  // Scroll automático al inicio cuando cambia la ruta
  useScrollToTop();

  // Schema Organization con múltiples ubicaciones
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BUSINESS_INFO.url}/#organization`,
    'name': BUSINESS_INFO.name,
    'brand': {
      '@type': 'Brand',
      '@id': `${BUSINESS_INFO.url}/#brand`,
      'name': 'Diamante Pinturas'
    },
    'description': BUSINESS_INFO.description,
    'url': `${BUSINESS_INFO.url}/`,
    'logo': BUSINESS_INFO.logo,
    'email': BUSINESS_INFO.email,
    'telephone': BUSINESS_INFO.phone,
    'sameAs': BUSINESS_INFO.sameAs,
    'areaServed': [
      {
        '@type': 'City',
        'name': 'Oaxaca'
      }
    ],
    'location': generateBusinessLocationSchemas().map(({ '@id': id }) => ({ '@id': id }))
  });

  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BUSINESS_INFO.url}/#website`,
    'url': `${BUSINESS_INFO.url}/`,
    'name': BUSINESS_INFO.name,
    'publisher': { '@id': `${BUSINESS_INFO.url}/#organization` },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${BUSINESS_INFO.url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <HeroHeader />
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<LoadingComponent />}>
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/sucursales/:locationId" element={<BusinessLocationPage />} />
            <Route path="/aviso-de-privacidad" element={<AvisoPrivacidad />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/catalogo" element={<CatalogCategories />} />
            <Route path="/categoria/:categoryId" element={<SubCategorySelector />} />
            <Route path="/categoria/:categoryId/:subCategoryId" element={<ProductList />} />
            <Route path="/producto/:productSlug" element={<ProductSlugRedirect />} />
            <Route path="/catalog" element={<Navigate to="/catalogo/" replace />} />
            <Route path="/catalog/:categoryId" element={<LegacyCategoryRedirect />} />
            <Route path="/catalog/:categoryId/:subCategoryId" element={<LegacySubCategoryRedirect />} />
            <Route path="/product/:productId" element={<LegacyProductRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <ImageSlider />
      <Footer />
      <CartDrawer />
    </div>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const [showReviewExitPrompt, setShowReviewExitPrompt] = useState(false);
  const reviewDialogRef = useRef<HTMLDialogElement>(null);
  const promptShownThisPage = useRef(false);
  const currentHistoryEntry = useRef({
    href: window.location.href,
    state: window.history.state,
    index: getHistoryIndex(window.history.state)
  });

  currentHistoryEntry.current = {
    href: window.location.href,
    state: window.history.state,
    index: getHistoryIndex(window.history.state)
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const previousIndex = currentHistoryEntry.current.index;
      const targetIndex = getHistoryIndex(event.state);
      const targetUrl = new URL(window.location.href);

      if (
        !window.matchMedia('(pointer: coarse)').matches ||
        previousIndex === null ||
        targetIndex === null ||
        targetIndex >= previousIndex ||
        targetUrl.origin !== window.location.origin ||
        promptShownThisPage.current ||
        hasShownReviewExitPrompt()
      ) {
        return;
      }

      event.stopImmediatePropagation();
      window.history.pushState(
        currentHistoryEntry.current.state,
        '',
        currentHistoryEntry.current.href
      );
      promptShownThisPage.current = true;
      markReviewExitPromptShown();
      setShowReviewExitPrompt(true);
    };

    window.addEventListener('popstate', handlePopState, true);
    return () => window.removeEventListener('popstate', handlePopState, true);
  }, []);

  useEffect(() => {
    if (showReviewExitPrompt && !reviewDialogRef.current?.open) {
      reviewDialogRef.current?.showModal();
    }
  }, [showReviewExitPrompt]);

  const handleReviewDialogClose = () => {
    setShowReviewExitPrompt(false);
    window.history.back();
  };

  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  return (
    <>
      <style>{`
        dialog.review-exit-dialog:modal {
          overscroll-behavior: contain;
        }
        dialog.review-exit-dialog::backdrop {
          overflow: hidden;
          overscroll-behavior: contain;
        }
      `}</style>
      {isAdminRoute ? <Admin /> : <SiteContent />}
      {showReviewExitPrompt && (
        <dialog
          ref={reviewDialogRef}
          aria-labelledby="review-exit-title"
          className="review-exit-dialog fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl backdrop:bg-slate-950/60"
          onClose={handleReviewDialogClose}
        >
          <h2 id="review-exit-title" className="mb-2 text-xl font-bold text-slate-900">
            Antes de irte
          </h2>
          <p className="mb-5 text-slate-600">
            ¿Te gustaría compartir tu experiencia con Pinturas Diamante?
          </p>
          <button
            type="button"
            onClick={() => window.location.assign('/reseña')}
            className="mb-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Dejar reseña en Google
          </button>
          <form method="dialog">
            <button
              type="submit"
              value="continue"
              autoFocus
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            >
              Continuar navegación
            </button>
          </form>
        </dialog>
      )}
    </>
  );
};

const App: React.FC = () => {
  const helmetContext = {};
  let currentPath = window.location.pathname;

  try {
    currentPath = decodeURIComponent(currentPath);
  } catch {
    currentPath = window.location.pathname;
  }

  const isReviewPage = currentPath === '/reseña';

  // Establecer favicon
  useFavicon('/favicon.svg');

  return (
    <HelmetProvider context={helmetContext}>
      <CartProvider>
        <ReviewRedirectProvider>
          <Helmet>
            <html lang="es" />
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta httpEquiv="x-ua-compatible" content="IE=edge" />
            <meta name="theme-color" content="#3b82f6" />

            {/* Open Graph básico */}
            <meta property="og:site_name" content={BUSINESS_INFO.name} />
            <meta property="og:locale" content="es_MX" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="@DiamantePinturas" />

            {/* Preconnect para mejorar performance */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://cdn.tailwindcss.com" />

            {/* Apple touch icon */}
            <link rel="apple-touch-icon" href={BUSINESS_INFO.logo} />

            {/* Favicon */}
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="manifest" href="/site.webmanifest" />
          </Helmet>
          {isReviewPage ? (
            <PaginaResena />
          ) : (
            <BrowserRouter basename={__BASE_URL__}>
              <AppContent />
            </BrowserRouter>
          )}
          <Analytics />
          <SpeedInsights />
        </ReviewRedirectProvider>
      </CartProvider>
    </HelmetProvider>
  );
};

export default App;
