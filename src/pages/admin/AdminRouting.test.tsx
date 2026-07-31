import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AdminLoginPage, ADMIN_AUTH_KEY, ADMIN_LAST_ACTIVE_KEY } from './AdminLoginPage';
import { AdminDashboardPage } from './AdminDashboardPage';
import { ProtectedRoute, PublicAdminRoute } from '../../components/auth/AdminGuard';
import { ProductsProvider } from '../../context/ProductsContext';
import { CampaignsProvider } from '../../context/CampaignsContext';
import { CartProvider } from '../../context/CartContext';

function renderAdminRoutes(initialEntry: string) {
  return render(
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
  );
}

describe('Admin Direct URL Navigation & Guard Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('redirects unauthenticated direct access from /admin to /admin/login screen', () => {
    renderAdminRoutes('/admin');

    // Should render Admin Login form heading
    expect(screen.getByRole('heading', { name: /Admin Paneli/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/oilganic.admin/i)).toBeInTheDocument();

    // Should NOT render Admin Dashboard heading
    expect(screen.queryByText(/Admin İdarəetmə Paneli/i)).not.toBeInTheDocument();
  });

  it('allows direct access to /admin when authenticated', () => {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    sessionStorage.setItem(ADMIN_LAST_ACTIVE_KEY, Date.now().toString());

    renderAdminRoutes('/admin');

    // Should render Admin Dashboard heading
    expect(screen.getByRole('heading', { name: /Admin İdarəetmə Paneli/i })).toBeInTheDocument();
  });

  it('redirects authenticated user from /admin/login to /admin dashboard', () => {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    sessionStorage.setItem(ADMIN_LAST_ACTIVE_KEY, Date.now().toString());

    renderAdminRoutes('/admin/login');

    // Should redirect to dashboard
    expect(screen.getByRole('heading', { name: /Admin İdarəetmə Paneli/i })).toBeInTheDocument();
  });
});
