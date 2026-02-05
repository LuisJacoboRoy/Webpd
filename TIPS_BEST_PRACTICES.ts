// ============================================
// TIPS Y MEJORES PRÁCTICAS
// Persistencia, HTTPS, Favicons
// ============================================

/*
═══════════════════════════════════════════════════════════════════════════════
  1. PERSISTENCIA - MEJORES PRÁCTICAS
═══════════════════════════════════════════════════════════════════════════════
*/

// ✅ HAZLO: Validar antes de guardar
useEffect(() => {
  try {
    localStorage.setItem('diamante_cart', JSON.stringify(cart));
  } catch (error) {
    // QuotaExceededError, SecurityError, etc.
    console.warn('localStorage lleno o no disponible');
  }
}, [cart]);

// ❌ NO HAGAS: Guardar datos grandes sin límite
// El localStorage tiene límite (~5-10MB)
// Usar solo datos esenciales (carrito, preferencias)

// ✅ HAZLO: Sincronizar entre pestañas
window.addEventListener('storage', (e) => {
  if (e.key === 'diamante_cart') {
    // Carrito cambió en otra pestaña
    const updatedCart = JSON.parse(e.newValue);
    setCart(updatedCart);
  }
});

// ✅ HAZLO: Limpiar datos obsoletos
function cleanOldCartData() {
  const cart = JSON.parse(localStorage.getItem('diamante_cart') || '[]');
  const validCart = cart.filter(item => item.id && item.quantity > 0);
  localStorage.setItem('diamante_cart', JSON.stringify(validCart));
}

/*
═══════════════════════════════════════════════════════════════════════════════
  2. HTTPS - MEJORES PRÁCTICAS
═══════════════════════════════════════════════════════════════════════════════
*/

// ✅ HAZLO: Forzar HTTPS en producción
if (window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
  window.location.href = 'https:' + window.location.href.substring(5);
}

// ✅ HAZLO: Usar strict CSP
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' https:; 
               script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">

// ✅ HAZLO: Rotar certificados regularmente
// Los certificados autofirmados expiran en 365 días
// Regenerar anualmente: bash generate-certs.sh

// ✅ HAZLO: Usar SRI (Subresource Integrity) para CDNs
<script src="https://cdn.example.com/script.js"
        integrity="sha384-xyz..."
        crossorigin="anonymous"></script>

// ❌ NO HAGAS: Mezclar HTTP y HTTPS
// Todas las conexiones deben ser HTTPS en producción

/*
═══════════════════════════════════════════════════════════════════════════════
  3. FAVICONS - MEJORES PRÁCTICAS
═══════════════════════════════════════════════════════════════════════════════
*/

// ✅ HAZLO: Múltiples formatos para compatibilidad
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">

// ✅ HAZLO: Icono optimizado para tamaños pequeños
// En favicon.svg:
// - Simplificar diseño (menos detalles)
// - Usar colores sólidos
// - Buena visibilidad en 16x16 píxeles
// - Contraste alto

// ✅ HAZLO: PWA manifest completo
{
  "name": "Pinturas Diamante Oaxaca",
  "short_name": "Diamante",
  "description": "Soluciones de pintura de alta gama",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/favicon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/favicon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

// ✅ HAZLO: Actualizar favicon dinámicamente
export const useFavicon = (path: string) => {
  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]');
    if (link) {
      link.setAttribute('href', path);
    }
  }, [path]);
};

// Uso: useFavicon('/favicon-error.png') en error state

/*
═══════════════════════════════════════════════════════════════════════════════
  4. MANEJO DE ERRORES
═══════════════════════════════════════════════════════════════════════════════
*/

// ✅ HAZLO: Fallback si localStorage falla
function safeGetFromStorage(key: string, defaultValue: any) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    // Posibles errores:
    // - QuotaExceededError: localStorage lleno
    // - SecurityError: no permitido (modo privado)
    // - SyntaxError: JSON inválido
    console.error(`Error al leer ${key}:`, error);
    return defaultValue;
  }
}

// ✅ HAZLO: Detectar modo privado/incognito
async function isPrivateMode() {
  try {
    const test = '__private_mode_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return false;
  } catch (e) {
    return true;
  }
}

/*
═══════════════════════════════════════════════════════════════════════════════
  5. PERFORMANCE TIPS
═══════════════════════════════════════════════════════════════════════════════
*/

// ✅ HAZLO: Lazy load favicons
// favicon.svg se carga automáticamente
// Pero puedes preload si es crítico:
<link rel="preload" as="image" href="/favicon.svg">

// ✅ HAZLO: Comprimir imágenes del manifest
// Usar WebP para favicon de app:
{
  "src": "/favicon-192x192.webp",
  "sizes": "192x192",
  "type": "image/webp"
}

// ✅ HAZLO: Cachear localStorage agresivamente
// El navegador cachea localStorage automáticamente
// Pero reducir tamaño:
const cartSnapshot = cart.map(item => ({
  id: item.id,
  quantity: item.quantity
  // NO guardar datos completos del producto
}));

