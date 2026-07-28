import React from 'react';
import { SEO } from '../components/common/SEO/SEO';
import { HeroSection } from '../components/home/HeroSection/HeroSection';
import { TrustStrip } from '../components/home/TrustStrip/TrustStrip';
import { CategoryNavigator } from '../components/home/CategoryNavigator/CategoryNavigator';
import { ProcessPreview } from '../components/home/ProcessPreview/ProcessPreview';
import { FeaturedProducts } from '../components/home/FeaturedProducts/FeaturedProducts';
import { WhyOilganic } from '../components/home/WhyOilganic/WhyOilganic';
import { OrderChannels } from '../components/home/OrderChannels/OrderChannels';
import { StoreLocationSection } from '../components/home/StoreLocationSection/StoreLocationSection';
import { FAQSection } from '../components/home/FAQSection/FAQSection';
import { BUSINESS_CONFIG } from '../config/business';

export const HomePage: React.FC = () => {
  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: BUSINESS_CONFIG.name,
      description: BUSINESS_CONFIG.description,
      telephone: BUSINESS_CONFIG.phoneDisplay,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS_CONFIG.address,
        addressLocality: 'Bakı',
        addressCountry: 'AZ'
      },
      openingHours: 'Mo-Su 09:00-19:00',
      url: 'https://oilganic.az/'
    }
  ];

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
      <OrderChannels />
      <StoreLocationSection />
      <FAQSection />
    </>
  );
};
