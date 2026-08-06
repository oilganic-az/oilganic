import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handler as loginHandler } from '../../netlify/functions/auth-login';
import { handler as sessionHandler } from '../../netlify/functions/auth-session';
import { handler as logoutHandler } from '../../netlify/functions/auth-logout';
import { handler as productsHandler } from '../../netlify/functions/admin-products';
import { handler as campaignsHandler } from '../../netlify/functions/admin-campaigns';
import { handler as uploadHandler } from '../../netlify/functions/admin-upload-image';
import { createSessionCookieValue, verifySessionCookie } from '../../netlify/functions/_shared/auth';
import { generateCsrfToken } from '../../netlify/functions/_shared/csrf';
import { validateBranchSafety } from '../../netlify/functions/_shared/github';
import { validateImageSignature } from '../../netlify/functions/_shared/validation';
import crypto from 'node:crypto';

// Setup environment variables for test execution
const TEST_SALT = '7516df50defe619883e84cce4b12559f';
const TEST_KEY = '2dd2fe13963979c07a2167454e9efbe9f48aa422338888756d06f482a661e1067d4b71afaf841bd6358605621c331346bc0d0ba20b409b85cefd8770ff25fcd3';

process.env.ADMIN_USERNAME = 'oilganic.admin';
process.env.ADMIN_PASSWORD_SCRYPT = `${TEST_SALT}:${TEST_KEY}`; // Hash of "oilganic2026"
process.env.ADMIN_SESSION_SECRET = 'super-secret-test-key-1234567890';
process.env.GITHUB_TOKEN = 'ghp_mock_token_for_tests';
process.env.GITHUB_REPOSITORY = 'oilganic-az/oilganic';
process.env.ADMIN_CONTENT_BRANCH = 'feature/admin-owned-menu';
process.env.ALLOWED_ORIGINS = 'https://oilganic.az,http://localhost:5173';

