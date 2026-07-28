import { useState, useMemo } from 'react';
import { Product } from '../types/product';
import { matchesQuery } from '../utils/search';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export interface FilterOptions {
  category?: string;
  inStockOnly?: boolean;
  searchQuery?: string;
  sortBy?: string;
}

export function filterProducts(products: Product[], options: FilterOptions): Product[] {
  const { category = 'all', inStockOnly = false, searchQuery = '', sortBy = 'featured' } = options;

  return products
    .filter(product => {
      if (category !== 'all' && product.categoryId !== category) return false;
      if (inStockOnly && !product.inStock) return false;
      if (searchQuery.trim()) {
        const matchName = matchesQuery(product.name, searchQuery);
        const matchDesc = matchesQuery(product.shortDescription, searchQuery);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc' || sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price_desc' || sortBy === 'price-desc') return b.price - a.price;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
}

export function useProductsFilter(initialProducts: Product[]) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [oilganicOnly, setOilganicOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter(product => {
        // Category filter
        if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
          return false;
        }

        // Stock filter
        if (inStockOnly && !product.inStock) {
          return false;
        }

        // Oilganic produced only filter
        if (oilganicOnly && product.productionType !== 'oilganic') {
          return false;
        }

        // Search query with Azerbaijani normalization
        if (searchQuery.trim()) {
          const matchName = matchesQuery(product.name, searchQuery);
          const matchDesc = matchesQuery(product.shortDescription, searchQuery);
          const matchTags = product.tags?.some(tag => matchesQuery(tag, searchQuery)) ?? false;
          if (!matchName && !matchDesc && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'az');
        // 'featured' default sort
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [initialProducts, selectedCategory, searchQuery, inStockOnly, oilganicOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setInStockOnly(false);
    setOilganicOnly(false);
    setSortBy('featured');
  };

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    inStockOnly,
    setInStockOnly,
    oilganicOnly,
    setOilganicOnly,
    sortBy,
    setSortBy,
    filteredProducts,
    totalCount: filteredProducts.length,
    resetFilters
  };
}
