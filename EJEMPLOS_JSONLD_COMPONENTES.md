# Ejemplos de Uso - Componente JsonLd

## 📌 Opción A: Usar Hook Existente (Actual) ✅

Tu `App.tsx` **ya está usando** `useJsonLd` correctamente. No necesitas cambiar nada.

```tsx
const AppContent: React.FC = () => {
  // Hook inyecta JSON-LD en <head>
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': BUSINESS_INFO.name,
    // ... más campos
  });

  return (
    // Tu contenido
  );
};
```

✅ **Ventajas del hook**: Flexible, funcional, corriendo perfectamente
❌ **Desventajas**: No es compatible 100% con SSR en algunos casos

---

## 📌 Opción B: Usar Nuevo Componente (Recomendado para Mejor SSR)

Si quieres mejorar aún más la compatibilidad con SSR, puedes usar el nuevo componente `<JsonLd />`:

### Implementación en App.tsx

```tsx
import { JsonLd } from './components/JsonLd';
import { SEOSchemaProvider } from './components/SEOSchemaProvider';
import { BUSINESS_INFO } from './data/seo';

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Inyectar Organization schema con el componente */}
      <JsonLd 
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: BUSINESS_INFO.name,
          description: BUSINESS_INFO.description,
          url: BUSINESS_INFO.url,
          logo: BUSINESS_INFO.logo,
          email: BUSINESS_INFO.email,
          telephone: BUSINESS_INFO.phone,
          sameAs: BUSINESS_INFO.sameAs,
        }}
        id="org-schema"
      />

      {/* REST DEL CONTENIDO */}
      <HeroHeader />
      <Navbar />
      {/* ... */}
    </div>
  );
};
```

### O usar el Provider Global (Más automático)

```tsx
import { SEOSchemaProvider } from './components/SEOSchemaProvider';

const App: React.FC = () => {
  return (
    <SEOSchemaProvider pageType="home">
      <BrowserRouter>
        {/* Todos los schemas se inyectan automáticamente */}
        <AppContent />
      </BrowserRouter>
    </SEOSchemaProvider>
  );
};
```

---

## 🎯 Ejemplo 1: ProductDetail.tsx

```tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { JsonLd } from './JsonLd';
import { products } from '../data/products';

export default function ProductDetail() {
  const { productId } = useParams();
  const product = products.find(p => p.id === productId);

  if (!product) return <div>Producto no encontrado</div>;

  return (
    <>
      {/* JSON-LD Schema para el producto actual */}
      <JsonLd 
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          '@id': `https://pinturasdiamante.com/product/${product.id}`,
          name: product.name,
          description: product.description,
          image: product.images,
          brand: {
            '@type': 'Brand',
            name: 'Pinturas Diamante'
          },
          manufacturer: {
            '@type': 'Organization',
            name: 'Pinturas Diamante'
          },
          offers: {
            '@type': 'Offer',
            url: `https://pinturasdiamante.com/product/${product.id}`,
            priceCurrency: 'MXN',
            price: product.price.toString(),
            availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: 'Pinturas Diamante'
            }
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating || '4.5',
            reviewCount: product.reviewCount || '0'
          }
        }}
        id="product-detail"
      />

      {/* Contenido visual del producto */}
      <div className="product-detail-container">
        <img src={product.images[0]} alt={product.name} />
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <div className="price">${product.price} MXN</div>
        <button>Agregar al carrito</button>
      </div>
    </>
  );
}
```

---

## 🎯 Ejemplo 2: ProductList.tsx

```tsx
import React from 'react';
import { JsonLd } from './JsonLd';
import { products } from '../data/products';

