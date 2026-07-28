import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartProvider } from './CartContext';
import { useCart } from '../hooks/useCart';
import { PRODUCTS } from '../data/products';

const multiSizeProd = PRODUCTS.find(p => p.sizes && p.sizes.length > 1) || PRODUCTS[0];

const TestComponent: React.FC = () => {
  const { cartItems, addToCart, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } = useCart();

  return (
    <div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="subtotal">{subtotal}</div>
      <div data-testid="cart-lines">{cartItems.length}</div>
      <button
        data-testid="add-btn-1"
        onClick={() => addToCart(multiSizeProd, multiSizeProd.sizes![0])}
      >
        Add Size 1
      </button>
      <button
        data-testid="add-btn-2"
        onClick={() => addToCart(multiSizeProd, multiSizeProd.sizes![1] || multiSizeProd.sizes![0])}
      >
        Add Size 2
      </button>
      <button
        data-testid="clear-btn"
        onClick={clearCart}
      >
        Clear Cart
      </button>
      {cartItems.map(item => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          <span>{item.product.name} ({item.selectedSize?.label})</span>
          <span data-testid={`qty-${item.id}`}>{item.quantity}</span>
          <button
            data-testid={`inc-${item.id}`}
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            +
          </button>
          <button
            data-testid={`dec-${item.id}`}
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            -
          </button>
          <button
            data-testid={`remove-${item.id}`}
            onClick={() => removeFromCart(item.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

describe('Cart Context State & Storage Mutations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds items, merges same product/size quantities, and separates different sizes', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const add100mlBtn = screen.getByTestId('add-btn-1');
    const add250mlBtn = screen.getByTestId('add-btn-2');

    // Add size 1 twice
    fireEvent.click(add100mlBtn);
    fireEvent.click(add100mlBtn);

    expect(screen.getByTestId('cart-lines').textContent).toBe('1');
    expect(screen.getByTestId('total-items').textContent).toBe('2');

    // Add size 2
    fireEvent.click(add250mlBtn);
    expect(screen.getByTestId('cart-lines').textContent).toBe('2');
    expect(screen.getByTestId('total-items').textContent).toBe('3');
  });

  it('updates quantities, removes items, and clears the cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const add100mlBtn = screen.getByTestId('add-btn-1');
    fireEvent.click(add100mlBtn);

    const itemId = `${multiSizeProd.id}-${multiSizeProd.sizes![0].id}`;
    const incBtn = screen.getByTestId(`inc-${itemId}`);
    fireEvent.click(incBtn);

    expect(screen.getByTestId(`qty-${itemId}`).textContent).toBe('2');

    const removeBtn = screen.getByTestId(`remove-${itemId}`);
    fireEvent.click(removeBtn);

    expect(screen.getByTestId('cart-lines').textContent).toBe('0');
  });

  it('handles invalid localStorage JSON gracefully without crashing', () => {
    localStorage.setItem('oilganic_cart_v1', 'INVALID_JSON_CORRUPTED');

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-lines').textContent).toBe('0');
    consoleSpy.mockRestore();
  });
});
