/**
 * VALIDADOR DE MICROFORMATOS
 * Herramienta para verificar que los schemas JSON-LD están correctamente inyectados
 * 
 * Uso en consola del navegador:
 * 1. Copiar todo este código
 * 2. Ejecutar en consola (F12 > Console)
 * 3. Ejecutar: validateAllSchemas()
 */

interface SchemaValidationResult {
  type: string;
  valid: boolean;
  warnings: string[];
  errors: string[];
  data: any;
}

class MicroformatValidator {
  /**
   * Valida todos los schemas JSON-LD en la página
   */
  validateAllSchemas(): SchemaValidationResult[] {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const results: SchemaValidationResult[] = [];

    if (scripts.length === 0) {
      console.warn('⚠️ No se encontraron scripts JSON-LD en la página');
      return results;
    }

    console.log(`📊 Encontrados ${scripts.length} schemas JSON-LD\n`);

    scripts.forEach((script, index) => {
      try {
        const data = JSON.parse(script.textContent || '{}');
        const result = this.validateSchema(data);
        results.push(result);

        // Mostrar resultado en consola
        this.printResult(result, index);
      } catch (error) {
        console.error(`❌ Error al parsear schema #${index}:`, error);
      }
    });

    // Resumen
    this.printSummary(results);
    return results;
  }

  /**
   * Valida un schema individual
   */
  validateSchema(schema: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      type: schema['@type'] || 'Unknown',
      valid: true,
      warnings: [],
      errors: [],
      data: schema
    };

    // Validaciones generales
    if (!schema['@context']) {
      result.errors.push('Falta @context');
      result.valid = false;
    }

    if (!schema['@type']) {
      result.errors.push('Falta @type');
      result.valid = false;
    }

    // Validaciones específicas por tipo
    switch (schema['@type']) {
      case 'Organization':
      case 'LocalBusiness':
        this.validateOrganization(schema, result);
        break;
      case 'Product':
        this.validateProduct(schema, result);
        break;
      case 'BreadcrumbList':
        this.validateBreadcrumb(schema, result);
        break;
      case 'CollectionPage':
        this.validateCollection(schema, result);
        break;
      case 'FAQPage':
        this.validateFAQ(schema, result);
        break;
      case 'ContactPage':
        this.validateContact(schema, result);
        break;
    }

