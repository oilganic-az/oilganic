import React from 'react';
import { Clock, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { BUSINESS_CONFIG } from '../../../config/business';
import styles from './UtilityBar.module.css';

export const UtilityBar: React.FC = () => {
  return (
    <div className={styles.utilityBar}>
      <div className={`container ${styles.container}`}>
        <div className={styles.left}>
          <span className={styles.item}>
            <Clock size={14} className={styles.icon} />
            {BUSINESS_CONFIG.workingHours}
          </span>
          <span className={`${styles.item} ${styles.hideMobile}`}>
            <MapPin size={14} className={styles.icon} />
            {BUSINESS_CONFIG.address}
          </span>
        </div>

        <div className={styles.right}>
          <a
            href={BUSINESS_CONFIG.woltUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.woltBadge}
          >
            <ShoppingBag size={14} /> Wolt Çatdırılması
          </a>
          <a href={BUSINESS_CONFIG.whatsappLink} className={styles.phoneLink}>
            <Phone size={14} className={styles.icon} />
            {BUSINESS_CONFIG.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
};
