/**
 * Firebase mock for Vitest unit tests.
 * 
 * Replaces src/lib/firebase.ts so tests never connect to a real Firestore.
 * The ProductsContext and CampaignsContext fall back to static data when
 * Firestore returns errors – this mock triggers that fallback path.
 */
import { vi } from 'vitest';

// Minimal Firestore document snapshot mock
const makeSnapshot = (docs: Array<Record<string, unknown> & { id: string }> = []) => ({
  forEach: (cb: (d: Record<string, unknown> & { id: string }) => void) => docs.forEach(cb),
  docs: docs.map((d) => ({ id: d.id, data: () => d })),
  empty: docs.length === 0,
});

// onSnapshot immediately calls the error callback so ProductsContext falls back to INITIAL_PRODUCTS
export const db = {};
export const storage = {};

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  onSnapshot: vi.fn((_q: unknown, _success: unknown, error: (e: Error) => void) => {
    // Immediately simulate a "permission-denied" so the context falls back to static data
    if (typeof error === 'function') {
      setTimeout(() => error(new Error('Firebase mocked – using static data')), 0);
    }
    return () => {}; // unsubscribe noop
  }),
  addDoc: vi.fn(() => Promise.resolve({ id: `mock-${Date.now()}` })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(() => ({})),
  getDocs: vi.fn(() => Promise.resolve(makeSnapshot([]))),
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
  getDownloadURL: vi.fn(() => Promise.resolve('https://mock-storage.example.com/image.jpg')),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));