    return result;
  }

  /**
   * Valida Organization/LocalBusiness
   */
  private validateOrganization(schema: any, result: SchemaValidationResult) {
    const required = ['name', 'url', 'telephone', 'address'];
    required.forEach(field => {
      if (!schema[field]) {
        result.warnings.push(`Falta ${field} (recomendado)`);
      }
    });

    if (!schema.logo) {
      result.warnings.push('Falta logo (importante para Knowledge Panel)');
    }

    if (!schema.sameAs || schema.sameAs.length === 0) {
      result.warnings.push('Falta sameAs (redes sociales)');
    }

    if (schema.address && !schema.address.streetAddress) {
      result.errors.push('Dirección incompleta: falta streetAddress');
    }

    if (schema.address && !schema.address.postalCode) {
      result.errors.push('Dirección incompleta: falta postalCode');
    }
  }

  /**
   * Valida Product
   */
  private validateProduct(schema: any, result: SchemaValidationResult) {
    const required = ['name', 'description', 'image', 'offers'];
    required.forEach(field => {
      if (!schema[field]) {
        result.errors.push(`Falta ${field} (requerido)`);
        result.valid = false;
      }
    });

    if (schema.image) {
      if (typeof schema.image === 'string' && !schema.image.startsWith('http')) {
        result.warnings.push('Imagen debe ser URL absoluta (http/https)');
      }
      if (schema.image['@type'] === 'ImageObject' && !schema.image.url?.startsWith('http')) {
        result.errors.push('ImageObject.url debe ser URL absoluta');
      }
    }

    if (!schema.aggregateRating) {
      result.warnings.push('Falta aggregateRating (reduce CTR potencial)');
    }

    if (!schema.brand) {
      result.warnings.push('Falta brand (recomendado)');
    }
  }

  /**
   * Valida BreadcrumbList
   */
  private validateBreadcrumb(schema: any, result: SchemaValidationResult) {
    if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
      result.errors.push('Falta itemListElement array');
      result.valid = false;
      return;
    }

    if (schema.itemListElement.length < 2) {
      result.warnings.push('BreadcrumbList debe tener al menos 2 elementos');
    }

    schema.itemListElement.forEach((item: any, idx: number) => {
      if (!item.name || !item.item || !item.position) {
        result.errors.push(`Elemento #${idx} incompleto: falta name, item o position`);
      }
      if (typeof item.position !== 'number' || item.position !== idx + 1) {
        result.errors.push(`Posición incorrecta en elemento #${idx}`);
      }
    });
  }

  /**
   * Valida CollectionPage
   */
  private validateCollection(schema: any, result: SchemaValidationResult) {
    if (!schema.name) {
      result.errors.push('Falta name');
      result.valid = false;
    }
    if (!schema.url) {
      result.errors.push('Falta url (debe ser absoluta)');
    }
    if (!schema.mainEntity?.numberOfItems) {
      result.warnings.push('Falta numberOfItems en mainEntity');
    }
  }

  /**
   * Valida FAQPage
   */
  private validateFAQ(schema: any, result: SchemaValidationResult) {
    if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
      result.errors.push('Falta mainEntity array');
      result.valid = false;
      return;
    }

    schema.mainEntity.forEach((item: any, idx: number) => {
      if (!item.name) {
        result.errors.push(`Pregunta #${idx} sin nombre`);
      }
      if (!item.acceptedAnswer?.text) {
        result.errors.push(`Pregunta #${idx} sin respuesta`);
      }
    });

    if (schema.mainEntity.length < 3) {
      result.warnings.push('Menos de 3 FAQs (se recomienda 3-10)');
    }
  }

  /**
   * Valida ContactPage
   */
  private validateContact(schema: any, result: SchemaValidationResult) {
    if (!schema.mainEntity?.contactPoint?.telephone) {
      result.errors.push('Falta contactPoint.telephone');
    }
    if (!schema.mainEntity?.address?.streetAddress) {
      result.warnings.push('Falta dirección completa');
    }
  }

  /**
   * Imprime resultado formateado
   */
  private printResult(result: SchemaValidationResult, index: number) {
    const status = result.valid ? '✅' : result.errors.length > 0 ? '❌' : '⚠️';
    console.group(`${status} Schema #${index}: ${result.type}`);

    if (result.errors.length > 0) {
      console.error('ERRORES:');
      result.errors.forEach(err => console.error(`  - ${err}`));
    }

    if (result.warnings.length > 0) {
      console.warn('ADVERTENCIAS:');
      result.warnings.forEach(warn => console.warn(`  - ${warn}`));
    }

    if (!result.errors.length && !result.warnings.length) {
      console.log('✓ Schema válido y completo');
    }

    console.groupEnd();
  }

  /**
   * Imprime resumen total
   */
  private printSummary(results: SchemaValidationResult[]) {
    const valid = results.filter(r => r.valid && r.errors.length === 0).length;
    const warnings = results.filter(r => r.warnings.length > 0).length;
    const errors = results.filter(r => r.errors.length > 0).length;

    console.group('📋 RESUMEN');
    console.log(`Total de schemas: ${results.length}`);
    console.log(`✅ Válidos y completos: ${valid}`);
    if (warnings > 0) console.log(`⚠️ Con advertencias: ${warnings}`);
    if (errors > 0) console.log(`❌ Con errores: ${errors}`);

    // Listado de tipos encontrados
    const types = [...new Set(results.map(r => r.type))];
    console.log(`\nTipos de schemas: ${types.join(', ')}`);

    console.groupEnd();

    // Exportar JSON
    console.log('\n💾 Para exportar JSON, ejecutar: copy(JSON.stringify(results, null, 2))');
  }

  /**
   * Registra recomendaciones CTR
   */
  printSEORecommendations() {
    console.group('🎯 RECOMENDACIONES DE CTR');

    const hasOrganization = document.querySelector('script[type="application/ld+json"]') &&
      JSON.parse(
        (document.querySelector('script[type="application/ld+json"]')?.textContent || '{}')
      )['@type'] === 'Organization';

    const hasProduct = document.querySelectorAll('script[type="application/ld+json"]').length > 0 &&
      Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(script => {
        const data = JSON.parse(script.textContent || '{}');
        return data['@type'] === 'Product';
      });

    const hasBreadcrumb = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(script => {
      const data = JSON.parse(script.textContent || '{}');
      return data['@type'] === 'BreadcrumbList';
    });

    const hasFAQ = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(script => {
      const data = JSON.parse(script.textContent || '{}');
      return data['@type'] === 'FAQPage';
    });

    if (hasOrganization) {
      console.log('✅ Organization implementado (Knowledge Panel potencial)');
    } else {
      console.warn('⚠️ Agregar Organization Schema en página principal');
    }

    if (hasProduct) {
      console.log('✅ Product implementado (Rich Snippets activos)');
    } else {
      console.warn('⚠️ Agregar Product Schema en páginas de productos');
    }

    if (hasBreadcrumb) {
      console.log('✅ BreadcrumbList implementado (Navegación en SERPs)');
    } else {
      console.warn('⚠️ Agregar BreadcrumbList en categorías y productos');
    }

    if (hasFAQ) {
      console.log('✅ FAQPage implementado (Featured Snippets potencial)');
    } else {
      console.warn('⚠️ Agregar FAQPage para aumentar Featured Snippets');
    }

    console.groupEnd();
  }
}

// ============================================
// EJECUCIÓN GLOBAL
// ============================================

const validator = new MicroformatValidator();

// Funciones globales disponibles en consola
window.validateAllSchemas = () => validator.validateAllSchemas();
window.validateSchema = (schema: any) => validator.validateSchema(schema);
window.printSEORecommendations = () => validator.printSEORecommendations();

console.log('🚀 Validador de Microformatos cargado');
console.log('📝 Comandos disponibles:');
console.log('  - validateAllSchemas() → Validar todos los schemas de la página');
console.log('  - printSEORecommendations() → Ver recomendaciones de CTR');
console.log('\n👉 Ejecuta ahora: validateAllSchemas()');
