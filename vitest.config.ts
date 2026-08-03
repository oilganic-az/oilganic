import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Redirect Firebase SDK imports to a mock during unit tests
      '../lib/firebase': path.resolve(__dirname, './src/test/firebase-mock.ts'),
      '../../lib/firebase': path.resolve(__dirname, './src/test/firebase-mock.ts'),
    }
  }
});
