import React from 'react';
import { Outlet } from 'react-router-dom';
import { SkipLink } from '../../common/SkipLink/SkipLink';
import { UtilityBar } from '../UtilityBar/UtilityBar';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import { CartDrawer } from '../../cart/CartDrawer/CartDrawer';
import { OpeningIntro } from '../../motion/OpeningIntro/OpeningIntro';
import { ScrollProgress } from '../../motion/ScrollProgress/ScrollProgress';
import styles from './AppLayout.module.css';

export const AppLayout: React.FC = () => {
  return (
    <div className={styles.appShell}>
      <OpeningIntro />
      <ScrollProgress />
      <SkipLink />
      <UtilityBar />
      <Header />
      <main id="main-content" className={styles.main}>
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
};
