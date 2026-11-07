import { BUSINESS_INFO, BUSINESS_LOCATIONS } from '../data/seo';
import { businessLocationPath } from './routes';

type BusinessLocation = (typeof BUSINESS_LOCATIONS)[number];

const generateBusinessLocationEntity = (
  location: BusinessLocation,
  domain = BUSINESS_INFO.url
) => ({
  '@type': 'LocalBusiness',
  '@id': `${domain}/#business-${location.id}`,
  name: location.name,
  description: `${BUSINESS_INFO.name} en ${location.searchArea}.`,
  url: `${domain}${businessLocationPath(location.id)}`,
  hasMap: location.mapLink,
  image: BUSINESS_INFO.logo,
  brand: {
    '@type': 'Brand',
    '@id': `${domain}/#brand`,
    name: 'Diamante Pinturas'
  },
  telephone: location.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: location.address,
    addressLocality: location.locality,
    addressRegion: 'Oaxaca',
    postalCode: location.postalCode,
    addressCountry: 'MX'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: location.latitude,
    longitude: location.longitude
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:30',
      closes: location.weekdayClosingTime
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:30',
      closes: '16:30'
    }
  ]
});

export const generateBusinessLocationSchema = (
  location: BusinessLocation,
  domain = BUSINESS_INFO.url
) => ({
  '@context': 'https://schema.org',
  ...generateBusinessLocationEntity(location, domain)
});

export const generateBusinessLocationSchemas = (domain = BUSINESS_INFO.url) =>
  BUSINESS_LOCATIONS.map(location => generateBusinessLocationEntity(location, domain));
