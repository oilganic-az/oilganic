import { Product, ProductSize } from './product';

export type CartItem = {
  id: string; // unique item key e.g. "prod_1-size_100ml"
  product: Product;
  selectedSize?: ProductSize;
  quantity: number;
  unitPrice: number | null;
};
