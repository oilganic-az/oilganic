import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductSize } from '../types/product';
import { CartItem } from '../types/cart';

import { PRODUCTS } from '../data/products';
import { PRODUCT_ID_ALIASES } from '../data/productAliases';

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, selectedSize?: ProductSize, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

const CART_STORAGE_KEY = 'oilganic_cart_v1';

export const CartContext = createContext<CartContextType | undefined>(undefined);

type LegacyRawCartItem = {
  id?: string;
  product?: { id?: string; name?: string };
  selectedSize?: { label?: string };
  quantity?: number;
};

function migrateCartItems(rawItems: unknown[]): CartItem[] {
  const migrated: CartItem[] = [];

  for (const item of rawItems) {
    const raw = item as LegacyRawCartItem;
    if (!raw || !raw.product || !raw.product.id || !raw.product.name) continue;

    let targetProductId = raw.product.id;
    if (PRODUCT_ID_ALIASES[targetProductId]) {
      targetProductId = PRODUCT_ID_ALIASES[targetProductId];
    }

    const canonicalProduct = PRODUCTS.find(p => p.id === targetProductId);
    if (!canonicalProduct) continue;

    let resolvedSize: ProductSize | undefined = undefined;

    if (canonicalProduct.sizes && canonicalProduct.sizes.length > 0) {
      if (raw.selectedSize && raw.selectedSize.label) {
        const rawLabelClean = raw.selectedSize.label.toLowerCase().replace(/\s+/g, '');
        resolvedSize = canonicalProduct.sizes.find(sz => 
          sz.label.toLowerCase().replace(/\s+/g, '') === rawLabelClean
        );
      }

      if (!resolvedSize) {
        const nameLower = raw.product.name.toLowerCase();
        resolvedSize = canonicalProduct.sizes.find(sz => {
          const szLabelClean = sz.label.toLowerCase().replace(/\s+/g, '');
          return nameLower.includes(szLabelClean) || nameLower.includes(szLabelClean.replace(/(\d+)/, '$1 '));
        });
      }

      if (!resolvedSize) {
        resolvedSize = canonicalProduct.sizes[0];
      }
    }

    const unitPrice = resolvedSize ? resolvedSize.price : canonicalProduct.price;
    if (unitPrice === null) continue;

    const itemId = resolvedSize ? `${canonicalProduct.id}-${resolvedSize.id}` : canonicalProduct.id;

    const existingIndex = migrated.findIndex(item => item.id === itemId);
    if (existingIndex > -1) {
      migrated[existingIndex].quantity += raw.quantity || 1;
    } else {
      migrated.push({
        id: itemId,
        product: canonicalProduct,
        selectedSize: resolvedSize,
        quantity: raw.quantity || 1,
        unitPrice
      });
    }
  }

  return migrated;
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const raw = JSON.parse(saved);
        return Array.isArray(raw) ? migrateCartItems(raw) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Storage error fallback
    }
  }, [cartItems]);

  const addToCart = (product: Product, selectedSize?: ProductSize, quantity = 1) => {
    const size = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    const unitPrice = size ? size.price : product.price;
    if (unitPrice === null) return; // Prevent adding unpriced item to cart

    const itemId = size ? `${product.id}-${size.id}` : product.id;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedSize: size,
          quantity,
          unitPrice
        }
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
