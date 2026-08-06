import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle, Plus, Minus, Check, Truck } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatters';
import { buildWhatsAppOrderUrl } from '../utils/whatsapp';
import { Badge } from '../components/common/Badge/Badge';
import { Button } from '../components/common/Button/Button';
import { ProductGallery } from '../components/product/ProductGallery/ProductGallery';
import { SizeSelector } from '../components/product/SizeSelector/SizeSelector';
import { ProductTabs } from '../components/product/ProductTabs/ProductTabs';
import { RelatedProducts } from '../components/product/RelatedProducts/RelatedProducts';
import { SEO } from '../components/common/SEO/SEO';
import { generateProductJsonLd, generateBreadcrumbJsonLd } from '../utils/seo';
import styles from './ProductDetailPage.module.css';

import { PRODUCT_SLUG_ALIASES } from '../data/productAliases';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getProductBySlug } = useProducts();
  const resolvedSlug = slug && PRODUCT_SLUG_ALIASES[slug] ? PRODUCT_SLUG_ALIASES[slug] : (slug || '');
  const product = getProductBySlug(resolvedSlug);
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(
    product && product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize(undefined);
    }
    setQuantity(1);
  }, [product]);

  if (!product) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h2>Məhsul tapılmadı</h2>
          <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            Axtardığınız məhsul mövcud deyil və ya silinmiş ola bilər.
          </p>
          <Link to="/products">
            <Button variant="primary">Kataloqa qayıt</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = selectedSize ? selectedSize.price : product.price;
  const totalPrice = currentPrice !== null ? currentPrice * quantity : null;
  const showRealPrice = Boolean(currentPrice !== null && currentPrice > 0);

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
  };

  const whatsAppUrl = buildWhatsAppOrderUrl([
    {
      id: `${product.id}-${selectedSize?.id || 'default'}`,
      product,
      selectedSize,
      quantity,
      unitPrice: currentPrice
    }
  ]);

  const productJsonLd = generateProductJsonLd(product);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Ana səhifə', item: '/' },
    { name: 'Məhsullar', item: '/products' },
    { name: product.name, item: `/products/${product.slug}` }
  ]);

  const primaryImage = selectedSize?.imageSrc || product.images?.[0]?.src;

  return (
    <>
      <SEO
        title={product.name}
        description={product.shortDescription}
        canonicalPath={`/products/${product.slug}`}
        ogType="product"
        ogImage={primaryImage}
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      <div className={styles.page}>
        <div className="container">
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <ol className={styles.breadcrumbList}>
              <li>
                <Link to="/" className={styles.bcLink}>Ana səhifə</Link>
              </li>
              <li className={styles.bcSeparator}>/</li>
              <li>
                <Link to="/products" className={styles.bcLink}>Məhsullar</Link>
              </li>
              <li className={styles.bcSeparator}>/</li>
              <li className={styles.bcActive} aria-current="page">{product.name}</li>
            </ol>
          </nav>

          {/* Hero Grid */}
          <div className={styles.heroGrid}>
            {/* Gallery Column */}
            <div className={styles.galleryCol}>
              <ProductGallery
                key={selectedSize?.id || 'default'}
                images={
                  selectedSize?.imageSrc
                    ? [
                        { src: selectedSize.imageSrc, alt: `${product.name} (${selectedSize.label})` },
                        ...product.images.filter(i => i.src !== selectedSize.imageSrc)
                      ]
                    : product.images
                }
                productName={product.name}
              />
            </div>

            {/* Product Details Column */}
            <div className={styles.infoCol}>
              {/* Badges Row */}
              <div className={styles.badgeRow}>
                {product.productionType === 'oilganic' && (
                  <Badge variant="green">Oilganic istehsalı</Badge>
                )}
                {!product.inStock && <Badge variant="dark">Tükənib</Badge>}
              </div>

              <h1 className={styles.title}>{product.name}</h1>
              <p className={styles.shortDesc}>{product.shortDescription}</p>

              {/* Price Row */}
              <div className={styles.priceRow}>
                <span className={styles.price}>
                  {showRealPrice ? formatCurrency(totalPrice) : 'Qiyməti öyrən'}
                </span>
                {quantity > 1 && showRealPrice && (
                  <span className={styles.unitMeta}>
                    ({formatCurrency(currentPrice)} / {selectedSize?.label || product.unitLabel || 'ədəd'})
                  </span>
                )}
              </div>

              {/* Sizes Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className={styles.sectionBox}>
                  <SizeSelector
                    sizes={product.sizes}
                    selectedSize={selectedSize}
                    onSelectSize={setSelectedSize}
                  />
                </div>
              )}

              {/* Quantity Counter */}
              <div className={styles.quantityRow}>
                <span className={styles.qtyLabel}>Miqdar:</span>
                <div className={styles.qtyBox}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    aria-label="Miqdarı azalt"
                  >
                    <Minus size={16} />
                  </button>
                  <span className={styles.qtyInput}>{quantity}</span>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={handleIncrement}
                    aria-label="Miqdarı artır"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.ctaGroup}>
                {showRealPrice && (
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<ShoppingBag size={20} />}
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    Səbətə əlavə et
                  </Button>
                )}

                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    variant="whatsapp"
                    size="lg"
                    icon={<MessageCircle size={20} />}
                  >
                    WhatsApp ilə sifariş et
                  </Button>
                </a>
              </div>

              {/* Guarantees Box */}
              <div className={styles.channelsBox}>
                <div className={styles.channelRow}>
                  <Check size={16} className={styles.checkIcon} />
                  <span><strong>Şəffaf hazırlanma:</strong> Mağazada canlı olaraq hazırlanır.</span>
                </div>
                <div className={styles.channelRow}>
                  <Truck size={16} className={styles.checkIcon} />
                  <span><strong>Çatdırılma:</strong> Bakı daxili Wolt və kuryer vasitəsilə sürətli çatdırılma.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs (Usage, Ingredients, Storage) */}
          <div className={styles.tabsSection}>
            <ProductTabs product={product} />
          </div>

          {/* Related Products Section */}
          <div className={styles.relatedSection}>
            <RelatedProducts currentProduct={product} />
          </div>
        </div>
      </div>
    </>
  );
};
