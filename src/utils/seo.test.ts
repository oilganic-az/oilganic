import { describe, it, expect } from 'vitest';
import {
  buildCanonicalUrl,
  formatImageUrl,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  generateOrganizationAndLocalBusinessJsonLd,
  SITE_ORIGIN
} from './seo';
import { Product } from '../types/product';

describe('SEO Utilities & JSON-LD Schemas', () => {
  it('generates correct absolute canonical URLs with origin https://oilganic.az', () => {
    expect(buildCanonicalUrl('')).toBe(SITE_ORIGIN);
    expect(buildCanonicalUrl('/')).toBe(SITE_ORIGIN);
    expect(buildCanonicalUrl('/products')).toBe('https://oilganic.az/products');
    expect(buildCanonicalUrl('products/zeytun-yagi')).toBe('https://oilganic.az/products/zeytun-yagi');
  });

  it('formats image URLs as absolute URLs without local host or preview domain references', () => {
    expect(formatImageUrl('/images/products/test.jpg')).toBe('https://oilganic.az/images/products/test.jpg');
    expect(formatImageUrl('https://external.com/image.jpg')).toBe('https://external.com/image.jpg');
    expect(formatImageUrl(undefined)).toBe('https://oilganic.az/og-image.png');
  });

  it('generates valid Product JSON-LD with AZN currency and correct stock status', () => {
    const sampleProduct: Product = {
      id: 'prod-001',
      slug: 'fistix-azmesi',
      name: 'Fıstıq Əzməsi',
      categoryId: 'spreads',
      shortDescription: 'Təbii fıstıq əzməsi',
      price: 12.5,
      currency: 'AZN',
      inStock: true,
      images: [{ src: '/images/fistix.jpg', alt: 'Fıstıq' }],
      verificationStatus: 'verified'
    };

    const jsonLd = generateProductJsonLd(sampleProduct);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd['name']).toBe('Fıstıq Əzməsi');
    expect(jsonLd['sku']).toBe('prod-001');

    const offers = jsonLd['offers'] as Record<string, unknown>;
    expect(offers['@type']).toBe('Offer');
    expect(offers['price']).toBe(12.5);
    expect(offers['priceCurrency']).toBe('AZN');
    expect(offers['availability']).toBe('https://schema.org/InStock');
    expect(offers['url']).toBe('https://oilganic.az/products/fistix-azmesi');
  });

  it('generates valid Product JSON-LD with variant sizes price fallback', () => {
    const variantProduct: Product = {
      id: 'prod-002',
      slug: 'badam-yagi',
      name: 'Badam Yağı',
      categoryId: 'oils',
      shortDescription: 'Soyuq sıxım badam yağı',
      price: null,
      currency: 'AZN',
      inStock: false,
      images: [{ src: '/images/badam.jpg', alt: 'Badam' }],
      sizes: [
        { id: 'size-100', label: '100 ml', price: 15.0, inStock: false }
      ],
      verificationStatus: 'verified'
    };

    const jsonLd = generateProductJsonLd(variantProduct);
    const offers = jsonLd['offers'] as Record<string, unknown>;

    expect(offers['price']).toBe(15.0);
    expect(offers['availability']).toBe('https://schema.org/OutOfStock');
  });

  it('generates BreadcrumbList JSON-LD correctly', () => {
    const breadcrumbs = generateBreadcrumbJsonLd([
      { name: 'Ana səhifə', item: '/' },
      { name: 'Məhsullar', item: '/products' },
      { name: 'Fıstıq Əzməsi', item: '/products/fistix-azmesi' }
    ]);

    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    const items = breadcrumbs['itemListElement'] as Array<Record<string, unknown>>;
    expect(items.length).toBe(3);
    expect(items[0]['name']).toBe('Ana səhifə');
    expect(items[0]['item']).toBe('https://oilganic.az');
    expect(items[2]['item']).toBe('https://oilganic.az/products/fistix-azmesi');
  });

  it('generates Organization and LocalBusiness JSON-LD schemas', () => {
    const schemas = generateOrganizationAndLocalBusinessJsonLd();
    expect(schemas.length).toBe(2);

    const org = schemas[0];
    expect(org['@type']).toBe('Organization');
    expect(org['name']).toBe('Oilganic');
    expect(org['url']).toBe('https://oilganic.az');

    const business = schemas[1];
    expect(business['@type']).toBe('LocalBusiness');
    expect(business['name']).toBe('Oilganic');
    expect(business['telephone']).toContain('994773343536');
  });
});
