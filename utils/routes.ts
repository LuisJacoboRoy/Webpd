import { CATEGORIES, PRODUCTS } from '../data/products';
import { Product } from '../types';

export const CATALOG_PATH = '/catalogo/';

export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const categoryPath = (categoryId: string, subCategoryId?: string): string =>
  `/categoria/${slugify(categoryId)}${subCategoryId ? `/${slugify(subCategoryId)}` : ''}/`;

export const productSlug = (product: Product): string => {
  const baseSlug = slugify(product.name);
  const sameNameProducts = PRODUCTS.filter(item => slugify(item.name) === baseSlug);

  if (sameNameProducts.length < 2) return baseSlug;

  const categorySlug = slugify(
    CATEGORIES.find(category => category.id === product.categoryId)?.name || product.categoryId
  );
  const sameCategoryProducts = sameNameProducts.filter(item => item.categoryId === product.categoryId);
  const duplicateIndex = sameCategoryProducts.findIndex(item => item.id === product.id);

  return `${baseSlug}-${categorySlug}${duplicateIndex > 0 ? `-${duplicateIndex + 1}` : ''}`;
};

export const productPath = (product: Product): string => `/producto/${productSlug(product)}/`;

export const productPathForId = (productId: string): string => {
  const product = PRODUCTS.find(item => item.id === productId);
  return product ? productPath(product) : `/producto/${slugify(productId)}/`;
};

export const findProductBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find(product =>
    productSlug(product) === slug ||
    product.legacyNames?.some(name => slugify(name) === slug)
  );