export default function ProductList() {
  // Schema de lista de productos (para mejor SEO)
  const productListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        '@id': `https://pinturasdiamante.com/product/${product.id}`,
        name: product.name,
        image: product.images[0],
        offers: {
          '@type': 'Offer',
          priceCurrency: 'MXN',
          price: product.price
        }
      }
    }))
  };

  return (
    <>
      {/* Inyectar schema de lista */}
      <JsonLd data={productListSchema} id="product-list" />

      {/* Inyectar cada producto individualmente (mejor para Google) */}
      {products.map((product, idx) => (
        <JsonLd
          key={`prod-${idx}`}
          data={{
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images[0],
            offers: {
              '@type': 'Offer',
              priceCurrency: 'MXN',
              price: product.price
            }
          }}
          id={`product-${idx}`}
        />
      ))}

      {/* Grid de productos */}
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.images[0]} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">${product.price} MXN</p>
          </div>
        ))}
      </div>
    </>
  );
}
```

---

## 🎯 Ejemplo 3: Contact.tsx

```tsx
import React, { useState } from 'react';
import { JsonLd } from './JsonLd';
import { BUSINESS_INFO, BUSINESS_LOCATIONS } from '../data/seo';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // Schema de ContactPage
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contacto - Pinturas Diamante',
    url: 'https://pinturasdiamante.com/contact',
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name
    }
  };

  // Schema de Organization con ubicaciones
  const locationsSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://pinturasdiamante.com/#business',
    name: BUSINESS_INFO.name,
    image: BUSINESS_INFO.logo,
    telephone: BUSINESS_INFO.phone,
    address: BUSINESS_LOCATIONS.map(loc => ({
      '@type': 'PostalAddress',
      streetAddress: loc.address,
      addressLocality: loc.city,
      postalCode: loc.postalCode,
      addressCountry: 'MX'
    }))[0] // Primera ubicación por defecto
  };

  return (
    <>
      <JsonLd data={contactSchema} id="contact-page" />
      <JsonLd data={locationsSchema} id="contact-locations" />

      <div className="contact-container">
        <h1>Contacto</h1>
        
        <div className="contact-info">
          {BUSINESS_LOCATIONS.map(location => (
            <div key={location.id} className="location-card">
              <h3>{location.name}</h3>
              <p>{location.address}</p>
              <p>📞 {location.phone}</p>
              <p>📱 {location.mobile}</p>
              <p>⏰ {location.hours}</p>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          // Enviar formulario
        }}>
          <input 
            type="text"
            placeholder="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <textarea 
            placeholder="Mensaje"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </>
  );
}
```

---

## 🎯 Ejemplo 4: About.tsx

```tsx
import React from 'react';
import { JsonLd } from './JsonLd';
import { BUSINESS_INFO, SEO_DESCRIPTIONS } from '../data/seo';

export default function About() {
  // Schema de AboutPage
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Acerca de Pinturas Diamante',
    url: 'https://pinturasdiamante.com/about',
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
      logo: BUSINESS_INFO.logo,
      url: BUSINESS_INFO.url
    },
    author: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name
    }
  };

  return (
    <>
      <JsonLd data={aboutSchema} id="about-page" />

      <div className="about-container">
        <h1>Acerca de {BUSINESS_INFO.name}</h1>
        
        <section className="mission">
          <h2>Nuestra Misión</h2>
          <p>{BUSINESS_INFO.description}</p>
          <p>Somos especialistas en pinturas de alta gama con más de 20 años de experiencia.</p>
        </section>

        <section className="services">
          <h2>Nuestros Servicios</h2>
          <div className="service-card">
            <h3>Pintura Automotriz</h3>
            <p>{SEO_DESCRIPTIONS.automotriz}</p>
          </div>
          <div className="service-card">
            <h3>Pintura para Maderas</h3>
            <p>{SEO_DESCRIPTIONS.maderas}</p>
          </div>
          <div className="service-card">
            <h3>Pintura Decorativa</h3>
            <p>{SEO_DESCRIPTIONS.decorativo}</p>
          </div>
        </section>
      </div>
    </>
  );
}
```

---

## 📊 Esquema de Decisión

**¿Cuándo usar qué?**

| Caso | Recomendación | Razón |
|------|---------------|-------|
| App.tsx global | `SEOSchemaProvider` | Inyecta todos los schemas automáticamente |
| ProductDetail | `JsonLd` componente | Datos dinámicos basados en URL params |
| ProductList | Ambos: Provider + componente | Provider para general, componente para cada producto |
| Contact | `JsonLd` componente | Datos estáticos de ubicaciones |
| About | `JsonLd` componente | Contenido sobre la empresa |
| Search Results | `JsonLd` componente | Dinámico basado en query |

---

## ✅ Verificación Final

Para asegurar que todo funciona:

```bash
# 1. Build
npm run build

# 2. Verificar que los schemas están en el HTML
grep -o 'application/ld+json' dist/index.html | wc -l
# Deberías ver: 4 o más (Organization, WebSite, BreadcrumbList, LocalBusiness)

# 3. Preview local
npm run preview

# 4. Abrir y verificar en navegador
# Chrome DevTools → Network → index.html
# Busca: <script type="application/ld+json">

# 5. Validar en Google
# https://schema.org/validator
# Pega el HTML del preview local
```

¡Listo! Con estos ejemplos puedes integrar JSON-LD en cualquier componente de tu app. 🚀

