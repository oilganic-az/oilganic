import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  csrfToken: string | null;
  checkSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const checkSession = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth-session', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUsername(data.username || 'admin');
          setCsrfToken(data.csrfToken || null);
          setIsLoading(false);
          return true;
        }
      }
    } catch (e) {
      console.error('Session check failed:', e);
    }

    setIsAuthenticated(false);
    setUsername(null);
    setCsrfToken(null);
    setIsLoading(false);
    return false;
  };

  useEffect(() => {
    checkSession();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth-logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (e) {
      console.error('Logout request failed:', e);
    } finally {
      setIsAuthenticated(false);
      setUsername(null);
      setCsrfToken(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        username,
        csrfToken,
        checkSession,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface GuardProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: '#4b5563', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Təhlükəsizlik sessiyası yoxlanılır...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export const PublicAdminRoute: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: '#4b5563', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Yoxlanılır...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
