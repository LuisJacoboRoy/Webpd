
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export const useOrder = () => {
  const { cart, clearCart, totalPrice } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    setIsOrdering(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log('Order placed for:', cart, 'Total:', totalPrice);
    
    clearCart();
    setIsOrdering(false);
    setOrderSuccess(true);
    
    setTimeout(() => setOrderSuccess(false), 5000);
  };

  return { placeOrder, isOrdering, orderSuccess };
};
