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
  googleMapsUrl: 'https://www.google.com/maps/place/Oilganic+shop/@40.4050483,49.9486038,20.11z/',
  googleMapsEmbed: 'https://www.openstreetmap.org/export/embed.html?bbox=49.9436038%2C40.4000483%2C49.9536038%2C40.4100483&layer=mapnik&marker=40.4050483%2C49.9486038',
  coordinates: { lat: 40.4050483, lng: 49.9486038 },
  currency: 'AZN',
  verification: {
    addressStatus: 'verified' as VerificationStatus,
    phoneStatus: 'verified' as VerificationStatus,
    workingHoursStatus: 'verified' as VerificationStatus,
    catalogStatus: IS_SAMPLE_CATALOG_ENABLED ? ('sample' as VerificationStatus) : ('pending' as VerificationStatus)
  }
} as const;
