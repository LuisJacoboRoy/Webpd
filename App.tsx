
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from '@dr.pogodin/react-helmet';


// Eager-loaded components (críticos para LCP)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ImageSlider from './components/ImageSlider';
import CartDrawer from './components/CartDrawer';
import HeroHeader from './components/HeroHeader';
import { CartProvider } from './context/CartContext';
import { useJsonLd } from './hooks/useJsonLd';
import { useFavicon, useBeforeUnloadWarning } from './hooks/usePersistence';
import { BUSINESS_INFO, BUSINESS_LOCATIONS } from './data/seo';

// Lazy-loaded route components (code splitting)
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const CatalogCategories = lazy(() => import('./components/CatalogCategories'));
const SubCategorySelector = lazy(() => import('./components/SubCategorySelector'));
const ProductList = lazy(() => import('./components/ProductList'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));

// Loading component para Suspense
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const AppContent: React.FC = () => {
  // Schema Organization con múltiples ubicaciones
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': BUSINESS_INFO.name,
    'description': BUSINESS_INFO.description,
    'url': BUSINESS_INFO.url,
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

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <HeroHeader />
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<LoadingComponent />}>
            <Routes>
              <Route path="/" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/catalog" element={<CatalogCategories />} />
              <Route path="/catalog/:categoryId" element={<SubCategorySelector />} />
              <Route path="/catalog/:categoryId/:subCategoryId" element={<ProductList />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <ImageSlider />
        <Footer />
        <CartDrawer />
      </div>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  const helmetContext = {};

  // Establecer favicon
  useFavicon('/favicon.svg');

  return (
    <HelmetProvider context={helmetContext}>
      <CartProvider>
        <Helmet>
          <html lang="es" />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta httpEquiv="x-ua-compatible" content="IE=edge" />
          <meta name="theme-color" content="#3b82f6" />

          {/* Open Graph básico */}
          <meta property="og:site_name" content={BUSINESS_INFO.name} />
          <meta property="og:locale" content="es_MX" />
          <meta property="og:type" content="website" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:creator" content="@DiamantePinturas" />

          {/* SEO básico */}
          <meta name="description" content={BUSINESS_INFO.description} />
          <meta name="keywords" content="pinturas, diamante, oaxaca, automotriz, maderas, decorativo" />
          <meta name="author" content={BUSINESS_INFO.name} />

          {/* Preconnect para mejorar performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://cdn.tailwindcss.com" />

          {/* Canonical por defecto */}
          <link rel="canonical" href={BUSINESS_INFO.url} />

          {/* Apple touch icon */}
          <link rel="apple-touch-icon" href={BUSINESS_INFO.logo} />

          {/* Favicon */}
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="manifest" href="/site.webmanifest" />
        </Helmet>
        <AppContent />
      </CartProvider>
    </HelmetProvider>
  );
};

export default App;
