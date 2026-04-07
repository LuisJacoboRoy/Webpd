/**
 * EJEMPLOS PRÁCTICOS DE INTEGRACIÓN DE MICROFORMATOS
 * 
 * Copiar y adaptar estos ejemplos en tus componentes
 * para activar rich snippets y mejorar CTR
 */

// ============================================
// 1. EXAMPLE: App.tsx / Página Principal
// ============================================

import React, { useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { generateOrganizationSchema, generateBreadcrumbSchema } from '../utils/schemaGenerators';

export const AppExample = () => {
  const organizationSchema = generateOrganizationSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { position: 1, name: 'Inicio', url: 'https://pinturasdiamante.com/#/' }
  ]);

  return (
    <div>
      <Helmet>
        {/* Organization Schema - Solo una vez en la app */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* Breadcrumb Schema - Para página principal */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Helmet>
      
      {/* Contenido normal */}
      <h1>Pinturas Diamante - Inicio</h1>
    </div>
  );
};

// ============================================
// 2. EXAMPLE: ProductDetail.tsx - Mejorado
// ============================================

import { generateProductSchema, generateBreadcrumbSchema } from '../utils/schemaGenerators';

export const ProductDetailExample = ({ product }: any) => {
  const productSchema = generateProductSchema({
    id: product.id,
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.categoryName,
    subCategory: product.subCategoryName,
    rating: 4.8,
    reviewCount: 127,
    price: 'Consultar', // O el precio si lo tienes
    availability: 'InStock',
    sku: product.sku || `DIAMANTE-${product.id.toUpperCase()}`
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { position: 1, name: 'Inicio', url: 'https://pinturasdiamante.com/#/' },
    { position: 2, name: 'Catálogo', url: 'https://pinturasdiamante.com/#/catalog' },
    { position: 3, name: product.categoryName, url: `https://pinturasdiamante.com/#/catalog/${product.categoryId}` },
    { position: 4, name: product.subCategoryName, url: `https://pinturasdiamante.com/#/catalog/${product.categoryId}/${product.subCategoryId}` },
    { position: 5, name: product.name, url: `https://pinturasdiamante.com/#/product/${product.id}` }
  ]);

  return (
    <>
      <Helmet>
        {/* Product Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        
        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* Meta tags estándar */}
        <title>{product.name} - Pinturas Diamante</title>
        <meta name="description" content={product.description.substring(0, 160)} />
        <meta property="og:image" content={product.image} />
        <link rel="canonical" href={`https://pinturasdiamante.com/#/product/${product.id}`} />
      </Helmet>

      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        {/* Resto del contenido */}
      </div>
    </>
  );
};

// ============================================
// 3. EXAMPLE: CatalogCategories.tsx - Mejorado
// ============================================

import { generateProductCollectionSchema, generateBreadcrumbSchema } from '../utils/schemaGenerators';

export const CatalogCategoriesExample = ({ category }: any) => {
  const collectionSchema = generateProductCollectionSchema(
    category.name,
    category.description,
    20, // number of products
    category.image,
    'https://pinturasdiamante.com'
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { position: 1, name: 'Inicio', url: 'https://pinturasdiamante.com/#/' },
    { position: 2, name: 'Catálogo', url: 'https://pinturasdiamante.com/#/catalog' },
    { position: 3, name: category.name, url: `https://pinturasdiamante.com/#/catalog/${category.id}` }
  ]);

  return (
    <>
      <Helmet>
        {/* ProductCollection Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
        
        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <title>{category.name} - Catálogo - Pinturas Diamante</title>
        <meta name="description" content={category.description} />
        <link rel="canonical" href={`https://pinturasdiamante.com/#/catalog/${category.id}`} />
      </Helmet>

      <h1>{category.name}</h1>
      <p>{category.description}</p>
      {/* Lista de productos */}
    </>
  );
};

// ============================================
// 4. EXAMPLE: Contact.tsx - Con ContactPoint
// ============================================

import { generateContactSchema } from '../utils/schemaGenerators';

export const ContactExample = () => {
  const contactSchema = generateContactSchema();

  return (
    <>
      <Helmet>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
        />
        <title>Contacto - Pinturas Diamante</title>
        <meta name="description" content="Contacta con Pinturas Diamante. Teléfono, email y ubicación." />
      </Helmet>

      <div>
        <h1>Contáctanos</h1>
        <section>
          <h2>Información de Contacto</h2>
          <p>
            <strong>Teléfono:</strong> <a href="tel:+52-951-143-3467">+52-951-143-3467</a>
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:info@pinturasdiamantemx.com">info@pinturasdiamantemx.com</a>
          </p>
          <p>
            <strong>Dirección:</strong> Avenida Ferrocarril 805-D, Oaxaca, Oaxaca 68000, México
          </p>
          <p>
            <strong>Horario:</strong> Lunes a Viernes 8:30 AM - 6:30 PM, Sábados 8:30 AM - 4:30 PM
          </p>
        </section>

        {/* Formulario de contacto */}
        <form>
          <input type="text" placeholder="Tu nombre" required />
          <input type="email" placeholder="Tu email" required />
          <textarea placeholder="Tu mensaje" required />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </>
  );
};

