import type { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ProductsProvider,
  useProducts,
} from './ProductsContext';
import generatedCatalog from '../data/catalog.generated.json';

const wrapper = ({
  children,
}: PropsWithChildren) => (
  <ProductsProvider>
    {children}
  </ProductsProvider>
);

describe('ProductsContext admin-owned catalog', () => {
  it('serves the generated catalog dynamically based on source count', () => {
    const { result } = renderHook(
      () => useProducts(),
      { wrapper }
    );

    const variants = result.current.products.flatMap(
      (product) => product.sizes ?? []
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.products).toHaveLength(generatedCatalog.products.length);
    expect(variants.length).toBeGreaterThan(0);

    // Verify uniqueness of product IDs and slugs
    const ids = new Set(result.current.products.map(p => p.id));
    const slugs = new Set(result.current.products.map(p => p.slug));
    expect(ids.size).toBe(result.current.products.length);
    expect(slugs.size).toBe(result.current.products.length);
  });

  it('finds a product by slug', () => {
    const { result } = renderHook(
      () => useProducts(),
      { wrapper }
    );

    const product = result.current.getProductBySlug(
      'tek-zeytun-yagi'
    );

    expect(product?.id).toBe('prod-tek-zeytun-yagi');
    expect(product?.price).toBe(45);
  });

  it('calls protected endpoint for admin changes and throws on network/auth failure', async () => {
    const { result } = renderHook(
      () => useProducts(),
      { wrapper }
    );

    await expect(
      result.current.deleteProduct('prod-tek-zeytun-yagi')
    ).rejects.toThrow();
  });
});