import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// ── Firebase SDK mocks ────────────────────────────────────────────────────────
// Must come before any component imports that transitively import firebase.
// The onSnapshot mock fires the error callback so ProductsContext / CampaignsContext
// fall back to their static INITIAL_PRODUCTS / [] defaults.

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  onSnapshot: vi.fn((_q: unknown, _success: unknown, error?: (e: Error) => void) => {
    if (typeof error === 'function') {
      // Simulate immediate failure → contexts fall back to static data
      setTimeout(() => error(new Error('Firebase mocked in tests')), 0);
    }
    return () => {}; // unsubscribe noop
  }),
  addDoc: vi.fn(() => Promise.resolve({ id: `mock-${Date.now()}` })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(() => ({})),
  getDocs: vi.fn(() =>
    Promise.resolve({ forEach: vi.fn(), docs: [], empty: true })
  ),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(() => Promise.resolve()),
  })),
  query: vi.fn((...args: unknown[]) => args[0]),
  orderBy: vi.fn(() => ({})),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(() => ({})),
  uploadBytes: vi.fn(() => Promise.resolve()),
  getDownloadURL: vi.fn(() =>
    Promise.resolve('https://mock-storage.example.com/image.jpg')
  ),
}));

// Also mock the src/lib/firebase module itself (exports db, storage)
vi.mock('../lib/firebase', () => ({ db: {}, storage: {} }));
vi.mock('../../lib/firebase', () => ({ db: {}, storage: {} }));

// ── Browser API mocks ─────────────────────────────────────────────────────────

// Mock window.matchMedia for JSDOM
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Mock IntersectionObserver for JSDOM
if (typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'function') {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

afterEach(() => {
  cleanup();
});

