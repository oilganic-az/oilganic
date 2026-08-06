import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboardPage } from './AdminDashboardPage';
import { ProtectedRoute, PublicAdminRoute, AdminAuthProvider } from '../../components/auth/AdminGuard';
import { ProductsProvider } from '../../context/ProductsContext';
import { CampaignsProvider } from '../../context/CampaignsContext';
import { CartProvider } from '../../context/CartContext';

function renderAdminRoutes(initialEntry: string) {
  return render(
    <AdminAuthProvider>
      <ProductsProvider>
        <CampaignsProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
              <Routes>
                <Route
                  path="/admin/login"
                  element={
                    <PublicAdminRoute>
                      <AdminLoginPage />
                    </PublicAdminRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </CampaignsProvider>
      </ProductsProvider>
    </AdminAuthProvider>
  );
}

describe('Admin Direct URL Navigation & Guard Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects unauthenticated direct access from /admin to /admin/login screen', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('/api/auth-session')) {
        return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });

    renderAdminRoutes('/admin');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Admin Paneli/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/oilganic.admin/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Admin İdarəetmə Paneli/i)).not.toBeInTheDocument();
  });

  it('allows direct access to /admin when authenticated', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('/api/auth-session')) {
        return new Response(
          JSON.stringify({ authenticated: true, username: 'oilganic.admin', csrfToken: 'test-csrf-123' }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });

    renderAdminRoutes('/admin');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Admin İdarəetmə Paneli/i })).toBeInTheDocument();
    });
  });

  it('redirects authenticated user from /admin/login to /admin dashboard', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('/api/auth-session')) {
        return new Response(
          JSON.stringify({ authenticated: true, username: 'oilganic.admin', csrfToken: 'test-csrf-123' }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });

    renderAdminRoutes('/admin/login');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Admin İdarəetmə Paneli/i })).toBeInTheDocument();
    });
  });
});
