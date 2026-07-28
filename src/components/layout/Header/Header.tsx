import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, MessageCircle } from 'lucide-react';
import { MAIN_NAV_ITEMS } from '../../../config/navigation';
import { BUSINESS_CONFIG } from '../../../config/business';
import { useCart } from '../../../hooks/useCart';
import { useScrollDirection } from '../../../hooks/useScrollDirection';
import { Drawer } from '../../common/Drawer/Drawer';
import { SearchModal } from '../../catalog/SearchModal/SearchModal';
import { OilganicLogo } from '../../common/OilganicLogo/OilganicLogo';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { scrollDirection, isScrolled } = useScrollDirection();

  // Never hide header when a modal, drawer, or keyboard focus is active
  const isAnyOverlayOpen = isMobileNavOpen || isSearchOpen || isCartOpen || isFocused;
  const isHidden = scrollDirection === 'down' && isScrolled && !isAnyOverlayOpen;

  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolledHeader : ''} ${isHidden ? styles.headerHidden : ''}`}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFocused(false);
          }
        }}
      >
        <div className={`container ${styles.container}`}>
          {/* Logo */}
          <Link to="/" className={styles.logoLink} aria-label="Oilganic Ana Səhifə">
            <OilganicLogo variant="header" />
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav} aria-label="Əsas Menyu">
            <ul className={styles.navList}>
              {MAIN_NAV_ITEMS.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search Trigger */}
            <button
              className={styles.iconBtn}
              onClick={() => setIsSearchOpen(true)}
              aria-label="Məhsul axtar"
            >
              <Search size={20} />
            </button>

            {/* Cart Trigger */}
            <button
              className={styles.cartBtn}
              onClick={() => setIsCartOpen(true)}
              aria-label={`Səbət (${totalItems} məhsul)`}
            >
              <ShoppingBag size={20} />
              <span className={styles.cartText}>Səbət</span>
              {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
            </button>

            {/* WhatsApp CTA */}
            <a
              href={BUSINESS_CONFIG.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
              aria-label="WhatsApp ilə əlaqə"
            >
              <MessageCircle size={18} />
              <span className={styles.hideMobile}>WhatsApp</span>
            </a>

            {/* Mobile Nav Hamburger Trigger */}
            <button
              className={styles.mobileMenuTrigger}
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Menyunu aç"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        title="Menyu"
        position="left"
      >
        <div className={styles.mobileDrawerContent}>
          <div className={styles.mobileLogoBox}>
            <Link to="/" onClick={() => setIsMobileNavOpen(false)} aria-label="Oilganic Ana Səhifə">
              <OilganicLogo variant="header" />
            </Link>
          </div>
          <nav aria-label="Mobil Menyu">
            <ul className={styles.mobileNavList}>
              {MAIN_NAV_ITEMS.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`${styles.mobileNavLink} ${isActive ? styles.mobileActive : ''}`}
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.mobileDrawerFooter}>
            <p className={styles.mobileHours}>{BUSINESS_CONFIG.workingHours}</p>
            <p className={styles.mobileAddress}>{BUSINESS_CONFIG.address}</p>
          </div>
        </div>
      </Drawer>
    </>
  );
};
