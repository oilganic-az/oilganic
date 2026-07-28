import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../../../data/products';
import { ProductGrid } from '../../catalog/ProductGrid/ProductGrid';
import { Button } from '../../common/Button/Button';
import { Reveal } from '../../motion/Reveal/Reveal';
import styles from './FeaturedProducts.module.css';

export const FeaturedProducts: React.FC = () => {
  const featured = PRODUCTS.filter(p => p.featured);

  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal variant="fade">
          <div className={styles.headerRow}>
            <div>
              <span className={styles.sectionBadge}>Seçilmişlər</span>
              <h2 className={styles.sectionTitle}>Məşhur təbii məhsullarımız</h2>
            </div>
            <Link to="/products">
              <Button variant="outline" icon={<ArrowRight size={18} />}>
                Bütün məhsullar
              </Button>
            </Link>
          </div>
        </Reveal>

        <Reveal variant="slideUp" delay={0.1}>
          <ProductGrid products={featured} />
        </Reveal>
      </div>
    </section>
  );
};
