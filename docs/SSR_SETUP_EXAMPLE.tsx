/**
 * Example: Configuración SSR con Express + React
 * Este es un ejemplo de cómo implementar SSR en el futuro
 * 
 * Estructura recomendada:
 * - entry-client.tsx: punto de entrada del cliente
 * - entry-server.tsx: punto de entrada del servidor
 * - server.ts: servidor Express
 */

// ============================================
// 1. ENTRY-CLIENT.TSX (Cliente)
// ============================================

import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

// Hidratar desde el HTML renderizado en servidor
hydrateRoot(
  document.getElementById('root')!,
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

// ============================================
// 2. ENTRY-SERVER.TSX (Servidor)
// ============================================

import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

export async function renderApp(url: string) {
  const helmetContext = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  );

  const helmet = helmetContext.helmet;

  return {
    html,
    helmet: {
      htmlAttributes: helmet.htmlAttributes.toString(),
      title: helmet.title.toString(),
      meta: helmet.meta.toString(),
      link: helmet.link.toString(),
      script: helmet.script.toString(),
    }
  };
}

// ============================================
// 3. SERVER.TS (Servidor Express)
// ============================================

import express from 'express';
import { renderApp } from './entry-server';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static('dist/client'));

// Template HTML
const template = fs.readFileSync(path.resolve('dist/client/index.html'), 'utf-8');

// Ruta catch-all para SSR
app.get('*', async (req, res) => {
  try {
    const { html, helmet } = await renderApp(req.url);

    const finalHtml = template
      .replace(
        /<\/head>/,
        `
        ${helmet.htmlAttributes}
        ${helmet.title}
        ${helmet.meta}
        ${helmet.link}
        ${helmet.script}
        </head>
        `
      )
      .replace(
        '<div id="root"></div>',
        `<div id="root">${html}</div>`
      );

    res.set({ 'Content-Type': 'text/html' });
    res.send(finalHtml);
  } catch (e) {
    console.error('SSR error:', e);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`SSR Server running on http://localhost:${PORT}`);
});

// ============================================
// 4. VITE CONFIG PARA SSR
// ============================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    // Build del cliente
    lib: {
      entry: path.resolve(__dirname, 'src/entry-client.tsx'),
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        dir: 'dist/client',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },
    // Build del servidor
    ssr: {
      external: ['express'],
    }
  },
  ssr: {
    external: ['express'],
    noExternal: ['react-helmet-async']
  }
});

// ============================================
// 5. APP.TSX ACTUALIZADO PARA SSR
// ============================================

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Componentes
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy loaded
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));

const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <>
      <Helmet>
        <html lang="es" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<LoadingComponent />}>
            <Routes>
              <Route path="/" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              {/* Más rutas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default App;

// ============================================
// 6. PACKAGE.JSON SCRIPTS
// ============================================

{
  "scripts": {
    // Desarrollo
    "dev": "vite",
    
    // Build cliente
    "build:client": "tsc && vite build",
    
    // Build servidor
    "build:server": "tsc --module esnext src/server.ts src/entry-server.tsx",
    
    // Build completo (cliente + servidor)
    "build": "npm run build:client && npm run build:server",
    
    // Ejecutar servidor SSR
    "start": "node dist/server.js",
    
    // Preview
    "preview": "vite preview",
    
    // Desarrollo con SSR (nodemon)
    "dev:ssr": "nodemon --exec 'tsx' src/server.ts"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.13.0",
    "react-helmet-async": "^2.0.4",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.8",
    "vite": "^6.2.0",
    "nodemon": "^3.0.2",
    "tsx": "^4.7.0"
  }
}

// ============================================
// 7. ENVIRONMENT VARIABLES
// ============================================

// .env (Desarrollo)
VITE_API_URL=http://localhost:3000
PORT=3000
NODE_ENV=development

// .env.production
VITE_API_URL=https://pinturasdiamante.com
PORT=3000
NODE_ENV=production

// ============================================
// 8. BENEFITS DE ESTA SETUP
// ============================================

/**
 * ✅ SEO Mejorado
 *   - Meta tags renderizados en servidor
 *   - JSON-LD visible en HTML
 *   - Canonical URLs correctas
 * 
 * ✅ Performance
 *   - First Paint más rápido
 *   - Lazy loading de componentes
 *   - Code splitting automático
 * 
 * ✅ Developer Experience
 *   - Hot reload con Vite
 *   - TypeScript full support
 *   - Error boundaries claros
 * 
 * ✅ Flexibilidad
 *   - Fácil agregar middlewares Express
 *   - Integración con APIs
 *   - Caching en servidor
 */

// ============================================
// 9. TESTING SSR
// ============================================

// test/ssr.test.ts
import { renderApp } from '../src/entry-server';

describe('SSR Rendering', () => {
  test('should render without errors', async () => {
    const { html } = await renderApp('/');
    expect(html).toContain('Pinturas Diamante');
  });

  test('should include meta tags', async () => {
    const { helmet } = await renderApp('/');
    expect(helmet.title).toContain('Pinturas Diamante');
  });

  test('should handle dynamic routes', async () => {
    const { html } = await renderApp('/product/5');
    expect(html).toBeTruthy();
  });
});

// ============================================
// 10. DEPLOY (Vercel, Netlify, Heroku)
// ============================================

// vercel.json (Vercel)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@vite_api_url"
  }
}

// netlify.toml (Netlify con servidor)
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist/client"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200
