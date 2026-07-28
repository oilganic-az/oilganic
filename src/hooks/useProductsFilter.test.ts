import { describe, it, expect } from 'vitest';
import { filterProducts } from './useProductsFilter';
import { PRODUCTS } from '../data/products';

describe('Product Catalog Filtering and Sorting', () => {
  it('filters products by category correctly', () => {
    const oils = filterProducts(PRODUCTS, { category: 'oils', inStockOnly: false, searchQuery: '', sortBy: 'default' });
    expect(oils.every(p => p.categoryId === 'oils')).toBe(true);
    expect(oils.length).toBeGreaterThan(0);
  });

  it('filters products by in-stock status', () => {
    const inStock = filterProducts(PRODUCTS, { category: 'all', inStockOnly: true, searchQuery: '', sortBy: 'default' });
    expect(inStock.every(p => p.inStock === true)).toBe(true);
  });

  it('sorts products by price low-to-high and high-to-low', () => {
    const sortedLowHigh = filterProducts(PRODUCTS, { category: 'all', inStockOnly: false, searchQuery: '', sortBy: 'price_asc' });
    expect(sortedLowHigh[0].price).toBeLessThanOrEqual(sortedLowHigh[sortedLowHigh.length - 1].price);

    const sortedHighLow = filterProducts(PRODUCTS, { category: 'all', inStockOnly: false, searchQuery: '', sortBy: 'price_desc' });
    expect(sortedHighLow[0].price).toBeGreaterThanOrEqual(sortedHighLow[sortedHighLow.length - 1].price);
  });
});
