// ============================================
// GUÍA RÁPIDA: Persistencia, HTTPS y Favicons
// ============================================

/*
✅ IMPLEMENTACIONES COMPLETADAS:

1. PERSISTENCIA DE CARRITO
   - Carrito se guarda en localStorage
   - Se restaura automáticamente al recargar página
   - Se sincroniza en tiempo real

2. HTTPS Y SEGURIDAD
   - Configuración HTTPS en vite.config.ts
   - Headers de seguridad en index.html
   - Certificados autofirmados para desarrollo
   - Configuración .htaccess para Apache
   - Configuración Netlify y Vercel

3. FAVICONS
   - favicon.svg (SVG responsivo)
   - site.webmanifest (PWA manifest)
   - Meta tags de favicon en index.html
   - Apple touch icon

*/

// ============================================
// 1. PERSISTENCIA DE CARRITO
// ============================================

// Ubicación: context/CartContext.tsx
// 
// El carrito ahora:
// ✅ Se guarda automáticamente en localStorage cuando cambia
// ✅ Se restaura automáticamente al montar la app
// ✅ Persiste aunque cierres el navegador
// ✅ Maneja errores de localStorage

const CART_STORAGE_KEY = 'diamante_cart';

// Al montarse, restaura carrito del localStorage:
const [cart, setCart] = useState<CartItem[]>(() => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.warn('Error al cargar carrito:', error);
    return [];
  }
});

// Al cambiar el carrito, se guarda automáticamente:
useEffect(() => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn('Error al guardar carrito:', error);
  }
}, [cart]);

// ============================================
// 2. HTTPS Y SEGURIDAD
// ============================================

// 🔒 En vite.config.ts:
// El servidor detecta certificados SSL en ./certs/
// Si existen, usa HTTPS automáticamente

import fs from 'fs';

const getHttpsConfig = () => {
  const certPath = path.resolve(__dirname, './certs/cert.pem');
  const keyPath = path.resolve(__dirname, './certs/key.pem');
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    };
  }
  return false;
};

// 🔒 Headers de Seguridad en index.html:
// - Strict-Transport-Security (HSTS)
// - X-Frame-Options (clickjacking protection)
// - X-Content-Type-Options (MIME sniffing prevention)
// - Content-Security-Policy
// - Permissions-Policy

// 🔒 Archivos de configuración:
// - .htaccess (Apache)
// - netlify.toml (Netlify)
// - vercel.json (Vercel)

// ============================================
// 3. FAVICONS
// ============================================

// 📁 Archivos creados:
// - /public/favicon.svg (icono principal)
// - /public/site.webmanifest (PWA manifest)
// - .env.example (variables de entorno)

// 🎨 Icono SVG azul con "D" de Diamante:
// Cambia de color según theme-color (azul #3b82f6)

// 📱 PWA Manifest:
// - Nombre: Pinturas Diamante Oaxaca
// - Short name: Diamante
// - Display: standalone (app fullscreen)
// - Theme color: azul (#3b82f6)
// - Background color: blanco

// ============================================
// 4. GENERACIÓN DE CERTIFICADOS SSL
// ============================================

// Para desarrollo con HTTPS, generar certificados:

// 🐧 En Linux/macOS:
// bash generate-certs.sh

// 🪟 En Windows PowerShell:
// .\generate-certs.ps1

// Esto crea:
// - certs/cert.pem (certificado)
// - certs/key.pem (clave privada)

// Luego en .env.local:
HTTPS=true

// ============================================
// 5. HOOKS NUEVOS EN usePersistence.ts
// ============================================

// useFavicon()
// - Cambiar favicon dinámicamente
import { useFavicon } from './hooks/usePersistence';

useFavicon('/favicon.svg'); // En App.tsx

// useCartPersistence()
// - Hook para persistencia manual del carrito
import { useCartPersistence } from './hooks/usePersistence';

useCartPersistence(cart, (restoredCart) => {
  // Hacer algo cuando se restaura el carrito
});

