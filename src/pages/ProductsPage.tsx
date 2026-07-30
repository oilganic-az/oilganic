import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useProductsFilter, SortOption } from '../hooks/useProductsFilter';
import { CategoryRail } from '../components/catalog/CategoryRail/CategoryRail';
import { ProductGrid } from '../components/catalog/ProductGrid/ProductGrid';
import { Button } from '../components/common/Button/Button';
import { SEO } from '../components/common/SEO/SEO';
import styles from './ProductsPage.module.css';

const INITIAL_PAGE_SIZE = 24;
const PAGE_SIZE_STEP = 24;

export const ProductsPage: React.FC = () => {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  const {
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
    totalCount,
    resetFilters
  } = useProductsFilter(products);

  useEffect(() => {
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam, selectedCategory, setSelectedCategory]);

  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [selectedCategory, searchQuery, inStockOnly, oilganicOnly, sortBy]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const isFiltered =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    inStockOnly ||
    oilganicOnly ||
    sortBy !== 'featured';

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <>
      <SEO
        title="Təbii məhsul kataloqu"
        description="Soyuq sıxım yağlar, təbii çərəz əzmələri, bal, bəhməz və bitki çayları kataloqu."
        canonicalPath="/products"
      />
      <div className={styles.page}>
        <div className="container">
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Təbii məhsul kataloqu</h1>
            <p className={styles.subtitle}>
              Soyuq sıxım yağlar, təbii çərəz əzmələri, bal, şirələr və yerli wellness məhsulları ({totalCount} təbii məhsul).
            </p>
          </div>

          {/* Category Selector Rail */}
          <CategoryRail
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />

          {/* Toolbar & Filters */}
          <div className={styles.toolbar}>
            {/* Search Box */}
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="240+ məhsul daxilində axtar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Kataloq axtarışı"
              />
            </div>

            {/* Controls */}
            <div className={styles.controlsGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                />
                <span>Yalnız stokda olanlar</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={oilganicOnly}
                  onChange={e => setOilganicOnly(e.target.checked)}
                />
                <span>Yalnız Oilganic istehsalı</span>
              </label>

              {/* Sort selector */}
              <div className={styles.sortBox}>
                <label htmlFor="sort-select" className={styles.sortLabel}>Sırala:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className={styles.sortSelect}
                >
                  <option value="featured">Seçilmişlər</option>
                  <option value="price-asc">Qiymət (ucuzdan baha)</option>
                  <option value="price-desc">Qiymət (bahadan ucuza)</option>
                  <option value="name-asc">Ad üzrə (A-Z)</option>
                </select>
              </div>

              <button
                type="button"
                className={styles.resetBtn}
                onClick={resetFilters}
                disabled={!isFiltered}
                title="Filterləri sıfırla"
              >
                <RotateCcw size={16} />
                <span>Sıfırla</span>
              </button>
            </div>
          </div>

          {/* Results Metadata */}
          <div className={styles.metaRow}>
            <span className={styles.resultCount}>
              Göstərilir: {visibleProducts.length} / {totalCount} təbii məhsul
            </span>
          </div>

          {/* Product Grid */}
          <ProductGrid products={visibleProducts} />

          {/* Load More Button */}
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
              <Button
                variant="outline"
                size="lg"
                icon={<ChevronDown size={20} />}
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE_STEP)}
              >
                Daha çox göstər ({filteredProducts.length - visibleCount} məhsul qaldı)
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
