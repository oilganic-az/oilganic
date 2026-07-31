import React from 'react';
import { Navigate } from 'react-router-dom';
import { ADMIN_AUTH_KEY, ADMIN_LAST_ACTIVE_KEY } from '../../pages/admin/AdminLoginPage';
import { SESSION_INACTIVITY_TIMEOUT_MS } from '../../utils/security';

export function isSessionValid(): boolean {
  if (typeof window === 'undefined') return false;
  const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  if (!isAuth) return false;

  const lastActiveStr = sessionStorage.getItem(ADMIN_LAST_ACTIVE_KEY);
  const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

  if (lastActive && Date.now() - lastActive > SESSION_INACTIVITY_TIMEOUT_MS) {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    sessionStorage.removeItem(ADMIN_LAST_ACTIVE_KEY);
    return false;
  }

  // Update activity timestamp on valid navigation
  sessionStorage.setItem(ADMIN_LAST_ACTIVE_KEY, Date.now().toString());
  return true;
}

interface AdminGuardProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<AdminGuardProps> = ({ children }) => {
  if (!isSessionValid()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export const PublicAdminRoute: React.FC<AdminGuardProps> = ({ children }) => {
  if (isSessionValid()) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};
