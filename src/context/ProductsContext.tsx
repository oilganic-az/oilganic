import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import generatedCatalog from '../data/catalog.generated.json';
import type { Product } from '../types/product';

export interface AdminMutationResponse {
  success: boolean;
  message: string;
  productId?: string;
}

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  addProduct: (
    product: Omit<Product, 'id'>,
    csrfToken?: string | null
  ) => Promise<AdminMutationResponse>;
  updateProduct: (
    id: string,
    updatedFields: Partial<Product>,
    csrfToken?: string | null
  ) => Promise<AdminMutationResponse>;
  deleteProduct: (
    id: string,
    csrfToken?: string | null
  ) => Promise<AdminMutationResponse>;
  resetToDefaultProducts: (
    csrfToken?: string | null
  ) => Promise<AdminMutationResponse>;
  getProductBySlug: (
    slug: string
  ) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const products = generatedCatalog.products as Product[];

async function sendProductMutation(
  action: 'create' | 'update' | 'delete' | 'restore',
  payload: Record<string, unknown>,
  csrfToken?: string | null
): Promise<AdminMutationResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch('/api/admin-products', {
    method: action === 'delete' ? 'DELETE' : action === 'update' ? 'PATCH' : 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ action, ...payload })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    const errorMsg = data.error || `Məhsul əməliyyatı xətası (${response.status})`;
    throw new Error(errorMsg);
  }

  return {
    success: true,
    message: data.message || 'Saxlanıldı, yenilənmə yayımlanır',
    productId: data.productId
  };
}

const contextValue: ProductsContextType = {
  products,
  isLoading: false,

  addProduct: async (productData, csrfToken) => {
    const tempId = `manual-${Date.now()}`;
    const product: Product = {
      ...productData,
      id: tempId,
      currency: 'AZN',
      verificationStatus: 'verified'
    } as Product;

    return sendProductMutation('create', { product }, csrfToken);
  },

  updateProduct: async (id, updatedFields, csrfToken) => {
    const existing = products.find(p => p.id === id);
    const fullProduct: Product = {
      ...(existing || {}),
      ...updatedFields,
      id,
      currency: 'AZN',
      verificationStatus: 'verified'
    } as Product;

    return sendProductMutation('update', { product: fullProduct }, csrfToken);
  },

  deleteProduct: async (id, csrfToken) => {
    return sendProductMutation('delete', { productId: id }, csrfToken);
  },

  resetToDefaultProducts: async (csrfToken) => {
    return sendProductMutation('restore', { action: 'reset' }, csrfToken);
  },

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
    throw new Error('useProducts must be used within a ProductsProvider');
  }

  return context;
};