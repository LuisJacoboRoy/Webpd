
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider, Helmet } from '@dr.pogodin/react-helmet';
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
import { BUSINESS_INFO, BUSINESS_LOCATIONS } from './data/seo';
import { CATEGORIES, PRODUCTS, SUB_CATEGORIES } from './data/products';
import { categoryPath, findProductBySlug, productPath } from './utils/routes';

declare const __BASE_URL__: string;

// Lazy-loaded route components (code splitting)
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const CatalogCategories = lazy(() => import('./components/CatalogCategories'));
const SubCategorySelector = lazy(() => import('./components/SubCategorySelector'));
const ProductList = lazy(() => import('./components/ProductList'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const SearchResults = lazy(() => import('./components/SearchResults'));

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
  return product ? <ProductDetail /> : <Navigate to="/" replace />;
};

// Loading component para Suspense
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const AppContent: React.FC = () => {
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
    'location': BUSINESS_LOCATIONS.map(loc => ({
      '@type': 'LocalBusiness',
      'name': loc.name,
      'brand': {
        '@type': 'Brand',
        '@id': `${BUSINESS_INFO.url}/#brand`,
        'name': 'Diamante Pinturas'
      },
      'url': `${BUSINESS_INFO.url}/`,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': loc.address,
        'addressCity': loc.city,
        'addressCountry': 'MX',
        'postalCode': loc.postalCode
      },
      'telephone': loc.phone,
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '08:30',
        'closes': '18:30'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': loc.latitude,
        'longitude': loc.longitude
      },
      'areaServed': {
        '@type': 'City',
        'name': loc.city,
        'areaServed': loc.radius
      }
    }))
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
        </ReviewRedirectProvider>
      </CartProvider>
    </HelmetProvider>
  );
};

export default App;
