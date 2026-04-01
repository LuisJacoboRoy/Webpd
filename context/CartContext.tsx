import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  // Update: Changed from productId to cartItemId to support individual color removal
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Constante para la clave del localStorage
const CART_STORAGE_KEY = 'diamante_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializar desde localStorage si existe
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.warn('Error al cargar carrito del localStorage:', error);
      return [];
    }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = (product: Product, quantity: number = 1, color?: string) => {
    // Generar un ID único para el carrito basado en el ID del producto y su color (si existe)
    const cartItemId = `${product.id}-${color || 'default'}`; // ID único basado en producto y color

    setCart((prev) => {
      const existingItem = prev.find((item) => item.cartItemId === cartItemId);

      if (existingItem) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          cartItemId,
          quantity,
          color,
        },
      ];
    });
    setIsCartOpen(true);
  };

  // Fix: Changed parameter to cartItemId to allow removing specific colors of a product
  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  // Fix: Handled optional price property with a fallback to 0 to prevent NaN results
  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  // Persistir carrito en localStorage cada vez que cambia
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn('Error al guardar carrito en localStorage:', error);
    }
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
