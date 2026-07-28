import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { HomePage } from './HomePage';
import { Header } from '../components/layout/Header/Header';
import { CartProvider } from '../context/CartContext';

describe('Desktop & Mobile Home Page Smoke Test', () => {
  it('renders Oilganic logo, hero heading, and primary CTA button immediately without blank layout', () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <Header />
          <HomePage />
        </CartProvider>
      </MemoryRouter>
    );

    // 1. Assert Logo is present (SVG role="img" or aria-label)
    const logoElements = screen.getAllByRole('img', { name: /Oilganic/i });
    expect(logoElements.length).toBeGreaterThan(0);

    // 2. Assert Hero Heading is present
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain('Təbii yağlar və əzmələr');

    // 3. Assert Primary CTA Button ("Məhsullara bax") is present
    const ctaButton = screen.getByText('Məhsullara bax');
    expect(ctaButton).toBeInTheDocument();
  });
});
