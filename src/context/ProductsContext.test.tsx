import type { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ProductsProvider,
  useProducts,
} from './ProductsContext';

const wrapper = ({
  children,
}: PropsWithChildren) => (
  <ProductsProvider>
    {children}
  </ProductsProvider>
);

describe('ProductsContext admin-owned catalog', () => {
  it('serves the validated generated catalog', () => {
    const { result } = renderHook(
      () => useProducts(),
      { wrapper }
    );

    const variants = result.current.products.flatMap(
      (product) => product.sizes ?? []
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.products).toHaveLength(172);
    expect(variants).toHaveLength(247);
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

  it('does not silently persist admin changes', async () => {
    const { result } = renderHook(
      () => useProducts(),
      { wrapper }
    );

    await expect(
      result.current.deleteProduct('prod-tek-zeytun-yagi')
    ).rejects.toThrow(
      'Admin yazma backend-i hələ aktiv deyil'
    );
  });
});