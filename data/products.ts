
import { Product, Category, SubCategory } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'automotriz', name: 'AUTOMOTRIZ', description: 'Soluciones de alta gama para el repintado y protección vehicular.' },
  { id: 'maderas', name: 'MADERAS', description: 'Protección y embellecimiento para todo tipo de superficies de madera.' },
  { id: 'decorativo', name: 'DECORATIVO', description: 'Pinturas y acabados para transformar hogares y espacios comerciales.' }
];

export const SUB_CATEGORIES: SubCategory[] = [
  // Automotriz
  { id: 'complementos-auto', categoryId: 'automotriz', name: 'Complementos' },
  { id: 'poliuretano-auto', categoryId: 'automotriz', name: 'Esmalte Poliuretano' },
  { id: 'secado-rapido-auto', categoryId: 'automotriz', name: 'Esmalte Secado Rápido' },
  { id: 'acrilicos-auto', categoryId: 'automotriz', name: 'Esmaltes Acrílicos' },
  { id: 'primarios-auto', categoryId: 'automotriz', name: 'Primarios' },
  { id: 'resanadores-auto', categoryId: 'automotriz', name: 'Resanadores' },
  { id: 'transparentes-auto', categoryId: 'automotriz', name: 'Transparentes' },
  { id: 'base-color-auto', categoryId: 'automotriz', name: 'Base Color' },
  
  // Maderas
  { id: 'poliuretanos-madera', categoryId: 'maderas', name: 'Poliuretanos' },
  { id: 'nitrocelulosa-madera', categoryId: 'maderas', name: 'Nitrocelulosa' },
  { id: 'entintados-madera', categoryId: 'maderas', name: 'Barnices Entintados' },
  { id: 'complementos-madera', categoryId: 'maderas', name: 'Complementos Maderas' },

  // Decorativo
  { id: 'vinilicas-deco', categoryId: 'decorativo', name: 'Vinílicas' },
  { id: 'esmaltes-deco', categoryId: 'decorativo', name: 'Esmaltes' },
  { id: 'imper-deco', categoryId: 'decorativo', name: 'Impermeabilizantes' },
  { id: 'aerosoles-deco', categoryId: 'decorativo', name: 'Aerosoles' },
  { id: 'selladores-deco', categoryId: 'decorativo', name: 'Selladores' },
  { id: 'especiales-deco', categoryId: 'decorativo', name: 'Especiales' }
];

