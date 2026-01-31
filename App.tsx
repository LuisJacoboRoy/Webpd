
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './components/About';
import Contact from './components/Contact';
import CatalogCategories from './components/CatalogCategories';
import SubCategorySelector from './components/SubCategorySelector';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ImageSlider from './components/ImageSlider';
import CartDrawer from './components/CartDrawer';
import HeroHeader from './components/HeroHeader';
import { CartProvider } from './context/CartContext';

const App: React.FC = () => {
  return (
    <CartProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <HeroHeader />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/catalog" element={<CatalogCategories />} />
              <Route path="/catalog/:categoryId" element={<SubCategorySelector />} />
              <Route path="/catalog/:categoryId/:subCategoryId" element={<ProductList />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <ImageSlider />
          <Footer />
          <CartDrawer />
        </div>
      </HashRouter>
    </CartProvider>
  );
};

export default App;