// ============================================
// 5. EXAMPLE: FAQPage - Para Featured Snippets
// ============================================

import { generateFAQSchema } from '../utils/schemaGenerators';

export const FAQPageExample = () => {
  const faqSchema = generateFAQSchema([
    {
      question: '¿Cuál es la diferencia entre pintura automotriz y decorativo?',
      answer: 'La pintura automotriz tiene mayor resistencia a radiación UV, químicos y rayones, está diseñada para resistir condiciones externas severas. La pintura decorativo está optimizada para uso interno, es lavable pero menos resistente.'
    },
    {
      question: '¿Cuál es la durabilidad de los productos Pinturas Diamante?',
      answer: 'Depende del tipo: Las pinturas automotrices duran 7-10 años con mantenimiento. Las maderas 5-8 años. Las decorativas 4-6 años. Todo bajo condiciones normales de uso.'
    },
    {
      question: '¿Ofrecen servicio de consultoría?',
      answer: 'Sí, nuestro equipo de expertos está disponible para asesorarte sobre el producto correcto para tu necesidad. Contáctanos para una consulta personalizada.'
    },
    {
      question: '¿Hacen entregas a domicilio?',
      answer: 'Sí, realizamos entregas rápidas en Oaxaca. Contáctanos al +52-951-143-3467 para coordinar la entrega de tu pedido.'
    },
    {
      question: '¿Cuál es la cobertura de los productos?',
      answer: 'La cobertura varía: Pinturas decorativas 6-8 m²/litro. Barnices 8-12 m²/litro. Esmaltes automotrices 10-15 m²/litro. Consulta la ficha técnica de cada producto.'
    }
  ]);

  return (
    <>
      <Helmet>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <title>Preguntas Frecuentes - Pinturas Diamante</title>
      </Helmet>

      <div>
        <h1>Preguntas Frecuentes</h1>
        
        <section className="faq-list">
          <h2>¿Cuál es la diferencia entre pintura automotriz y decorativo?</h2>
          <p>La pintura automotriz tiene mayor resistencia a radiación UV, químicos y rayones, está diseñada para resistir condiciones externas severas. La pintura decorativo está optimizada para uso interno, es lavable pero menos resistente.</p>
          
          <h2>¿Cuál es la durabilidad de los productos Pinturas Diamante?</h2>
          <p>Depende del tipo: Las pinturas automotrices duran 7-10 años con mantenimiento. Las maderas 5-8 años. Las decorativas 4-6 años. Todo bajo condiciones normales de uso.</p>
          
          {/* Más preguntas */}
        </section>
      </div>
    </>
  );
};

// ============================================
// 6. EXAMPLE: ProductList con múltiples productos
// ============================================

import { generateProductSchema } from '../utils/schemaGenerators';

export const ProductListExample = ({ products }: any) => {
  const productSchemas = products.map((product: any) =>
    generateProductSchema({
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.image,
      category: product.categoryName,
      rating: 4.8,
      reviewCount: 100,
      availability: 'InStock'
    })
  );

  return (
    <>
      <Helmet>
        {/* Inyectar todos los schemas de productos */}
        {productSchemas.map((schema, idx) => (
          <script
            key={idx}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </Helmet>

      <div className="product-grid">
        {products.map((product: any) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description.substring(0, 100)}...</p>
            <button>Ver más</button>
          </div>
        ))}
      </div>
    </>
  );
};

// ============================================
// 7. HELPER: Función para inyectar múltiples schemas
// ============================================

export const injectSchemas = (schemas: any[]) => {
  schemas.forEach((schema, index) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', `schema-${index}`);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
};

// Uso:
// injectSchemas([organizationSchema, breadcrumbSchema, productSchema]);

// ============================================
// 8. TEST: Verificar schemas inyectados
// ============================================

export const validateInjectedSchemas = () => {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const schemas: any[] = [];

  scripts.forEach(script => {
    try {
      const json = JSON.parse(script.textContent || '');
      schemas.push(json);
      console.log('✅ Schema válido encontrado:', json['@type']);
    } catch (error) {
      console.error('❌ Error al parsear schema:', script.textContent);
    }
  });

  console.log(`Total de schemas encontrados: ${schemas.length}`);
  return schemas;
};

// Ejecutar en consola del navegador para verificar:
// validateInjectedSchemas()
