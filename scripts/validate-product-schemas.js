/**
 * Validates descriptive product-page markup without claiming Product rich-result eligibility.
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
console.log('║  Product Page Markup Validation                            ║');
console.log('║  Product rich results are intentionally not emitted        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const validationReport = {
  timestamp: new Date().toISOString(),
  totalProducts: PRODUCTS.length,
  validDescriptions: 0,
  productsWithoutRichResults: PRODUCTS.length,
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
  const hasErrors = errors.length > 0;
  const status = hasErrors ? '❌ FAIL' : 'ℹ️ INFO';
  
  if (hasErrors) {
    validationReport.productsWithErrors++;
  } else {
    validationReport.validDescriptions++;
  }

  // Mostrar resultado
  console.log(`${status} ${product.id.padEnd(15)} | ${product.name.substring(0, 40).padEnd(40)}`);

  // Guardar detalles
  validationReport.details.push({
    productId: product.id,
    productName: product.name,
    category: category?.name,
    status: hasErrors ? 'FAIL' : 'DESCRIPTIVE_ONLY',
    messages: errors,
    schemaType: schema['@type'],
    richResultEligible: false,
    schemaSize: JSON.stringify(schema).length
  });

  if (index % 10 === 9) {
    console.log(''); // Separador visual
  }
});

// Resumen
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Validation Summary                                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`📊 Results:`);
console.log(`   ✅ Descriptive markup valid: ${validationReport.validDescriptions}/${PRODUCTS.length}`);
console.log(`   ℹ️  Product rich results eligible: 0/${PRODUCTS.length}`);
console.log(`   ❌ Markup errors: ${validationReport.productsWithErrors}/${PRODUCTS.length}`);

// Guardar reporte
fs.writeFileSync(REPORT_FILE, JSON.stringify(validationReport, null, 2));
console.log(`\n📄 Full report saved to: ${REPORT_FILE}\n`);

console.log('ℹ️ Product rich results remain unavailable until genuine offers, reviews, or ratings are provided.');

// Exportar reporte como JSON para verificación manual
console.log('💾 Validation Report Summary:');
console.log(`   • Total Products Checked: ${PRODUCTS.length}`);
console.log(`   • Report File: ${path.resolve(REPORT_FILE)}`);
console.log(`   • This report checks descriptive markup, not Product rich-result eligibility\n`);

process.exit(validationReport.productsWithErrors > 0 ? 1 : 0);