describe('Secure Netlify Admin Endpoints & Helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Auth Login Endpoint (auth-login.ts)', () => {
    it('accepts valid credentials and returns signed HttpOnly cookie', async () => {
      const event = {
        path: '/api/auth-login',
        httpMethod: 'POST',
        headers: { 'origin': 'https://oilganic.az' },
        body: JSON.stringify({ username: 'oilganic.admin', password: 'oilganic2026' })
      };

      const res = await loginHandler(event);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.username).toBe('oilganic.admin');

      const setCookie = res.headers?.['Set-Cookie'] || res.headers?.['set-cookie'];
      expect(setCookie).toContain('oilganic_admin_session=');
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('SameSite=Strict');
    });

    it('rejects invalid login credentials with generic error', async () => {
      const event = {
        path: '/api/auth-login',
        httpMethod: 'POST',
        headers: { 'origin': 'https://oilganic.az' },
        body: JSON.stringify({ username: 'oilganic.admin', password: 'wrongpassword' })
      };

      const res = await loginHandler(event);
      expect(res.statusCode).toBe(401);

      const body = JSON.parse(res.body);
      expect(body.error).toBe('İstifadəçi adı və ya şifrə yanlışdır.');
      expect(body.error).not.toContain('wrongpassword');
    });
  });

  describe('2. Auth Session Endpoint (auth-session.ts)', () => {
    it('validates active signed session cookie and returns CSRF token', async () => {
      const cookieValue = createSessionCookieValue('oilganic.admin', 1800);

      const event = {
        path: '/api/auth-session',
        httpMethod: 'GET',
        headers: {
          'cookie': `oilganic_admin_session=${cookieValue}`,
          'origin': 'https://oilganic.az'
        },
        body: null
      };

      const res = await sessionHandler(event);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.authenticated).toBe(true);
      expect(body.username).toBe('oilganic.admin');
      expect(body.csrfToken).toBeDefined();
    });

    it('rejects expired or tampered session cookies', async () => {
      const tamperedCookie = 'invalidBase64.invalidSignatureHex';

      const event = {
        path: '/api/auth-session',
        httpMethod: 'GET',
        headers: {
          'cookie': `oilganic_admin_session=${tamperedCookie}`,
          'origin': 'https://oilganic.az'
        },
        body: null
      };

      const res = await sessionHandler(event);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.authenticated).toBe(false);
    });

    it('returns null on expired session payload', () => {
      const expiredCookie = createSessionCookieValue('oilganic.admin', -10);
      const parsed = verifySessionCookie(expiredCookie);
      expect(parsed).toBeNull();
    });
  });

  describe('3. Auth Logout Endpoint (auth-logout.ts)', () => {
    it('clears session cookie on logout', async () => {
      const event = {
        path: '/api/auth-logout',
        httpMethod: 'POST',
        headers: { 'origin': 'https://oilganic.az' },
        body: null
      };

      const res = await logoutHandler(event);
      expect(res.statusCode).toBe(200);

      const setCookie = res.headers?.['Set-Cookie'] || res.headers?.['set-cookie'];
      expect(setCookie).toContain('Max-Age=0');
    });
  });

  describe('4. CSRF & Origin Security Checks', () => {
    it('rejects product mutation when CSRF token is missing', async () => {
      const sessionCookie = createSessionCookieValue('oilganic.admin', 1800);

      const event = {
        path: '/api/admin-products',
        httpMethod: 'POST',
        headers: {
          'cookie': `oilganic_admin_session=${sessionCookie}`,
          'origin': 'https://oilganic.az'
        },
        body: JSON.stringify({ action: 'create', product: {} })
      };

      const res = await productsHandler(event);
      expect(res.statusCode).toBe(403);

      const body = JSON.parse(res.body);
      expect(body.error).toContain('CSRF');
    });

    it('rejects mutation when request origin is forbidden', async () => {
      const sessionCookie = createSessionCookieValue('oilganic.admin', 1800);

      const event = {
        path: '/api/admin-products',
        httpMethod: 'POST',
        headers: {
          'cookie': `oilganic_admin_session=${sessionCookie}`,
          'origin': 'https://malicious-attacker-domain.com'
        },
        body: JSON.stringify({ action: 'create' })
      };

      const res = await productsHandler(event);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('5. Product Persistence Endpoint (admin-products.ts)', () => {
    it('creates manual product and persists to manual-products.json via GitHub API', async () => {
      const sessionCookie = createSessionCookieValue('oilganic.admin', 1800);
      const sessionPayload = verifySessionCookie(sessionCookie)!;
      const csrfToken = generateCsrfToken(sessionPayload);

      // Mock GitHub fetch responses
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = String(url);

        if (urlStr.includes('/contents/')) {
          if (init?.method === 'PUT') {
            return new Response(JSON.stringify({
              commit: { sha: 'mock_commit_sha_123' },
              content: { sha: 'mock_content_sha_123' }
            }), { status: 200 });
          }

          if (urlStr.includes('catalog-base.json')) {
            return new Response(JSON.stringify({ content: Buffer.from(JSON.stringify({ products: [] })).toString('base64'), sha: 'base_sha' }), { status: 200 });
          }
          if (urlStr.includes('product-overrides.json')) {
            return new Response(JSON.stringify({ content: Buffer.from(JSON.stringify({ products: {} })).toString('base64'), sha: 'overrides_sha' }), { status: 200 });
          }
          if (urlStr.includes('manual-products.json')) {
            return new Response(JSON.stringify({ content: Buffer.from(JSON.stringify({ products: [] })).toString('base64'), sha: 'manual_sha' }), { status: 200 });
          }
          if (urlStr.includes('deleted-product-ids.json')) {
            return new Response(JSON.stringify({ content: Buffer.from(JSON.stringify({ productIds: [] })).toString('base64'), sha: 'deleted_sha' }), { status: 200 });
          }
        }
        return new Response('Not found', { status: 404 });
      });

      const newProduct = {
        id: 'manual-test-prod-1',
        slug: 'yeni-test-yagi',
        name: 'Yeni Test Yağı',
        categoryId: 'oils',
        shortDescription: 'Təbii soyuq sıxım yağı',
        price: 25,
        currency: 'AZN',
        unitLabel: '250ml',
        inStock: true,
        images: [{ src: '/images/products/placeholder.jpg', alt: 'Yeni Test Yağı' }]
      };

      const event = {
        path: '/api/admin-products',
        httpMethod: 'POST',
        headers: {
          'cookie': `oilganic_admin_session=${sessionCookie}`,
          'x-csrf-token': csrfToken,
          'origin': 'https://oilganic.az'
        },
        body: JSON.stringify({ action: 'create', product: newProduct })
      };

      const res = await productsHandler(event);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Saxlanıldı, yenilənmə yayımlanır');
    });

    it('returns 409 conflict error when GitHub API returns HTTP 409', async () => {
      const sessionCookie = createSessionCookieValue('oilganic.admin', 1800);
      const sessionPayload = verifySessionCookie(sessionCookie)!;
      const csrfToken = generateCsrfToken(sessionPayload);

      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = String(url);
        if (urlStr.includes('/contents/') && init?.method === 'PUT') {
          return new Response('409 Conflict: Concurrent write', { status: 409 });
        }
        return new Response(JSON.stringify({ content: Buffer.from(JSON.stringify({ products: [] })).toString('base64'), sha: 'sha' }), { status: 200 });
      });

      const product = {
        id: 'manual-prod-conflict',
        slug: 'conflict-slug',
        name: 'Conflict Prod',
        categoryId: 'oils',
        shortDescription: 'Conflict desc',
        price: 15,
        currency: 'AZN',
        inStock: true,
        images: [{ src: '/images/products/placeholder.jpg', alt: 'Conflict' }]
      };

      const event = {
        path: '/api/admin-products',
        httpMethod: 'POST',
        headers: {
          'cookie': `oilganic_admin_session=${sessionCookie}`,
          'x-csrf-token': csrfToken,
          'origin': 'https://oilganic.az'
        },
        body: JSON.stringify({ action: 'create', product })
      };

      const res = await productsHandler(event);
      expect(res.statusCode).toBe(409);

      const body = JSON.parse(res.body);
      expect(body.error).toContain('ziddiyyət');
    });
  });

  describe('6. Campaign Persistence Endpoint (admin-campaigns.ts)', () => {
    it('creates campaign and persists to content/campaigns.json', async () => {
      const sessionCookie = createSessionCookieValue('oilganic.admin', 1800);
      const sessionPayload = verifySessionCookie(sessionCookie)!;
      const csrfToken = generateCsrfToken(sessionPayload);

      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = String(url);
        if (urlStr.includes('/contents/')) {
          if (init?.method === 'PUT') {
            return new Response(JSON.stringify({
              commit: { sha: 'mock_commit_sha' },
              content: { sha: 'mock_content_sha' }
            }), { status: 200 });
          }
          return new Response(JSON.stringify({ content: Buffer.from(JSON.stringify({ campaigns: [] })).toString('base64'), sha: 'camp_sha' }), { status: 200 });
        }
        return new Response('Not found', { status: 404 });
      });

      const newCampaign = {
        id: 'camp-test-1',
        title: 'Yaz Endirimi',
        conditions: 'Bütün yağlara 20% endirim',
        isActive: true
      };

      const event = {
        path: '/api/admin-campaigns',
        httpMethod: 'POST',
        headers: {
          'cookie': `oilganic_admin_session=${sessionCookie}`,
          'x-csrf-token': csrfToken,
          'origin': 'https://oilganic.az'
        },
        body: JSON.stringify({ action: 'create', campaign: newCampaign })
      };

      const res = await campaignsHandler(event);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Saxlanıldı, yenilənmə yayımlanır');
    });
  });

  describe('7. Image Upload & Magic Bytes Validation (admin-upload-image.ts)', () => {
    it('accepts valid PNG image buffer and commits to GitHub API', async () => {
      const sessionCookie = createSessionCookieValue('oilganic.admin', 1800);
      const sessionPayload = verifySessionCookie(sessionCookie)!;
      const csrfToken = generateCsrfToken(sessionPayload);

      // Create dummy valid PNG buffer (89 50 4E 47 + 10 bytes)
      const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52]);
      const base64Data = pngHeader.toString('base64');

      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = String(url);
        if (urlStr.includes('/contents/') && init?.method === 'PUT') {
          return new Response(JSON.stringify({
            commit: { sha: 'img_commit_sha' },
            content: { sha: 'img_content_sha' }
          }), { status: 200 });
        }
        return new Response('Not found', { status: 404 });
      });

      const event = {
        path: '/api/admin-upload-image',
        httpMethod: 'POST',
        headers: {
          'cookie': `oilganic_admin_session=${sessionCookie}`,
          'x-csrf-token': csrfToken,
          'origin': 'https://oilganic.az'
        },
        body: JSON.stringify({ fileData: base64Data, folder: 'products' })
      };

      const res = await uploadHandler(event);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.url).toMatch(/^\/uploads\/products\/prod-.*\.png$/);
    });

    it('rejects non-image or executable content magic bytes', () => {
      const scriptBuffer = Buffer.from('<?php echo "evil"; ?>');
      expect(() => validateImageSignature(scriptBuffer)).toThrow();
    });

    it('rejects files larger than 2 MB', async () => {
      const sessionCookie = createSessionCookieValue('oilganic.admin', 1800);
      const sessionPayload = verifySessionCookie(sessionCookie)!;
      const csrfToken = generateCsrfToken(sessionPayload);

      const largeBuffer = crypto.randomBytes(2 * 1024 * 1024 + 10);
      const base64Data = largeBuffer.toString('base64');

      const event = {
        path: '/api/admin-upload-image',
        httpMethod: 'POST',
        headers: {
          'cookie': `oilganic_admin_session=${sessionCookie}`,
          'x-csrf-token': csrfToken,
          'origin': 'https://oilganic.az'
        },
        body: JSON.stringify({ fileData: base64Data, folder: 'products' })
      };

      const res = await uploadHandler(event);
      expect(res.statusCode).toBe(413);
    });
  });

  describe('8. Branch Safety & Security Integrity', () => {
    it('prevents direct commits to main branch', () => {
      expect(() => validateBranchSafety('main')).toThrow('strictly prohibited');
    });

    it('allows branch commits to feature branches', () => {
      expect(() => validateBranchSafety('feature/admin-owned-menu')).not.toThrow();
    });
  });
});
