
import React from 'react';
import { useCart } from '../context/CartContext';
import { useOrder } from '../hooks/useOrder';

const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, totalPrice } = useCart();
  const { placeOrder, isOrdering, orderSuccess } = useOrder();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Tu Carrito</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-8">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">Tu carrito está vacío.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <li key={item.id} className="py-6 flex">
                      <div className="flex-shrink-0 w-20 h-20 border border-slate-200 rounded-lg overflow-hidden">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-slate-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{item.tag}</p>
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <p className="text-slate-500 italic text-xs">Cant. {item.quantity}</p>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="font-medium text-blue-600 hover:text-blue-500"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="border-t border-slate-200 py-6 px-4 sm:px-6 bg-slate-50">
              <div className="flex justify-between text-base font-medium text-slate-900 mb-4">
                <p>Subtotal</p>
                <p>${totalPrice.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-slate-500 mb-6 italic">Precios con IVA incluido.</p>
              <button
                disabled={isOrdering}
                onClick={placeOrder}
                className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-bold text-white transition-all ${
                  isOrdering ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isOrdering ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          )}

          {orderSuccess && (
            <div className="p-4 bg-blue-50 text-blue-700 text-center font-bold">
              🎉 ¡Pedido realizado con éxito!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
