import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import { execSync } from 'child_process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Detectar si estamos en GitHub Pages
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  const base = isGitHubPages ? '/Webpd/' : '/';

  /**
   * Plugin para generar sitemaps automáticamente antes del build
   * Ejecuta el script de generación de sitemaps dinámicos
   */
  const sitemapPlugin = {
    name: 'sitemap-generator',
    async buildStart() {
      console.log('🗺️  Generando sitemaps dinámicos...');
      try {
        execSync('npm run sitemap:generate', { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ Error generando sitemaps:', error);
        throw error;
      }
    }
  };

  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
      https: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      minify: 'terser',
      sourcemap: false,
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            helmet: ['@dr.pogodin/react-helmet'],
          },
        },
      },
    },
    plugins: [sitemapPlugin, react()],
    define: {
      __BASE_URL__: JSON.stringify(base),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});