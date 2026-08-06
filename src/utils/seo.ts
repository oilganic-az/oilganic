import { Product } from '../types/product';
import { BUSINESS_CONFIG } from '../config/business';

export const SITE_ORIGIN = 'https://oilganic.az';

export function buildCanonicalUrl(path: string = ''): string {
  if (!path || path === '/') return SITE_ORIGIN;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${cleanPath}`;
}

export function formatImageUrl(src?: string): string {
  if (!src) return `${SITE_ORIGIN}/og-image.png`;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  const cleanSrc = src.startsWith('/') ? src : `/${src}`;
  return `${SITE_ORIGIN}${cleanSrc}`;
}

export function generateProductJsonLd(product: Product): Record<string, unknown> {
  let effectivePrice = product.price;

  if (effectivePrice === null || effectivePrice === undefined) {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      const validSize = product.sizes.find(s => typeof s.price === 'number' && s.price > 0);
      if (validSize && validSize.price !== null) {
        effectivePrice = validSize.price;
      }
    }
  }

  const images = (product.images || [])
    .map(img => formatImageUrl(img.src))
    .filter(Boolean);

  if (images.length === 0) {
    images.push(`${SITE_ORIGIN}/og-image.png`);
  }

  const productUrl = buildCanonicalUrl(`/products/${product.slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description || product.name,
    image: images,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Oilganic'
    },
    offers: {
      '@type': 'Offer',
      price: effectivePrice ?? 0,
      priceCurrency: BUSINESS_CONFIG.currency,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: productUrl
    }
  };
}

export interface BreadcrumbItem {
  name: string;
  item?: string;
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.item ? { item: buildCanonicalUrl(crumb.item) } : {})
    }))
  };
}

export function generateOrganizationAndLocalBusinessJsonLd(): Record<string, unknown>[] {
  const sameAsLinks = [
    BUSINESS_CONFIG.instagramUrl,
    BUSINESS_CONFIG.woltUrl,
    BUSINESS_CONFIG.googleMapsUrl
  ].filter(Boolean);

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS_CONFIG.name,
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/brand/oilganic-logo.svg`,
    sameAs: sameAsLinks,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+${BUSINESS_CONFIG.whatsappRaw}`,
      contactType: 'customer service'
    }
  };

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS_CONFIG.name,
    image: `${SITE_ORIGIN}/og-image.png`,
    url: SITE_ORIGIN,
    telephone: `+${BUSINESS_CONFIG.whatsappRaw}`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nizami r-nu, Cəmşid Naxçıvanski küç. 49C',
      addressLocality: 'Bakı',
      addressCountry: 'AZ'
    },
    openingHours: 'Mo-Su 09:00-19:00',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_CONFIG.coordinates.lat,
      longitude: BUSINESS_CONFIG.coordinates.lng
    }
  };

  return [organization, localBusiness];
}
