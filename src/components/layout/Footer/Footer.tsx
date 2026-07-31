import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, ShoppingBag, MessageCircle, MapPin, Clock, Phone, Linkedin } from 'lucide-react';
import { OilganicLogo } from '../../common/OilganicLogo/OilganicLogo';
import { BUSINESS_CONFIG } from '../../../config/business';
import { MAIN_NAV_ITEMS, FOOTER_LEGAL_ITEMS } from '../../../config/navigation';
import { CATEGORIES } from '../../../data/categories';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const [showDeveloperCard, setShowDeveloperCard] = useState<boolean>(false);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.topSection}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <Link to="/" className={styles.logoLink} aria-label="Oilganic Ana Səhifə">
              <OilganicLogo variant="footer" theme="dark" />
            </Link>
            <p className={styles.brandTagline}>{BUSINESS_CONFIG.tagline}</p>
            <p className={styles.brandDesc}>{BUSINESS_CONFIG.description}</p>
            <div className={styles.socialLinks}>
              <a
                href={BUSINESS_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.socialIcon}
              >
                <Instagram size={18} />
              </a>
              <a
                href={BUSINESS_CONFIG.woltUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wolt Store"
                className={styles.socialIcon}
              >
                <ShoppingBag size={18} />
              </a>
              <a
                href={BUSINESS_CONFIG.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className={styles.socialIcon}
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Naviqasiya</h3>
            <ul className={styles.linkList}>
              {MAIN_NAV_ITEMS.map(item => (
                <li key={item.path}>
                  <Link to={item.path} className={styles.footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Kateqoriyalar</h3>
            <ul className={styles.linkList}>
              {CATEGORIES.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.id}`} className={styles.footerLink}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Mağaza məlumatı</h3>
            <ul className={styles.infoList}>
              <li className={styles.infoItem}>
                <Clock size={16} className={styles.infoIcon} />
                <span>{BUSINESS_CONFIG.workingHours}</span>
              </li>
              <li className={styles.infoItem}>
                <MapPin size={16} className={styles.infoIcon} />
                <span>{BUSINESS_CONFIG.address}</span>
              </li>
              <li className={styles.infoItem}>
                <Phone size={16} className={styles.infoIcon} />
                <a href={`tel:${BUSINESS_CONFIG.whatsappRaw}`} className={styles.infoLink}>
                  {BUSINESS_CONFIG.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <div className={styles.copyrightGroup}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} {BUSINESS_CONFIG.name}. Bütün hüquqlar qorunur.
            </p>
            <div className={styles.developerAttr}>
              Sayt{' '}
              <span className={styles.developerPopoverWrapper}>
                <button
                  type="button"
                  className={styles.developerBtn}
                  onClick={() => setShowDeveloperCard(!showDeveloperCard)}
                  aria-expanded={showDeveloperCard}
                  aria-label="Hazırlayan haqqında məlumat"
                >
                  Elməddin Möhübbətov
                </button>
                {showDeveloperCard && (
                  <div className={styles.developerCard}>
                    <div className={styles.developerSocials}>
                      <a
                        href="https://wa.me/994773343536"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.devSocialIcon} ${styles.whatsapp}`}
                        title="WhatsApp"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </a>
                      <a
                        href="https://instagram.com/mr.elmaddin.apk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.devSocialIcon} ${styles.instagram}`}
                        title="Instagram"
                        aria-label="Instagram"
                      >
                        <Instagram size={18} />
                      </a>
                      <a
                        href="https://linkedin.com/in/elmaddin-mohubbatov"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.devSocialIcon} ${styles.linkedin}`}
                        title="LinkedIn"
                        aria-label="LinkedIn"
                      >
                        <Linkedin size={18} />
                      </a>
                    </div>
                  </div>
                )}
              </span>{' '}
              tərəfindən hazırlanmışdır.
            </div>
          </div>
          <ul className={styles.legalList}>
            {FOOTER_LEGAL_ITEMS.map(item => (
              <li key={item.path}>
                <Link to={item.path} className={styles.legalLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};
