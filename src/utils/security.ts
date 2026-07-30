export const ADMIN_PASSWORD_HASH = 'e30ce4bff10406c53186d329aaa81fac347ea11949e2dc520a15c3d5946d67b3';
export const ADMIN_USERNAME = 'oilganic.admin';

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Computes SHA-256 hash of a string using Web Crypto API
 */
export async function hashString(text: string): Promise<string> {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
  if (cryptoObj && cryptoObj.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  throw new Error('Cryptographic service unavailable');
}

/**
 * Sanitizes input string to prevent XSS script injection
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates product object structure to ensure schema integrity
 */
export function validateProductSchema(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.id !== 'string' || !obj.id.trim()) return false;
  if (typeof obj.name !== 'string' || !obj.name.trim()) return false;
  if (typeof obj.slug !== 'string' || !obj.slug.trim()) return false;
  if (typeof obj.price !== 'number' || isNaN(obj.price) || obj.price < 0) return false;
  if (typeof obj.categoryId !== 'string') return false;
  return true;
}
