/**
 * Script de Validación de Product Schema para Google Search Console
 * Verifica que todos los productos cumplan con requisitos de Rich Results
 * 
 * Documentación: https://developers.google.com/search/docs/appearance/structured-data/product
 * Validador: https://schema.org/Product
 * Rich Results Test: https://search.google.com/test/rich-results
 */

import fs from 'fs';
import path from 'path';
import { PRODUCTS, CATEGORIES, SUB_CATEGORIES } from '../data/products.js';
import {
  generateEnhancedProductSchema,
  validateProductSchema
} from '../utils/productSchemaGenerator.js';

const REPORT_FILE = './product-schema-validation-report.json';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Product Schema Validation for Google Search Console       ║');
console.log('║  Validating Rich Results Requirements                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const validationReport = {
  timestamp: new Date().toISOString(),
  totalProducts: PRODUCTS.length,
  validProducts: 0,
  productsWithWarnings: 0,
  productsWithErrors: 0,
  details: []
};

// Validar cada producto
PRODUCTS.forEach((product, index) => {
  const category = CATEGORIES.find(c => c.id === product.categoryId);
  const subCat = SUB_CATEGORIES.find(s => s.id === product.subCategoryId);

  // Generar schema
  const schema = generateEnhancedProductSchema(product, category, subCat, true);

  // Validar
  const errors = validateProductSchema(schema);
  const hasErrors = errors.some(e => e.startsWith('❌'));
  const hasWarnings = errors.some(e => e.startsWith('⚠️'));

  const status = hasErrors ? '❌ FAIL' : hasWarnings ? '⚠️  WARNING' : '✅ PASS';
  
  if (hasErrors) {
    validationReport.productsWithErrors++;
  } else if (hasWarnings) {
    validationReport.productsWithWarnings++;
  } else {
    validationReport.validProducts++;
  }

  // Mostrar resultado
  console.log(`${status} ${product.id.padEnd(15)} | ${product.name.substring(0, 40).padEnd(40)}`);

  // Guardar detalles
  validationReport.details.push({
    productId: product.id,
    productName: product.name,
    category: category?.name,
    status: hasErrors ? 'FAIL' : hasWarnings ? 'WARNING' : 'PASS',
    messages: errors,
    schemaSize: JSON.stringify(schema).length,
    requiredFields: {
      name: !!schema.name,
      description: !!schema.description,
      image: !!schema.image && schema.image.length > 0,
      offers: !!schema.offers,
      offersAvailability: !!schema.offers?.availability,
      offersPriceCurrency: !!schema.offers?.priceCurrency
    },
    recommendedFields: {
      brand: !!schema.brand,
      sku: !!schema.sku,
      aggregateRating: !!schema.aggregateRating,
      review: !!schema.review && schema.review.length > 0,
      warranty: !!schema.warranty
    }
  });

  if (index % 10 === 9) {
    console.log(''); // Separador visual
  }
});

// Resumen
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Validation Summary                                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const passRate = ((validationReport.validProducts / PRODUCTS.length) * 100).toFixed(1);

console.log(`📊 Results:`);
console.log(`   ✅ Valid (Pass):    ${validationReport.validProducts}/${PRODUCTS.length}`);
console.log(`   ⚠️  Warnings:        ${validationReport.productsWithWarnings}/${PRODUCTS.length}`);
console.log(`   ❌ Errors (Fail):    ${validationReport.productsWithErrors}/${PRODUCTS.length}`);
console.log(`   📈 Pass Rate:       ${passRate}%\n`);

// Análisis de campos faltantes
console.log(`🔍 Field Analysis:`);

let totalMissing = {
  requiredFields: {},
  recommendedFields: {}
};

validationReport.details.forEach(detail => {
  Object.entries(detail.requiredFields).forEach(([field, present]) => {
    if (!present) {
      totalMissing.requiredFields[field] = (totalMissing.requiredFields[field] || 0) + 1;
    }
  });
  
  Object.entries(detail.recommendedFields).forEach(([field, present]) => {
    if (!present) {
      totalMissing.recommendedFields[field] = (totalMissing.recommendedFields[field] || 0) + 1;
    }
  });
});

if (Object.keys(totalMissing.requiredFields).length > 0) {
  console.log(`\n   ⚠️  Missing Required Fields:`);
  Object.entries(totalMissing.requiredFields).forEach(([field, count]) => {
    console.log(`      • ${field}: ${count} products`);
  });
}

if (Object.keys(totalMissing.recommendedFields).length > 0) {
  console.log(`\n   💡 Missing Recommended Fields:`);
  Object.entries(totalMissing.recommendedFields).forEach(([field, count]) => {
    console.log(`      • ${field}: ${count} products`);
  });
}

// Guardar reporte
fs.writeFileSync(REPORT_FILE, JSON.stringify(validationReport, null, 2));
console.log(`\n📄 Full report saved to: ${REPORT_FILE}\n`);

// Información para Google Search Console
console.log('📋 Next Steps for Google Search Console:\n');
console.log('   1. Go to: https://search.google.com/test/rich-results');
console.log('   2. Enter your site URL or paste HTML');
console.log('   3. Check for Product rich results');
console.log('   4. Verify all required fields are present');
console.log('   5. Fix any errors found\n');

// Conclusión
if (validationReport.productsWithErrors === 0) {
  console.log('✨ All products are ready for Google Search Console! 🎉\n');
} else {
  console.log(`⚠️  ${validationReport.productsWithErrors} product(s) need fixes before indexing.\n`);
}

// Exportar reporte como JSON para verificación manual
console.log('💾 Validation Report Summary:');
console.log(`   • Total Products Checked: ${PRODUCTS.length}`);
console.log(`   • Report File: ${path.resolve(REPORT_FILE)}`);
console.log(`   • Use this report to fix schema issues\n`);

process.exit(validationReport.productsWithErrors > 0 ? 1 : 0);
