import { useMemo } from 'react';
import { BUSINESS_INFO } from '../data/seo';

/**
 * Lista de imágenes disponibles en /img/product
 * Se usan como og:image aleatorio para páginas que no son de producto específico.
 */
const PRODUCT_IMAGES = [
    '/img/product/487928157_996602669284010_7701561790680972083_n.jpg',
    '/img/product/492046311_1010278607916416_3958118979299432106_n.jpg',
    '/img/product/500499977_1036172748660335_7546374799638768775_n.jpg',
    '/img/product/531490493_1093616386249304_305369217444697791_n.jpg',
    '/img/product/534850764_1097529489191327_9054814714848497074_n.jpg',
    '/img/product/585894744_1174722084805400_8954301639622097133_n.jpg',
    '/img/product/589281911_1182011644076444_9044199813281011654_n.jpg',
    '/img/product/590967961_1180455497565392_615718818998599924_n.jpg',
];

/**
 * Hook que devuelve una URL absoluta de imagen aleatoria de /img/product,
 * estable durante el ciclo de vida del componente (useMemo con []).
 */
export function useRandomProductImage(): string {
    return useMemo(() => {
        const path = PRODUCT_IMAGES[Math.floor(Math.random() * PRODUCT_IMAGES.length)];
        return `${BUSINESS_INFO.url}${path}`;
    }, []);
}
