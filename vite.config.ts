import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Detectar si hay certificados SSL locales (para desarrollo)
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

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // HTTPS solo en desarrollo si existen certificados
        https: process.env.HTTPS === 'true' ? getHttpsConfig() : false,
        // Proxy para API calls en desarrollo (si aplica)
        proxy: {
          '/api': {
            target: process.env.VITE_API_URL || 'http://localhost:3001',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
          }
        }
      },
      build: {
        // Optimizaciones de seguridad en build
        minify: 'terser',
        sourcemap: false, // Desabilitar en producción
        rollupOptions: {
          output: {
            manualChunks: {
              'react': ['react', 'react-dom'],
              'router': ['react-router-dom'],
              'helmet': ['@dr.pogodin/react-helmet']
            }
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
