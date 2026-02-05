// Ubicaciones/sucursales del negocio
export const BUSINESS_LOCATIONS = [
  {
    id: 'ferrocarril',
    name: "Sucursal Ferrocarril",
    address: "Avenida ferrocarril 805- D",
    city: "Oaxaca",
    postalCode: "68000",
    latitude: 17.0627,
    longitude: -96.7236,
    phone: "+52 951-143-34-67",
    mobile: "+52 951-235-95-85",
    hours: "Lunes a Viernes de 8:30 am a 6:30 pm, Sábados de 8:30 am a 4:30 pm",
    radius: "8km"
  },
  {
    id: 'culturas-xoxo',
    name: "Sucursal Las culturas xoxo",
    address: "Carr. A.Arrazola 118, 21 de marzo, col. Las culturas",
    city: "Oaxaca",
    postalCode: "68010",
    latitude: 17.0430,
    longitude: -96.7100,
    phone: "+52 951-768-30-49",
    mobile: "+52 951-652-35-93",
    hours: "Lunes a Viernes de 8:30 am a 6:00 pm, Sábados de 8:30 am a 4:30 pm",
    radius: "10km"
  }
];

// Información principal del negocio
export const BUSINESS_INFO = {
  name: 'Pinturas Diamante',
  description: 'Soluciones de pintura de alta gama para automotriz, maderas y decorativo',
  url: 'https://pinturasdiamante.com',
  logo: 'https://pinturasdiamante.com/img/catalog/LOGO-WEB-DIAMANTE-PNG.png',
  email: 'info@pinturasdiamante.com',
  phone: '+52 951-143-34-67',
  sameAs: [
    'https://www.facebook.com/pinturasdiamante',
    'https://www.instagram.com/pinturasdiamante',
  ]
};

// Palabras clave por sección (máximo 5)
export const SEO_KEYWORDS = {
  home: ['pinturas Oaxaca', 'pintura automotriz', 'pintura maderas', 'pintura decorativa', 'Diamante'],
  automotriz: ['pintura automotriz', 'esmalte automotriz', 'primer automotriz', 'barniz transparente', 'repintado'],
  maderas: ['pintura maderas', 'barniz madera', 'laca madera', 'protección madera', 'acabado madera'],
  decorativo: ['pintura decorativa', 'pintura vinil-acrílica', 'impermeabilizante', 'pintura muros', 'acabado decorativo']
};

// Descripciones por sección
export const SEO_DESCRIPTIONS = {
  automotriz: 'Soluciones de pintura de alta gama para el repintado y protección vehicular. Productos premium con garantía de durabilidad',
  maderas: 'Protección y embellecimiento para todo tipo de superficies de madera. Barnices, lacas y tratamientos especializados',
  decorativo: 'Pinturas y acabados para transformar hogares y espacios comerciales. Soluciones decorativas de calidad profesional'
};
