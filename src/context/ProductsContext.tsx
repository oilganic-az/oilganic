import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types/product';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import { validateProductSchema } from '../utils/security';

const COLLECTION = 'products';

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updatedFields: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetToDefaultProducts: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener – every browser (admin or public) sees updates instantly
  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy('name'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<Product, 'id'>;
          fetched.push({ id: docSnap.id, ...data });
        });

        if (fetched.length === 0) {
          // Firestore collection is empty – seed it once with the static data
          seedFirestore();
        } else {
          setProducts(fetched.filter(validateProductSchema));
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Firestore onSnapshot error:', error);
        // Fallback: serve static data so the site still works even if Firebase is misconfigured
        setProducts(INITIAL_PRODUCTS);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const seedFirestore = async () => {
    try {
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach((product) => {
        const { id, ...rest } = product;
        const ref = doc(collection(db, COLLECTION), id);
        batch.set(ref, rest);
      });
      await batch.commit();
      // onSnapshot will fire again and populate state
    } catch (e) {
      console.error('Failed to seed Firestore:', e);
      setProducts(INITIAL_PRODUCTS);
      setIsLoading(false);
    }
  };

  const addProduct = async (newProdData: Omit<Product, 'id'>): Promise<Product> => {
    const docRef = await addDoc(collection(db, COLLECTION), newProdData);
    return { id: docRef.id, ...newProdData };
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>): Promise<void> => {
    const { id: _id, ...fields } = updatedFields as Product;
    await updateDoc(doc(db, COLLECTION, id), fields as Record<string, unknown>);
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION, id));
  };

  const resetToDefaultProducts = async (): Promise<void> => {
    // Delete all existing, then re-seed
    const snapshot = await getDocs(collection(db, COLLECTION));
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => batch.delete(docSnap.ref));
    INITIAL_PRODUCTS.forEach((product) => {
      const { id, ...rest } = product;
      const ref = doc(collection(db, COLLECTION), id);
      batch.set(ref, rest);
    });
    await batch.commit();
  };

  const getProductBySlug = (slug: string): Product | undefined => {
    return products.find((p) => p.slug === slug);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaultProducts,
        getProductBySlug,
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
