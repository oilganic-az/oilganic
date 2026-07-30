import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types/product';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import { validateProductSchema } from '../utils/security';

const STORAGE_KEY = 'oilganic_products';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetToDefaultProducts: () => void;
  getProductBySlug: (slug: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validProducts = parsed.filter(validateProductSchema);
          if (validProducts.length > 0) {
            return validProducts;
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse saved products from localStorage:', e);
    }
    return INITIAL_PRODUCTS;
  });

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
  };

  const addProduct = (newProdData: Omit<Product, 'id'>): Product => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...newProdData,
      id: newId,
    };
    const updated = [newProduct, ...products];
    saveProducts(updated);
    return newProduct;
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, ...updatedFields };
      }
      return p;
    });
    saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
  };

  const resetToDefaultProducts = () => {
    saveProducts(INITIAL_PRODUCTS);
  };

  const getProductBySlug = (slug: string) => {
    return products.find(p => p.slug === slug);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaultProducts,
        getProductBySlug
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = (): ProductsContextType => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
