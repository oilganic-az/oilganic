import { describe, it, expect } from 'vitest';
import {
  getBaseNameAndVariant,
  normalizeLabel,
  slugify
} from './catalogSyncUtils';
import { PRODUCT_SLUG_ALIASES, PRODUCT_ID_ALIASES } from '../data/productAliases';
import { PRODUCTS } from '../data/products';

describe('Catalog Synchronization & Normalization Engine', () => {
  describe('Unit and Quantity Parsing', () => {
    it('parses Udukumin 100kapsul as 100 kapsul correctly', () => {
      const parsed = getBaseNameAndVariant('Udukumin 100kapsul');
      expect(parsed.base).toBe('Udukumin');
      expect(parsed.rawLabel).toBe('100kapsul');
      expect(normalizeLabel(parsed.rawLabel)).toBe('100 kapsul');
    });

    it('converts absent/default quantity to Standart, never 1 ədəd', () => {
      const parsed = getBaseNameAndVariant('Badam ləpəsi');
      expect(parsed.rawLabel).toBe('default');
      const normalized = normalizeLabel(parsed.rawLabel);
      expect(normalized).toBe('Standart');
      expect(normalized).not.toBe('1 ədəd');
    });

    it('normalizes various volume, weight, and count units correctly', () => {
      expect(normalizeLabel('100ml')).toBe('100 ml');
      expect(normalizeLabel('2litr')).toBe('2 litr');
      expect(normalizeLabel('2l')).toBe('2 litr');
      expect(normalizeLabel('500gr')).toBe('500 gr');
      expect(normalizeLabel('0.2kg')).toBe('200 gr');
      expect(normalizeLabel('1kg')).toBe('1 kg');
      expect(normalizeLabel('kg')).toBe('1 kg');
      expect(normalizeLabel('220 əd')).toBe('220 ədəd');
      expect(normalizeLabel('100 kapsul')).toBe('100 kapsul');
      expect(normalizeLabel('100kapsul')).toBe('100 kapsul');
    });
  });

  describe('Zəncəfil Grouping Rules', () => {
    it('groups Zəncəfil toz and Zəncəfil tozu under Zəncəfil tozu base name', () => {
      const tozVariant = getBaseNameAndVariant('Zəncəfil toz kg');
      const tozuVariant = getBaseNameAndVariant('Zəncəfil tozu 100gr');

      expect(tozVariant.base).toBe('Zəncəfil tozu');
      expect(tozuVariant.base).toBe('Zəncəfil tozu');
      expect(slugify(tozVariant.base)).toBe('zencefil-tozu');
      expect(slugify(tozuVariant.base)).toBe('zencefil-tozu');
    });

    it('keeps Zəncəfil çubuq, Zəncəfil kökü, Zəncəfil tozu, and Zəncəfil yaş as distinct products', () => {
      const cubuq = getBaseNameAndVariant('Zəncəfil çubuq 100gr').base;
      const koku = getBaseNameAndVariant('Zəncəfil kökü 100gr').base;
      const tozu = getBaseNameAndVariant('Zəncəfil tozu 100gr').base;
      const yas = getBaseNameAndVariant('Zəncəfil yaş 1kg').base;

      expect(cubuq).toBe('Zəncəfil çubuq');
      expect(koku).toBe('Zəncəfil kökü');
      expect(tozu).toBe('Zəncəfil tozu');
      expect(yas).toBe('Zəncəfil yaş');

      const slugs = [cubuq, koku, tozu, yas].map(slugify);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(4);
    });

    it('verifies Zəncəfil tozu in catalog contains both 100 gr and 1 kg variants', () => {
      const zencefilTozuProd = PRODUCTS.find(p => p.slug === 'zencefil-tozu');
      expect(zencefilTozuProd).toBeDefined();
      expect(zencefilTozuProd?.sizes?.length).toBe(2);

      const labels = zencefilTozuProd?.sizes?.map(s => s.label);
      expect(labels).toContain('100 gr');
      expect(labels).toContain('1 kg');
    });
  });

  describe('Legacy Redirection Aliases', () => {
    it('contains non-empty PRODUCT_SLUG_ALIASES and PRODUCT_ID_ALIASES', () => {
      expect(Object.keys(PRODUCT_SLUG_ALIASES).length).toBeGreaterThan(0);
      expect(Object.keys(PRODUCT_ID_ALIASES).length).toBeGreaterThan(0);
    });

    it('strictly resolves Günəbaxan legacy slug aliases to canonical gunebaxan-yagi', () => {
      expect(PRODUCT_SLUG_ALIASES['gunebaxan-yagi-1litr']).toBe('gunebaxan-yagi');
      expect(PRODUCT_SLUG_ALIASES['gunebaxan-yagi-2litr']).toBe('gunebaxan-yagi');
    });

    it('strictly resolves Zeytun legacy slug aliases to canonical zeytun-yagi-rafine and zeytun-yagi-soyuq-sixim', () => {
      expect(PRODUCT_SLUG_ALIASES['zeytun-yagi-rafine-1litr']).toBe('zeytun-yagi-rafine');
      expect(PRODUCT_SLUG_ALIASES['zeytun-yagi-rafine-2litr']).toBe('zeytun-yagi-rafine');
      expect(PRODUCT_SLUG_ALIASES['zeytun-yagi-soyuq-sixim-1litr']).toBe('zeytun-yagi-soyuq-sixim');
      expect(PRODUCT_SLUG_ALIASES['zeytun-yagi-soyuq-sixim-2-litr']).toBe('zeytun-yagi-soyuq-sixim');
    });
  });

  describe('Catalog Images & Placeholder Prevention', () => {
    it('ensures no product contains duplicate image paths in its images array', () => {
      PRODUCTS.forEach(p => {
        const paths = p.images.map(img => img.src);
        const uniquePaths = new Set(paths);
        expect(uniquePaths.size).toBe(paths.length);
      });
    });

    it('ensures products with missing media use valid placeholder.svg fallback path', () => {
      const missingMediaProds = PRODUCTS.filter(p => p.sizes?.some(s => s.imageSrc === '/images/products/placeholder.svg'));
      expect(missingMediaProds.length).toBeGreaterThan(0);
      missingMediaProds.forEach(p => {
        expect(p.images.some(img => img.src === '/images/products/placeholder.svg')).toBe(true);
      });
    });
  });
});
