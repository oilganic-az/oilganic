import { VerificationStatus } from '../types/product';

export const IS_SAMPLE_CATALOG_ENABLED = import.meta.env.VITE_ENABLE_SAMPLE_CATALOG === 'true';

export const BUSINESS_CONFIG = {
  name: 'Oilganic',
  slogan: 'Təbii yağlar və əzmələr',
  tagline: 'Seçilmiş təbii məhsullar, şəffaf hazırlanma prosesi və birbaşa mağaza təcrübəsi.',
  description: 'Soyuq sıxım təbii yağlar, təbii çərəz əzmələri, bal, bəhməz, şirələr, bitki çayları və seçilmiş yerli wellness məhsulları.',
  phoneDisplay: '077 334 35 36',
  whatsappRaw: '994773343536',
  whatsappLink: 'https://wa.me/994773343536',
  workingHours: 'Hər gün: 09:00 – 19:00',
  address: 'Bakı şəhəri, Nizami r-nu, Cəmşid Naxçıvanski küç. 49C (8-ci km bazarı, mağaza №20)',
  woltUrl: 'https://wolt.com/en/aze/baku/venue/oilganic-shop',
  instagramUrl: 'https://www.instagram.com/oilganic_shop/',
  cloposUrl: 'https://oilganicshop.clopos.menu/az/',
  currency: 'AZN',
  verification: {
    addressStatus: 'verified' as VerificationStatus,
    phoneStatus: 'verified' as VerificationStatus,
    workingHoursStatus: 'verified' as VerificationStatus,
    catalogStatus: IS_SAMPLE_CATALOG_ENABLED ? ('sample' as VerificationStatus) : ('pending' as VerificationStatus)
  },
  /* Internal TODOs for business updates */
  todos: {
    voen: null,
    googleMapsEmbed: null,
    certificates: null
  }
} as const;
