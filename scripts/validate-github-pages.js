/**
 * Validación específica para GitHub Pages con React 19
 */

import fs from 'fs';
import path from 'path';

const DIST_DIR = path.join(process.cwd(), 'dist');

console.log('🔍 Validando configuración para GitHub Pages + React 19...\n');

// Verificar archivos críticos
const checks = [
  {
    file: 'index.html',
    description: 'Archivo principal de la aplicación',
    required: true
  },
  {
    file: '_redirects',
    description: 'Configuración de redirecciones SPA',
    required: true
  },
  {
    file: '.nojekyll',
    description: 'Archivo para evitar procesamiento Jekyll',
    required: true
  },
  {
    file: 'assets/index-*.js',
    description: 'Bundle de JavaScript principal',
    required: true
  },
  {
    file: 'assets/index-*.css',
    description: 'Bundle de CSS principal',
    required: true
  }
];

let allPassed = true;

checks.forEach(check => {
  let exists = false;

  if (check.file.includes('*')) {
    // Verificar patrones con wildcards
    const dir = path.dirname(path.join(DIST_DIR, check.file));
    const pattern = path.basename(check.file);
    try {
      const files = fs.readdirSync(dir);
      exists = files.some(file => file.match(pattern.replace('*', '.*')));
    } catch (e) {
      exists = false;
    }
  } else {
    exists = fs.existsSync(path.join(DIST_DIR, check.file));
  }

  if (exists) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description} - FALTA`);
    if (check.required) allPassed = false;
  }
});

// Verificar contenido del index.html
try {
  const indexContent = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');

  const contentChecks = [
    { pattern: /<script[^>]*src="[^"]*index-[^"]*\.js"/, description: 'Script principal referenciado' },
    { pattern: /<link[^>]*href="[^"]*index-[^"]*\.css"/, description: 'CSS principal referenciado' },
    { pattern: /<div id="app"/, description: 'Contenedor de la aplicación React' },
    { pattern: /type="module"/, description: 'Módulos ES6 soportados' }
  ];

  contentChecks.forEach(check => {
    if (check.pattern.test(indexContent)) {
      console.log(`✅ ${check.description}`);
    } else {
      console.log(`❌ ${check.description} - NO ENCONTRADO`);
      allPassed = false;
    }
  });
} catch (e) {
  console.log('❌ Error al leer index.html');
  allPassed = false;
}

// Verificar _redirects
try {
  const redirectsContent = fs.readFileSync(path.join(DIST_DIR, '_redirects'), 'utf8');
  if (redirectsContent.includes('/*    /index.html   200')) {
    console.log('✅ Redirecciones SPA configuradas correctamente');
  } else {
    console.log('❌ Redirecciones SPA incorrectas');
    allPassed = false;
  }
} catch (e) {
  console.log('❌ Error al leer _redirects');
  allPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 ¡Configuración para GitHub Pages + React 19 VALIDADA!');
  console.log('✅ El proyecto está listo para desplegarse');
} else {
  console.log('❌ Errores encontrados en la configuración');
  console.log('🔧 Revisa los elementos marcados con ❌');
}
console.log('='.repeat(50));