import React from 'react';
import { SEO } from '../components/common/SEO/SEO';
import { HeroSection } from '../components/home/HeroSection/HeroSection';
import { TrustStrip } from '../components/home/TrustStrip/TrustStrip';
import { CategoryNavigator } from '../components/home/CategoryNavigator/CategoryNavigator';
import { ProcessPreview } from '../components/home/ProcessPreview/ProcessPreview';
import { FeaturedProducts } from '../components/home/FeaturedProducts/FeaturedProducts';
import { WhyOilganic } from '../components/home/WhyOilganic/WhyOilganic';
import { OrderChannels } from '../components/home/OrderChannels/OrderChannels';
import { CustomerReviews } from '../components/home/CustomerReviews/CustomerReviews';
import { StoreLocationSection } from '../components/home/StoreLocationSection/StoreLocationSection';
import { FAQSection } from '../components/home/FAQSection/FAQSection';
import { BUSINESS_CONFIG } from '../config/business';
import { generateOrganizationAndLocalBusinessJsonLd } from '../utils/seo';

export const HomePage: React.FC = () => {
  const homeJsonLd = generateOrganizationAndLocalBusinessJsonLd();

  return (
    <>
      <SEO
        title="Ana Səhifə - Təbii Yağlar və Əzmələr"
        description={BUSINESS_CONFIG.description}
        canonicalPath="/"
        jsonLd={homeJsonLd}
      />
      <HeroSection />
      <TrustStrip />
      <CategoryNavigator />
      <ProcessPreview />
      <FeaturedProducts />
      <WhyOilganic />
      <CustomerReviews />
      <OrderChannels />
      <StoreLocationSection />
      <FAQSection />
    </>
  );
};
