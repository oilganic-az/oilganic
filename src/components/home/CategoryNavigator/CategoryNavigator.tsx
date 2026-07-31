import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../../../data/categories';
import { Reveal } from '../../motion/Reveal/Reveal';
import styles from './CategoryNavigator.module.css';

export const CategoryNavigator: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal variant="fade">
          <div className={styles.headerRow}>
            <div>
              <span className={styles.sectionBadge}>Kataloq</span>
              <h2 className={styles.sectionTitle}>Təbii məhsul kateqoriyaları</h2>
            </div>
            <Link to="/products" className={styles.allLink}>
              Bütün kateqoriyalara bax <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>

        <div className={styles.grid}>
          {CATEGORIES.map((cat, idx) => (
            <Reveal key={cat.id} variant="slideUp" delay={idx * 0.08}>
              <Link
                to={`/products?category=${cat.id}`}
                className={`${styles.categoryCard} ${idx === 0 ? styles.largeCard : ''}`}
                data-interactive
              >
                <div className={styles.cardHeader}>
                  <span className={styles.arrowIcon}>
                    <ArrowUpRight size={20} />
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.catName}>{cat.name}</h3>
                  <p className={styles.catDesc}>{cat.description}</p>
                </div>

                <div className={styles.cardHalo} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
