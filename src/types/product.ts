export type VerificationStatus = 'verified' | 'sample' | 'pending';

export type ProductSize = {
  id: string;
  label: string; // e.g. "100 ml", "250 ml", "300 q"
  price: number;
  inStock: boolean;
  verificationStatus?: VerificationStatus;
  imageSrc?: string;
};

export type ProductImage = {
  src: string;
  alt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  shortDescription: string;
  description?: string;
  price: number;
  currency: 'AZN';
  sizes?: ProductSize[];
  images: ProductImage[];
  ingredients?: string[];
  usage?: string;
  storage?: string;
  allergens?: string[];
  origin?: string;
  productionType?: 'oilganic' | 'partner';
  manufacturer?: string;
  inStock: boolean;
  featured?: boolean;
  tags?: string[];
  woltUrl?: string;
  verificationStatus: VerificationStatus;
};