/*
═══════════════════════════════════════════════════════════════════════════════
  6. TESTING
═══════════════════════════════════════════════════════════════════════════════
*/

// ✅ Test: Persistencia del carrito
describe('Cart Persistence', () => {
  it('should persist cart to localStorage', () => {
    const cart = [{ id: '1', quantity: 2, ... }];
    localStorage.setItem('diamante_cart', JSON.stringify(cart));
    
    const restored = JSON.parse(localStorage.getItem('diamante_cart')!);
    expect(restored).toEqual(cart);
  });

  it('should handle empty cart', () => {
    localStorage.removeItem('diamante_cart');
    const cart = JSON.parse(localStorage.getItem('diamante_cart') || '[]');
    expect(cart).toEqual([]);
  });

  it('should handle corrupted data', () => {
    localStorage.setItem('diamante_cart', 'invalid json');
    // Tu código debe manejarlo sin crash
  });
});

// ✅ Test: Headers de seguridad
describe('Security Headers', () => {
  it('should have HSTS header', async () => {
    const response = await fetch('/');
    expect(response.headers.get('Strict-Transport-Security')).toBeTruthy();
  });

  it('should have CSP header', async () => {
    const response = await fetch('/');
    expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
  });
});

/*
═══════════════════════════════════════════════════════════════════════════════
  7. DEBUGGING
═══════════════════════════════════════════════════════════════════════════════
*/

// 🔍 Ver qué está en localStorage:
console.log(JSON.parse(localStorage.getItem('diamante_cart')));

// 🔍 Monitorear cambios en localStorage:
window.addEventListener('storage', (e) => {
  console.log(`${e.key} cambió a:`, e.newValue);
});

// 🔍 Verificar uso de localStorage:
console.log(`Bytes usados: ${JSON.stringify(localStorage).length}`);

// 🔍 Ver security headers:
fetch('/', { mode: 'no-cors' }).then(r => {
  console.log('Headers:', [...r.headers.entries()]);
});

// 🔍 Verificar certificado HTTPS:
// En DevTools > Security tab > View certificate

/*
═══════════════════════════════════════════════════════════════════════════════
  8. CHECKLIST DE PRODUCCIÓN
═══════════════════════════════════════════════════════════════════════════════
*/

// Antes de hacer deploy:

[ ] localStorage limpio (sin datos de desarrollo)
[ ] HTTPS forzado en producción
[ ] Certificados SSL válidos
[ ] Headers de seguridad correctos
[ ] Favicon cargando correctamente
[ ] PWA manifest es válido
[ ] Icons del manifest existen
[ ] Cache control configurado
[ ] No hay console errors
[ ] Carrito persiste correctamente
[ ] Google Rich Results valida OK
[ ] PageSpeed Insights score > 90
[ ] Lighthouse audit passed

/*
═══════════════════════════════════════════════════════════════════════════════
  9. TROUBLESHOOTING COMÚN
═══════════════════════════════════════════════════════════════════════════════
*/

// PROBLEMA: localStorage full
// SOLUCIÓN: Limpiar datos viejos o aumentar storage
localStorage.clear(); // Última opción

// PROBLEMA: HTTPS mixed content warning
// SOLUCIÓN: Asegurar todos los recursos sean HTTPS
// No cargar imágenes de http://

// PROBLEMA: Favicon blinking
// SOLUCIÓN: Pre-load favicon en head
<link rel="preload" as="image" href="/favicon.svg">

// PROBLEMA: PWA no instala
// SOLUCIÓN: 
// 1. Requerir HTTPS (en dev puede no funcionar)
// 2. Validar manifest.json
// 3. Verificar icons en 192x192 y 512x512

// PROBLEMA: CSP blocking resources
// SOLUCIÓN: Actualizar CSP meta tag o usar nonce
<script nonce="rnd123">...</script>

/*
═══════════════════════════════════════════════════════════════════════════════
  10. RECURSOS Y REFERENCIAS
═══════════════════════════════════════════════════════════════════════════════
*/

// 📚 Documentación oficial:
// localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// HTTPS: https://developer.mozilla.org/en-US/docs/Glossary/https
// PWA: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
// CSP: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
// Web Manifest: https://www.w3.org/TR/appmanifest/

// 🔧 Herramientas:
// CSP Validator: https://csp-evaluator.withgoogle.com/
// PWA Validator: https://www.pwabuilder.com/
// Security Header Check: https://securityheaders.com/
// HTTPS Test: https://www.sslshop.com/tools/ssl-checker

// 🎓 Cursos:
// Google Web Security: https://google.com/webmasters/
// Mozilla Security: https://infosec.mozilla.org/
// OWASP: https://owasp.org/

export default {
  category: 'Best Practices',
  topics: [
    'Persistencia',
    'HTTPS',
    'Favicons',
    'PWA',
    'Security',
    'Performance'
  ],
  lastUpdated: '2026-02-05'
};
