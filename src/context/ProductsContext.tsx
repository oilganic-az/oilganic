import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import generatedCatalog from '../data/catalog.generated.json';
import type { Product } from '../types/product';

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  addProduct: (
    product: Omit<Product, 'id'>
  ) => Promise<Product>;
  updateProduct: (
    id: string,
    updatedFields: Partial<Product>
  ) => Promise<void>;
  deleteProduct: (
    id: string
  ) => Promise<void>;
  resetToDefaultProducts: () => Promise<void>;
  getProductBySlug: (
    slug: string
  ) => Product | undefined;
}

const ProductsContext =
  createContext<ProductsContextType | undefined>(undefined);

const products = generatedCatalog.products as Product[];

const ADMIN_WRITE_ERROR =
  'Admin yazma backend-i hələ aktiv deyil. Məhsul dəyişiklikləri saxlanılmadı.';

async function rejectAdminMutation(): Promise<never> {
  throw new Error(ADMIN_WRITE_ERROR);
}

const contextValue: ProductsContextType = {
  products,
  isLoading: false,

  addProduct: rejectAdminMutation,
  updateProduct: rejectAdminMutation,
  deleteProduct: rejectAdminMutation,
  resetToDefaultProducts: rejectAdminMutation,

  getProductBySlug: (slug: string) =>
    products.find((product) => product.slug === slug),
};

export const ProductsProvider = ({
  children,
}: {
  children: ReactNode;
}) => (
  <ProductsContext.Provider value={contextValue}>
    {children}
  </ProductsContext.Provider>
);

export const useProducts = (): ProductsContextType => {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error(
      'useProducts must be used within a ProductsProvider'
    );
  }

  return context;
};