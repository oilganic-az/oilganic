import { describe, it, expect } from 'vitest';
import { hashString, sanitizeInput, validateProductSchema, ADMIN_PASSWORD_HASH } from './security';

describe('Security Utility Suite', () => {
  it('computes correct SHA-256 hash for admin password', async () => {
    const computedHash = await hashString('Oilganic.2026');
    expect(computedHash).toBe(ADMIN_PASSWORD_HASH);
  });

  it('sanitizes unsafe HTML and script tags from input strings', () => {
    const dangerousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(dangerousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  it('validates product schema correctly', () => {
    const validProduct = {
      id: 'prod-1',
      name: 'Badam yağı',
      slug: 'badam-yagi',
      price: 15,
      categoryId: 'oils'
    };
    const invalidProduct = {
      id: 'prod-2',
      name: '',
      price: -5
    };

    expect(validateProductSchema(validProduct)).toBe(true);
    expect(validateProductSchema(invalidProduct)).toBe(false);
  });
});