export const PRODUCTS: Product[] = [
  // AUTOMOTRIZ - Complementos
  { id: 'auto-1', categoryId: 'automotriz', subCategoryId: 'complementos-auto', tag: 'Complementos', name: 'Acondicionador de metales', description: 'Producto diseñado para eliminar óxido de superficies ferrosas y acondicionar el metal creando una capa fosfatizada que mejora la adherencia.' },
  { id: 'auto-2', categoryId: 'automotriz', subCategoryId: 'complementos-auto', tag: 'Complementos', name: 'Blender Clear Esfumador', description: 'Solución para difuminar recubrimientos transparentes y de poliuretano, garantizando un acabado suave, brillante y sin bordes visibles.' },
  { id: 'auto-3', categoryId: 'automotriz', subCategoryId: 'complementos-auto', tag: 'Complementos', name: 'Body Plus Recubrimiento', description: 'Anticorrosivo base agua que protege contra abrasión, amortigua ruidos y vibraciones, y resiste altas temperaturas.' },
  { id: 'auto-4', categoryId: 'automotriz', subCategoryId: 'complementos-auto', tag: 'Complementos', name: 'Desengrasante automotriz', description: 'Limpiador eficaz que elimina grasas, siliconas y contaminantes de superficies metálicas, previniendo defectos como el "ojo de pescado".' },
  { id: 'auto-5', categoryId: 'automotriz', subCategoryId: 'complementos-auto', tag: 'Complementos', name: 'Perla Universal Automotriz', description: 'Aditivo en polvo o pasta que proporciona efectos perlados de profundidad y cambio de tono según el ángulo de luz.' },
  { id: 'auto-6', categoryId: 'automotriz', subCategoryId: 'complementos-auto', tag: 'Complementos', name: 'Plaste automotriz', description: 'Masilla de corrección para pequeñas imperfecciones y rayones; ofrece una superficie tersa, fácil de lijar y con buen poder de relleno.' },
  { id: 'auto-7', categoryId: 'automotriz', subCategoryId: 'complementos-auto', tag: 'Complementos', name: 'Promotor de adherencia', description: 'Agente de enlace químico diseñado para asegurar la adhesión de pinturas sobre plásticos automotrices difíciles y parachoques.' },
  { id: 'auto-8', categoryId: 'automotriz', subCategoryId: 'complementos-auto', tag: 'Complementos', name: 'Removedor amarillo', description: 'Removedor químico potente para levantar pintura vieja, barnices y esmaltes sin dañar el sustrato metálico, ideal para repintado.' },

  // AUTOMOTRIZ - Poliuretano
  { id: 'auto-9', categoryId: 'automotriz', subCategoryId: 'poliuretano-auto', tag: 'Esmalte Poliuretano', name: 'Esmalte Ureprix', description: 'Esmalte de poliuretano de dos componentes (2K) que ofrece máxima resistencia química, durabilidad a la intemperie y un acabado de alto brillo.' },
  
  // AUTOMOTRIZ - Secado Rápido
  { id: 'auto-10', categoryId: 'automotriz', subCategoryId: 'secado-rapido-auto', tag: 'Esmalte Secado Rápido', name: 'Esmalte Turboprix', description: 'Esmalte alquidálico modificado de secado rápido, diseñado para reparaciones económicas que requieren buen brillo y velocidad de entrega.' },

  // AUTOMOTRIZ - Acrílicos
  { id: 'auto-11', categoryId: 'automotriz', subCategoryId: 'acrilicos-auto', tag: 'Esmaltes Acrílicos', name: 'Esmalte Ultraprix', description: 'Acabado acrílico de alta calidad con excelente retención de color y brillo, resistente a agentes atmosféricos y no requiere pulido inmediato.' },

  // AUTOMOTRIZ - Primarios
  { id: 'auto-12', categoryId: 'automotriz', subCategoryId: 'primarios-auto', tag: 'Primarios', name: 'Maxiprimer anticorrosivo', description: 'Primario de alto desempeño con pigmentos inhibidores de corrosión; promueve adherencia extrema en metal desnudo donde otros fallan.' },
  { id: 'auto-13', categoryId: 'automotriz', subCategoryId: 'primarios-auto', tag: 'Primarios', name: 'Primario Universal', description: 'Fondo de superficie versátil disponible en varios tonos (gris, rojo, etc.), con buena capacidad de relleno y facilidad de lijado.' },
  { id: 'auto-14', categoryId: 'automotriz', subCategoryId: 'primarios-auto', tag: 'Primarios', name: 'Primer Filler Plus 2k', description: 'Aparejo de dos componentes de alto espesor (High Build), ideal para nivelar superficies irregulares y proporcionar una base perfecta.' },

  // AUTOMOTRIZ - Resanadores
  { id: 'auto-15', categoryId: 'automotriz', subCategoryId: 'resanadores-auto', tag: 'Resanadores', name: 'Resanador Light Fill Pro', description: 'Masilla de poliéster ultra ligera de última generación, formulada para rellenar abolladuras grandes con un lijado excepcionalmente suave.' },

  // AUTOMOTRIZ - Transparentes
  { id: 'auto-16', categoryId: 'automotriz', subCategoryId: 'transparentes-auto', tag: 'Transparentes', name: 'Transparente D-Prix', description: 'Barniz transparente de poliuretano de uso general, ofrece un buen balance entre brillo, secado y distinción de imagen (DOI).' },
  { id: 'auto-17', categoryId: 'automotriz', subCategoryId: 'transparentes-auto', tag: 'Transparentes', name: 'Transparente Clara Gloss', description: 'Transparente de altos sólidos (HS) de tres componentes; reproduce la apariencia original con brillo profundo ("wet look") y máxima protección UV.' },
  { id: 'auto-18', categoryId: 'automotriz', subCategoryId: 'transparentes-auto', tag: 'Transparentes', name: 'Transparente Elite Plus Hs', description: 'Barniz de altos sólidos diseñado para alta productividad, ofrece un acabado espejo duradero y excelente resistencia a rayones.' },
  { id: 'auto-19', categoryId: 'automotriz', subCategoryId: 'transparentes-auto', tag: 'Transparentes', name: 'Transparente L.C.A', description: 'Transparente de dos componentes con excelente nivelación y brillo, ideal para reparaciones de paneles completos.' },

  // AUTOMOTRIZ - Base Color
  { id: 'auto-20', categoryId: 'automotriz', subCategoryId: 'base-color-auto', tag: 'Base Color', name: 'Base Color Innovaplus', description: 'Sistema de pintura bicapa de color intenso y alto poder cubriente, diseñado para igualación precisa en sistemas de repintado.' },

  // MADERAS - Poliuretanos
  { id: 'mad-1', categoryId: 'maderas', subCategoryId: 'poliuretanos-madera', tag: 'Poliuretanos', name: 'Barniz PU Transparente', description: 'Barniz de poliuretano de dos componentes disponible en acabados Mate, Semi-Mate y Brillante; ofrece alta dureza y resistencia a químicos domésticos.' },
  { id: 'mad-2', categoryId: 'maderas', subCategoryId: 'poliuretanos-madera', tag: 'Poliuretanos', name: 'Fondo PU para Madera', description: 'Fondo de poliuretano de altos sólidos que sella perfectamente el poro de la madera, facilitando el lijado y preparando la superficie para el acabado final.' },
  { id: 'mad-3', categoryId: 'maderas', subCategoryId: 'poliuretanos-madera', tag: 'Poliuretanos', name: 'Barniz PU Blanco/Chocolate', description: 'Acabado de poliuretano pigmentado de alta cobertura y resistencia, ideal para muebles de cocina y baño que requieren protección contra humedad.' },
  { id: 'mad-4', categoryId: 'maderas', subCategoryId: 'poliuretanos-madera', tag: 'Poliuretanos', name: 'Brillo Directo PU AS-100', description: 'Barniz de poliuretano de altos sólidos y baja viscosidad, diseñado para acabados de insuperable calidad y poro cerrado.' },

  // MADERAS - Nitrocelulosa
  { id: 'mad-5', categoryId: 'maderas', subCategoryId: 'nitrocelulosa-madera', tag: 'Nitrocelulosa', name: 'Laca Acrílica Acril-D', description: 'Laca de nitrocelulosa modificada con resinas acrílicas, proporciona un acabado transparente, terso y de secado rápido, no amarillea.' },
  { id: 'mad-6', categoryId: 'maderas', subCategoryId: 'nitrocelulosa-madera', tag: 'Nitrocelulosa', name: 'Sellador Nitro 1000', description: 'Sellador de nitrocelulosa de alta concentración (48% sólidos), fácil de lijar y con gran capacidad de relleno para madera virgen.' },
  { id: 'mad-7', categoryId: 'maderas', subCategoryId: 'nitrocelulosa-madera', tag: 'Nitrocelulosa', name: 'Sellador Alta Dilución', description: 'Sellador económico diseñado para una alta dilución sin perder propiedades de sellado y lijado.' },
  { id: 'mad-8', categoryId: 'maderas', subCategoryId: 'nitrocelulosa-madera', tag: 'Nitrocelulosa', name: 'Laca Industrial', description: 'Acabado de nitrocelulosa de secado rápido, ideal para procesos de producción en serie y carpintería general.' },

  // MADERAS - Entintados
  { id: 'mad-9', categoryId: 'maderas', subCategoryId: 'entintados-madera', tag: 'Barnices Entintados', name: 'Barniz Entintado Hogar', description: 'Producto "todo en uno" que da color y brillo a la madera en un solo paso, manteniendo visible la veta natural.' },
  { id: 'mad-10', categoryId: 'maderas', subCategoryId: 'entintados-madera', tag: 'Barnices Entintados', name: 'Tinta al Alcohol', description: 'Tinta penetrante de secado rápido para teñir madera cruda, disponible en tonos clásicos como nogal, caoba y cedro.' },

  // MADERAS - Complementos
  { id: 'mad-11', categoryId: 'maderas', subCategoryId: 'complementos-madera', tag: 'Complementos Maderas', name: 'Mata Polilla', description: 'Preservador preventivo y curativo que penetra en la madera para protegerla contra termitas, polillas y hongos.' },
  { id: 'mad-12', categoryId: 'maderas', subCategoryId: 'complementos-madera', tag: 'Complementos Maderas', name: 'Removedor para madera', description: 'Gel formulado para remover barnices y lacas viejas de muebles de madera sin manchar ni dañar la fibra natural.' },

  // DECORATIVO - Vinílicas
  { id: 'dec-1', categoryId: 'decorativo', subCategoryId: 'vinilicas-deco', tag: 'Vinílicas', name: 'Diamaluxe', description: 'Pintura Vinil-Acrílica Premium lavable, con garantía de hasta 12 años. Ofrece acabado satinado/mate terso y máximo poder cubriente.' },
  { id: 'dec-2', categoryId: 'decorativo', subCategoryId: 'vinilicas-deco', tag: 'Vinílicas', name: 'Diamaflex', description: 'Pintura vinílica de alta calidad y acabado semi-satinado, ideal para disimular imperfecciones. Resistente y lavable para interiores y exteriores.' },
  { id: 'dec-3', categoryId: 'decorativo', subCategoryId: 'vinilicas-deco', tag: 'Vinílicas', name: 'Diamacril', description: 'Pintura vinílica convencional para mantenimiento de muros, buen rendimiento y variedad de colores para uso general.' },
  { id: 'dec-4', categoryId: 'decorativo', subCategoryId: 'vinilicas-deco', tag: 'Vinílicas', name: 'Diamacolor', description: 'Pintura económica para interiores, diseñada para proyectos de gran volumen con buena adherencia y facilidad de aplicación.' },

  // DECORATIVO - Esmaltes
  { id: 'dec-5', categoryId: 'decorativo', subCategoryId: 'esmaltes-deco', tag: 'Esmaltes', name: 'Esmalte D500', description: 'Esmalte alquidálico anticorrosivo premium para cualquier clima (incluyendo costa). Ideal para metales, madera y mampostería.' },
  { id: 'dec-6', categoryId: 'decorativo', subCategoryId: 'esmaltes-deco', tag: 'Esmaltes', name: 'Esmalte D50', description: 'Esmalte alquídico de secado normal, formulado para regiones tropicales y mantenimiento general de herrería.' },
  { id: 'dec-7', categoryId: 'decorativo', subCategoryId: 'esmaltes-deco', tag: 'Esmaltes', name: 'Esmalte DG Secado Rápido', description: 'Esmalte industrial de secado rápido que proporciona protección anticorrosiva y eficiencia en líneas de producción.' },
  { id: 'dec-8', categoryId: 'decorativo', subCategoryId: 'esmaltes-deco', tag: 'Esmaltes', name: 'Esmalte Base Agua D1000', description: 'Esmalte ecológico de bajo olor y secado rápido, ideal para interiores y superficies donde se requiere baja toxicidad.' },

  // DECORATIVO - Impermeabilizantes
  { id: 'dec-9', categoryId: 'decorativo', subCategoryId: 'imper-deco', tag: 'Impermeabilizantes', name: 'Imperdiamante Fibratado', description: 'Impermeabilizante acrílico reforzado con fibras para puentear grietas sin necesidad de malla. Durabilidad de 3 o 5 años.' },
  { id: 'dec-10', categoryId: 'decorativo', subCategoryId: 'imper-deco', tag: 'Impermeabilizantes', name: 'Imperdiamante Ecológico', description: 'Impermeabilizante formulado con materiales sustentables y resinas de alto desempeño para protección térmica y contra lluvias.' },

  // DECORATIVO - Aerosoles
  { id: 'dec-11', categoryId: 'decorativo', subCategoryId: 'aerosoles-deco', tag: 'Aerosoles', name: 'Aerosol Esmalte Acrílico', description: 'Esmalte en aerosol de secado rápido y válvula de fácil aplicación, disponible en colores sólidos, metálicos y alta temperatura.' },

  // DECORATIVO - Selladores
  { id: 'dec-12', categoryId: 'decorativo', subCategoryId: 'selladores-deco', tag: 'Selladores', name: 'Sellador Vinílico 5x1', description: 'Sellador concentrado para muros de concreto y yeso; mejora el rendimiento de la pintura final y uniformiza la absorción.' },

  // DECORATIVO - Especiales
  { id: 'dec-13', categoryId: 'decorativo', subCategoryId: 'especiales-deco', tag: 'Especiales', name: 'Pintura para Tráfico', description: 'Pintura base solvente de alta resistencia a la abrasión y secado rápido para señalización vial y guarniciones.' },
  { id: 'dec-14', categoryId: 'decorativo', subCategoryId: 'especiales-deco', tag: 'Especiales', name: 'Pintura para Albercas', description: 'Recubrimiento de hule clorado resistente a químicos de alberca y humedad constante, color azul duradero.' }
];
