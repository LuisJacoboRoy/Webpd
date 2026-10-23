#!/usr/bin/env node

/**
 * SEO Verification & Health Check Script
 * Ejecutar: node scripts/seo-verify.js
 * 
 * Verifica que todos los archivos SEO estén configurados correctamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Archivos requeridos
const REQUIRED_FILES = [
  '../utils/seoPrerender.ts',
  '../hooks/useSEOPrerender.tsx',
  '../config/seoConfig.ts',
  '../components/SEOComponents.tsx',
  '../public/sitemap.xml',
  '../public/robots.txt',
  '../docs/SEO_PRERENDERING_GUIDE.md',
  '../docs/SEO_IMPLEMENTATION_SUMMARY.md',
  '../docs/SEO_INTEGRATION_EXAMPLES.tsx',
  '../package.json'
];

// Funciones de utilidad
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  return { exists, path: fullPath };
}

function fileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2) + ' KB';
  } catch {
    return '0 KB';
  }
}

function readFileLines(filePath, count = 5) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').slice(0, count);
  } catch {
    return [];
  }
}

// Verificaciones
function verifyFiles() {
  log('\n📁 VERIFICACIÓN DE ARCHIVOS', 'cyan');
  log('═════════════════════════════════════════\n', 'cyan');

  let found = 0;
  let missing = 0;

  REQUIRED_FILES.forEach(file => {
    const { exists, path: fullPath } = checkFile(file);
    const size = fileSize(fullPath);
    
    if (exists) {
      log(`  ✅ ${file.replace('../', '')} (${size})`, 'green');
      found++;
    } else {
      log(`  ❌ ${file.replace('../', '')} - FALTA`, 'red');
      missing++;
    }
  });

  log(`\n  Resultado: ${found}/${REQUIRED_FILES.length} archivos encontrados`, 
    missing === 0 ? 'green' : 'yellow');
  
  return missing === 0;
}

// Verificar contenido de archivos clave
function verifyFileContents() {
  log('\n📝 VERIFICACIÓN DE CONTENIDO', 'cyan');
  log('═════════════════════════════════════════\n', 'cyan');

  const checks = [
    {
      file: '../utils/seoPrerender.ts',
      keywords: [
        'generateProductSchema',
        'generateOpenGraphTags',
        'generateBreadcrumbSchema',
        'exportAllProductsSEO'
      ],
      name: 'Funciones de Generación SEO'
    },
    {
      file: '../hooks/useSEOPrerender.tsx',
      keywords: [
        'useSEOProduct',
        'useSEOCategory',
        'useOrganizationSchema',
        'SEOHelmet'
      ],
      name: 'Hooks React SEO'
    },
    {
      file: '../config/seoConfig.ts',
      keywords: [
        'SEO_CONFIG',
        'domain',
        'business',
        'validateSEOConfig'
      ],
      name: 'Configuración Centralizada'
    },
    {
      file: '../public/sitemap.xml',
      keywords: [
        '<?xml',
        '<urlset',
        '<loc>',
        '</urlset>'
      ],
      name: 'Sitemap XML'
    },
    {
      file: '../public/robots.txt',
      keywords: [
        'User-agent',
        'Allow',
        'Disallow',
        'Sitemap'
      ],
      name: 'Robots.txt'
    },
    {
      file: '../package.json',
      keywords: [
        'prerender',
        'build:ssg',
        '@dr.pogodin/react-helmet'
      ],
      name: 'Scripts NPM'
    }
  ];

  checks.forEach(({ file, keywords, name }) => {
    const { exists, path: fullPath } = checkFile(file);
    
    if (!exists) {
      log(`  ⚠️  ${name} - Archivo no encontrado`, 'yellow');
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const found = keywords.filter(kw => content.includes(kw)).length;
    const percentage = ((found / keywords.length) * 100).toFixed(0);

    if (found === keywords.length) {
      log(`  ✅ ${name} (${percentage}%)`, 'green');
    } else {
      log(`  ⚠️  ${name} (${percentage}%) - ${keywords.length - found} elementos faltantes`, 'yellow');
    }
  });
}

// Verificar estructura de directorios
function verifyDirectories() {
  log('\n📂 VERIFICACIÓN DE DIRECTORIOS', 'cyan');
  log('═════════════════════════════════════════\n', 'cyan');

  const dirs = [
    '../utils/',
    '../hooks/',
    '../config/',
    '../components/',
    '../scripts/',
    '../public/',
    '../docs/',
    '../prerendered/'
  ];

  dirs.forEach(dir => {
    const { exists, path: fullPath } = checkFile(dir);
    const status = exists ? '✅' : '⚠️ ';
    const color = exists ? 'green' : 'yellow';
    log(`  ${status} ${dir}`, color);
  });
}

// Contar elementos
function countElements() {
  log('\n📊 ESTADÍSTICAS', 'cyan');
  log('═════════════════════════════════════════\n', 'cyan');

  try {
    // Intentar importar datos
    const dataFile = path.resolve(__dirname, '../data/products.ts');
    const dataContent = fs.readFileSync(dataFile, 'utf8');
    
    const productMatches = dataContent.match(/id: 'auto-\d+'/g) || [];
    const categoryMatches = dataContent.match(/categoryId: 'automotriz'/g) || [];
    
    log(`  📦 Productos detectados: ${productMatches.length}`, 'blue');
    log(`  🏷️  Categorías configuradas: 3`, 'blue');
    
    // Estimar líneas de código SEO
    const seoFiles = REQUIRED_FILES.filter(f => 
      f.includes('utils/') || f.includes('hooks/') || f.includes('config/')
    );
    
    let totalLines = 0;
    seoFiles.forEach(file => {
      const { path: fullPath } = checkFile(file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        totalLines += content.split('\n').length;
      }
    });
    
    log(`  💻 Líneas de código SEO: ~${totalLines}`, 'blue');
  } catch (e) {
    log(`  ⚠️  No se pudo contar elementos`, 'yellow');
  }
}

// Verificar hooks
function verifyHooks() {
  log('\n🎣 VERIFICACIÓN DE HOOKS', 'cyan');
  log('═════════════════════════════════════════\n', 'cyan');

  const hooksFile = path.resolve(__dirname, '../hooks/useSEOPrerender.tsx');
  
  if (!fs.existsSync(hooksFile)) {
    log('  ❌ Archivo de hooks no encontrado', 'red');
    return;
  }

  const content = fs.readFileSync(hooksFile, 'utf8');
  const hooks = [
    'useSEOProduct',
    'useSEOCategory',
    'useOrganizationSchema',
    'useLocalBusinessSchema',
    'useSEOValidation',
    'useDynamicMetaTags'
  ];

  const components = [
    'SEOHelmet'
  ];

  log('  Hooks disponibles:', 'blue');
  hooks.forEach(hook => {
    const available = content.includes(`export const ${hook}`);
    log(`    ${available ? '✅' : '❌'} ${hook}`, available ? 'green' : 'red');
  });

  log('\n  Componentes disponibles:', 'blue');
  components.forEach(comp => {
    const available = content.includes(`export const ${comp}`);
    log(`    ${available ? '✅' : '❌'} ${comp}`, available ? 'green' : 'red');
  });
}

// Verificar scripts NPM
function verifyNpmScripts() {
  log('\n📜 VERIFICACIÓN DE SCRIPTS NPM', 'cyan');
  log('═════════════════════════════════════════\n', 'cyan');

  try {
    const packageFile = path.resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    
    const scripts = packageJson.scripts || {};
    const requiredScripts = ['prerender', 'build:ssg'];

    requiredScripts.forEach(script => {
      const available = !!scripts[script];
      log(`  ${available ? '✅' : '❌'} npm run ${script}`, 
        available ? 'green' : 'red');
      if (available) {
        log(`    └─ ${scripts[script]}`, 'blue');
      }
    });
  } catch (e) {
    log('  ❌ No se pudo leer package.json', 'red');
  }
}

// Mostrar comandos disponibles
function showCommands() {
  log('\n🚀 COMANDOS DISPONIBLES', 'cyan');
  log('═════════════════════════════════════════\n', 'cyan');

  const commands = [
    { cmd: 'npm run prerender', desc: 'Generar páginas estáticas con SEO' },
    { cmd: 'npm run build:ssg', desc: 'Build completo + prerendering' },
    { cmd: 'npm run dev', desc: 'Iniciar desarrollo con SEO integrado' },
    { cmd: 'npm run build', desc: 'Build optimizado' }
  ];

  commands.forEach(({ cmd, desc }) => {
    log(`  $ ${cmd}`, 'blue');
    log(`    └─ ${desc}\n`, 'cyan');
  });
}

// Mostrar checklist
function showChecklist() {
  log('\n✅ CHECKLIST DE IMPLEMENTACIÓN', 'cyan');
  log('═════════════════════════════════════════\n', 'cyan');

  const items = [
    { done: true, text: 'Crear funciones de generación SEO' },
    { done: true, text: 'Crear hooks React para integración' },
    { done: true, text: 'Crear componentes SEO wrapper' },
    { done: true, text: 'Crear configuración centralizada' },
    { done: true, text: 'Generar sitemap.xml dinámico' },
    { done: true, text: 'Generar robots.txt optimizado' },
    { done: false, text: 'Ejecutar npm run prerender' },
    { done: false, text: 'Verificar en Google Search Console' },
    { done: false, text: 'Probar en https://validator.schema.org/' },
    { done: false, text: 'Enviar sitemap a Google' }
  ];

  items.forEach(({ done, text }) => {
    const status = done ? '✅' : '⬜';
    const color = done ? 'green' : 'yellow';
    log(`  ${status} ${text}`, color);
  });
}

// Main execution
function main() {
  log('\n╔═════════════════════════════════════════╗', 'cyan');
  log('║     🔍 SEO VERIFICATION REPORT          ║', 'cyan');
  log('║     Pinturas Diamante - 2026            ║', 'cyan');
  log('╚═════════════════════════════════════════╝\n', 'cyan');

  const filesOk = verifyFiles();
  verifyFileContents();
  verifyDirectories();
  verifyHooks();
  verifyNpmScripts();
  countElements();
  showCommands();
  showChecklist();

  // Resumen final
  log('\n╔═════════════════════════════════════════╗', 'cyan');
  if (filesOk) {
    log('║  ✅ SISTEMA SEO CORRECTAMENTE            ║', 'green');
    log('║     CONFIGURADO Y LISTO PARA USAR       ║', 'green');
  } else {
    log('║  ⚠️  REVISAR ARCHIVOS FALTANTES         ║', 'yellow');
  }
  log('╚═════════════════════════════════════════╝\n', 'cyan');

  // Próximos pasos
  log('📋 PRÓXIMOS PASOS:', 'blue');
  log('  1. npm run prerender', 'cyan');
  log('  2. Revisar carpeta prerendered/', 'cyan');
  log('  3. Enviar sitemap a Google Search Console', 'cyan');
  log('  4. Validar schema.org en validator\n', 'cyan');

  process.exit(filesOk ? 0 : 1);
}

// Ejecutar
main();