// useBeforeUnloadWarning()
// - Advertir al usuario si intenta cerrar con carrito
import { useBeforeUnloadWarning } from './hooks/usePersistence';

useBeforeUnloadWarning(cart.length > 0);

// useOnlineStatus()
// - Detectar si el usuario está online/offline
import { useOnlineStatus } from './hooks/usePersistence';

const isOnline = useOnlineStatus();
if (!isOnline) console.log('Sin conexión a internet');

// ============================================
// 6. VALIDAR LA IMPLEMENTACIÓN
// ============================================

// 📋 Checklist:

// ✅ Carrito persiste:
localStorage.getItem('diamante_cart'); // Debería mostrar array

// ✅ Favicons cargados:
document.querySelector('link[rel="icon"]')?.href; // /favicon.svg

// ✅ PWA instalable:
navigator.serviceWorker.getRegistrations(); // Debería estar registrado

// ✅ Headers de seguridad:
// Abrir DevTools > Network > Headers > Response Headers
// Verificar: Strict-Transport-Security, X-Frame-Options, etc.

// ============================================
// 7. DEPLOY
// ============================================

// 🚀 Netlify:
// - netlify.toml ya configurado
// - HTTPS automático
// - Headers de seguridad incluidos

// 🚀 Vercel:
// - vercel.json ya configurado
// - HTTPS automático
// - Headers de seguridad incluidos

// 🚀 Apache:
// - .htaccess ya configurado
// - Ejecutar en public/ folder
// - Habilitar mod_rewrite

// ============================================
// 8. VARIABLES DE ENTORNO
// ============================================

// .env.local (desarrollo):
VITE_API_URL=http://localhost:3001
HTTPS=false

// .env.production:
VITE_API_URL=https://api.pinturasdiamante.com
HTTPS=true (en servidor)

// Nota: Los certificados se generan localmente
// En hosting (Netlify/Vercel), HTTPS es automático

// ============================================
// 9. TESTING MANUAL
// ============================================

// 1️⃣ Verificar persistencia del carrito:
// - Agregar producto al carrito
// - Cerrar navegador completamente
// - Abrir nuevamente
// - El carrito debería estar ahí

// 2️⃣ Verificar HTTPS en desarrollo:
// - HTTPS=true en .env.local
// - Ejecutar npm run dev
// - URL debería ser https://localhost:3000

// 3️⃣ Verificar favicon:
// - Revisar pestaña del navegador
// - Debería mostrar "D" azul
// - En DevTools, verificar favicon.svg está cargado

// 4️⃣ Verificar PWA:
// - Abrir DevTools > Application > Manifest
// - Debería mostrar sitio.webmanifest
// - "Add to home screen" debería estar disponible

// ============================================
// 10. TROUBLESHOOTING
// ============================================

// ❌ Carrito vacío después de recargar:
// - Verificar: localStorage.getItem('diamante_cart')
// - Si es null, localStorage puede estar deshabilitado
// - Verificar privacy/incognito mode

// ❌ HTTPS no funciona:
// - Verificar certificados en ./certs/
// - Ejecutar generate-certs.sh o .ps1
// - Verificar HTTPS=true en .env.local

// ❌ Favicon no aparece:
// - Cache del navegador: Ctrl+F5 (hard refresh)
// - Verificar /public/favicon.svg existe
// - Verificar index.html tiene referencia correcta

// ❌ Headers de seguridad no aparecen:
// - DevTools > Network > Headers
// - En desarrollo, algunos headers pueden no aparecer
// - En producción (Netlify/Vercel), debería estar

// ============================================

export default {
  features: [
    'Persistencia de carrito',
    'HTTPS para desarrollo',
    'Favicons y PWA',
    'Headers de seguridad',
    'Hooks reutilizables'
  ],
  files: [
    'context/CartContext.tsx',
    'hooks/usePersistence.ts',
    'vite.config.ts',
    'index.html',
    'public/favicon.svg',
    'public/site.webmanifest',
    '.env.example',
    'generate-certs.sh',
    'generate-certs.ps1',
    '.htaccess',
    'netlify.toml',
    'vercel.json'
  ]
};
