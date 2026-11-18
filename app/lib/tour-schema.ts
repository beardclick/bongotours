import type { Tour } from '../data';

export const SITE_ORIGIN = 'https://bongoutdoors.com';
export const tourUrl = (slug: string) => `${SITE_ORIGIN}/tours/${encodeURIComponent(slug)}`;

// Never inject database strings directly into a script element.
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

export function buildTourSchema(tour: Tour) {
  const url = tourUrl(tour.slug);
  const unit = tour.priceType === 'group' ? 'grupo' : 'persona';
  // Same initial tariff shown by BookingWidget before a date is selected.
  const price = tour.priceType === 'group' ? (tour.groupPrice ?? tour.price) : tour.price;
  // Demo/error fallbacks and ambiguous tariffs must not advertise a numeric offer.
  const hasPrice = tour.schemaPriceVerified === true && !tour.priceOnRequest && Number.isFinite(price) && price > 0;
  const images = [...new Set([tour.image, ...(tour.gallery ?? [])])].flatMap(image => {
    try {
      const absolute = new URL(image, SITE_ORIGIN);
      return ['http:', 'https:'].includes(absolute.protocol) ? [absolute.href] : [];
    } catch { return []; }
  });
  const conditions = `Tarifa base en USD por ${unit}. Mínimo ${tour.minPeople} persona(s). El precio final se confirma al seleccionar la fecha y la cantidad de personas; puede variar por temporada. Disponibilidad sujeta a confirmación.`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url,
        name: tour.h1, description: tour.short, inLanguage: 'es',
        mainEntity: { '@id': `${url}#tour` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': hasPrice ? 'Product' : 'TouristTrip',
        '@id': `${url}#tour`, url, name: tour.name,
        description: tour.short,
        ...(images.length ? { image: images } : {}),
        ...(hasPrice ? {
          category: tour.category,
          brand: { '@type': 'Brand', name: 'Bongo Outdoors' },
          offers: {
            '@type': 'Offer', url, price: price.toFixed(2), priceCurrency: 'USD',
            name: `Tarifa base por ${unit}`, description: conditions,
            seller: { '@id': `${SITE_ORIGIN}/#organization` },
            priceSpecification: {
              '@type': 'UnitPriceSpecification', price: price.toFixed(2), priceCurrency: 'USD',
              referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitText: unit },
            },
          },
        } : { provider: { '@id': `${SITE_ORIGIN}/#organization` } }),
      },
      {
        '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Tours', item: `${SITE_ORIGIN}/tours` },
          { '@type': 'ListItem', position: 3, name: tour.name, item: url },
        ],
      },
    ],
  };
}
