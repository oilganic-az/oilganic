/**
 * Automatic Vitest/Jest mock for src/lib/firebase.ts
 *
 * Placed in src/lib/__mocks__/firebase.ts so Vitest auto-discovers it
 * when tests call `vi.mock('../../lib/firebase')` or when the alias in
 * vitest.config.ts resolves here.
 *
 * Returns stub objects for `db` and `storage` so imports succeed.
 * The actual Firebase SDK mocks (firebase/firestore, firebase/storage)
 * are handled in src/test/firebase-mock.ts via vi.mock() calls.
 */
export const db = {};
export const storage = {};
