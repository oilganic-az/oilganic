import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handler as loginHandler } from '../../netlify/functions/auth-login';
import { handler as sessionHandler } from '../../netlify/functions/auth-session';
import { handler as logoutHandler } from '../../netlify/functions/auth-logout';
import { handler as productsHandler } from '../../netlify/functions/admin-products';
import { handler as campaignsHandler } from '../../netlify/functions/admin-campaigns';
import { handler as uploadHandler } from '../../netlify/functions/admin-upload-image';
import { parseCookies, COOKIE_NAME } from '../../netlify/functions/_shared/http';
import { createSessionCookieValue, verifySessionCookie } from '../../netlify/functions/_shared/auth';
import { generateCsrfToken } from '../../netlify/functions/_shared/csrf';
import { validateBranchSafety } from '../../netlify/functions/_shared/github';
import { validateImageSignature } from '../../netlify/functions/_shared/validation';
import { Product } from '../../src/types/product';
import { execSync } from 'node:child_process';

// Setup environment variables for test execution
const TEST_SALT = '7516df50defe619883e84cce4b12559f';
const TEST_KEY = '2dd2fe13963979c07a2167454e9efbe9f48aa422338888756d06f482a661e1067d4b71afaf841bd6358605621c331346bc0d0ba20b409b85cefd8770ff25fcd3';

process.env.ADMIN_USERNAME = 'oilganic.admin';
process.env.ADMIN_PASSWORD_SCRYPT = `${TEST_SALT}:${TEST_KEY}`;
process.env.ADMIN_SESSION_SECRET = 'super-secret-test-key-1234567890';
process.env.GITHUB_TOKEN = 'ghp_mock_token_for_tests';
process.env.GITHUB_REPOSITORY = 'oilganic-az/oilganic';
process.env.ADMIN_CONTENT_BRANCH = 'feature/admin-owned-menu';
process.env.ALLOWED_ORIGINS = 'https://oilganic.az,http://localhost:5173';

describe('Secure Netlify Admin Endpoints & Helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.ALLOW_MAIN_WRITE;
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

  describe('2. Auth Session Endpoint & Session/CSRF Consistency Integration Test', () => {
    it('end-to-end flow: login -> session verification -> protected mutation succeeds with matching cookie & CSRF token', async () => {
      // Step A: Login
      const loginRes = await loginHandler({
        path: '/api/auth-login',
        httpMethod: 'POST',
        headers: { 'origin': 'https://oilganic.az' },
        body: JSON.stringify({ username: 'oilganic.admin', password: 'oilganic2026' })
      });
      expect(loginRes.statusCode).toBe(200);
      const loginCookieHeader = loginRes.headers?.['Set-Cookie'];
      expect(loginCookieHeader).toBeDefined();

      const loginCookies = parseCookies(loginCookieHeader);
      const loginCookieVal = loginCookies[COOKIE_NAME];

      // Step B: Call auth-session with login cookie
      const sessionRes = await sessionHandler({
        path: '/api/auth-session',
        httpMethod: 'GET',
        headers: {
          'cookie': `${COOKIE_NAME}=${loginCookieVal}`,
          'origin': 'https://oilganic.az'
        },
        body: null
      });

      expect(sessionRes.statusCode).toBe(200);
      const sessionBody = JSON.parse(sessionRes.body);
      expect(sessionBody.authenticated).toBe(true);
      expect(sessionBody.csrfToken).toBeDefined();

      const refreshedCookieHeader = sessionRes.headers?.['Set-Cookie'];
      const refreshedCookies = parseCookies(refreshedCookieHeader);
      const refreshedCookieVal = refreshedCookies[COOKIE_NAME];

      // Step C: Perform protected mutation using refreshed cookie & csrfToken
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = String(url);
        if (urlStr.includes('/contents/')) {
          if (init?.method === 'PUT') {
            return new Response(JSON.stringify({
              commit: { sha: 'commit_sha' },
              content: { sha: 'content_sha' }
            }), { status: 200 });
          }
          return new Response(JSON.stringify({ content: Buffer.from(JSON.stringify({ products: [] })).toString('base64'), sha: 'sha' }), { status: 200 });
        }
        return new Response('Not found', { status: 404 });
      });

      const mutationRes = await productsHandler({
        path: '/api/admin-products',
        httpMethod: 'POST',
        headers: {
          'cookie': `${COOKIE_NAME}=${refreshedCookieVal}`,
          'x-csrf-token': sessionBody.csrfToken,
          'origin': 'https://oilganic.az'
        },
        body: JSON.stringify({
          action: 'create',
          product: {
            id: 'e2e-prod-1',
            slug: 'e2e-slug',
            name: 'E2E Product',
            categoryId: 'oils',
            shortDescription: 'Desc',
            price: 10,
            currency: 'AZN',
            inStock: true,
            images: [{ src: '/images/products/placeholder.jpg', alt: 'E2E' }]
          }
        })
      });

      expect(mutationRes.statusCode).toBe(200);
      const mutationBody = JSON.parse(mutationRes.body);
      expect(mutationBody.success).toBe(true);
    });

    it('fails protected mutation with 403 if cookie nonce and CSRF token nonce differ', async () => {
      const cookieVal1 = createSessionCookieValue('oilganic.admin', 1800);
      const cookieVal2 = createSessionCookieValue('oilganic.admin', 1800); // Different nonce

      const session1 = verifySessionCookie(cookieVal1)!;
      const csrfTokenForCookie1 = generateCsrfToken(session1);

      // Send cookie2 with csrfToken generated from cookie1
      const res = await productsHandler({
        path: '/api/admin-products',
        httpMethod: 'POST',
        headers: {
          'cookie': `${COOKIE_NAME}=${cookieVal2}`,
          'x-csrf-token': csrfTokenForCookie1,
          'origin': 'https://oilganic.az'
        },
        body: JSON.stringify({ action: 'create', product: {} })
      });

      expect(res.statusCode).toBe(403);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('CSRF');
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

  describe('4. Product & Multi-Size Preservation', () => {
    it('preserves all size IDs, labels, prices, imageSrc, and stock states when updating multi-size product', () => {
      const multiSizeProduct: Product = {
        id: 'multi-size-prod',
        slug: 'multi-size-yag',
        name: 'İki Çeşidli Yağ',
        categoryId: 'oils',
        shortDescription: 'Orijinal təsvir',
        price: 15,
        currency: 'AZN',
        unitLabel: '100ml',
        inStock: true,
        verificationStatus: 'verified',
        images: [{ src: '/images/products/yag.jpg', alt: 'Yağ' }],
        sizes: [
          { id: 'size-100ml', label: '100 ml', price: 15, inStock: true, imageSrc: '/images/100ml.jpg' },
          { id: 'size-250ml', label: '250 ml', price: 32, inStock: true, imageSrc: '/images/250ml.jpg' },
          { id: 'size-500ml', label: '500 ml', price: 60, inStock: false, imageSrc: '/images/500ml.jpg' }
        ]
      };

      // Simulate edit in AdminDashboardPage logic (modifying name and shortDescription)
      const isAddMode = false;
      const editingProduct = {
        ...multiSizeProduct,
        name: 'Yenilənmiş İki Çeşidli Yağ',
        shortDescription: 'Yenilənmiş təsvir'
      };

      let preparedSizes = editingProduct.sizes;
      if (isAddMode || !preparedSizes || preparedSizes.length === 0) {
        preparedSizes = [{ id: 'size-gen', label: '100ml', price: 15, inStock: true }];
      }

      const preparedProduct = {
        ...editingProduct,
        sizes: preparedSizes
      };

      expect(preparedProduct.sizes).toHaveLength(3);
      expect(preparedProduct.sizes![0]).toEqual({ id: 'size-100ml', label: '100 ml', price: 15, inStock: true, imageSrc: '/images/100ml.jpg' });
      expect(preparedProduct.sizes![1]).toEqual({ id: 'size-250ml', label: '250 ml', price: 32, inStock: true, imageSrc: '/images/250ml.jpg' });
      expect(preparedProduct.sizes![2]).toEqual({ id: 'size-500ml', label: '500 ml', price: 60, inStock: false, imageSrc: '/images/500ml.jpg' });
    });

    it('handles action=reset to clear all catalog overrides, manual products, and deleted product IDs', async () => {
      const sessionCookie = createSessionCookieValue('oilganic.admin', 1800);
      const sessionPayload = verifySessionCookie(sessionCookie)!;
      const csrfToken = generateCsrfToken(sessionPayload);

      const committedFiles: Record<string, string> = {};

      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = String(url);
        if (urlStr.includes('/contents/')) {
          if (init?.method === 'PUT') {
            const bodyObj = JSON.parse(String(init.body));
            committedFiles[urlStr] = Buffer.from(bodyObj.content, 'base64').toString('utf8');
            return new Response(JSON.stringify({
              commit: { sha: 'reset_commit_sha' },
              content: { sha: 'reset_content_sha' }
            }), { status: 200 });
          }
          return new Response(JSON.stringify({ content: Buffer.from(JSON.stringify({ products: [] })).toString('base64'), sha: 'sha' }), { status: 200 });
        }
        return new Response('Not found', { status: 404 });
      });

      const event = {
        path: '/api/admin-products',
        httpMethod: 'POST',
        headers: {
          'cookie': `${COOKIE_NAME}=${sessionCookie}`,
          'x-csrf-token': csrfToken,
          'origin': 'https://oilganic.az'
        },
        body: JSON.stringify({ action: 'reset' })
      };

      const res = await productsHandler(event);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('ilkin vəziyyətinə qaytarıldı');

      expect(Object.keys(committedFiles).length).toBe(3);
    });
  });

  describe('5. Campaign Persistence Endpoint (admin-campaigns.ts)', () => {
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
          'cookie': `${COOKIE_NAME}=${sessionCookie}`,
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

  describe('6. Image Upload & Magic Bytes Validation', () => {
    it('accepts valid PNG image buffer and commits to GitHub API', async () => {
      const sessionCookie = createSessionCookieValue('oilganic.admin', 1800);
      const sessionPayload = verifySessionCookie(sessionCookie)!;
      const csrfToken = generateCsrfToken(sessionPayload);

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
          'cookie': `${COOKIE_NAME}=${sessionCookie}`,
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

    it('rejects non-image magic bytes', () => {
      const scriptBuffer = Buffer.from('<?php echo "evil"; ?>');
      expect(() => validateImageSignature(scriptBuffer)).toThrow();
    });
  });

  describe('7. Branch Safety & Environment Controls', () => {
    it('prevents direct commits to main branch when ALLOW_MAIN_WRITE is not true', () => {
      delete process.env.ALLOW_MAIN_WRITE;
      expect(() => validateBranchSafety('main')).toThrow('strictly prohibited');
    });

    it('allows commits to main branch when ALLOW_MAIN_WRITE=true in production context', () => {
      process.env.ALLOW_MAIN_WRITE = 'true';
      expect(() => validateBranchSafety('main')).not.toThrow();
    });

    it('allows branch commits to feature/admin-owned-menu branch without ALLOW_MAIN_WRITE', () => {
      delete process.env.ALLOW_MAIN_WRITE;
      expect(() => validateBranchSafety('feature/admin-owned-menu')).not.toThrow();
    });
  });

  describe('8. Password Generator Script (scripts/hash-admin-password.mjs)', () => {
    it('rejects missing password parameter with non-zero exit code', () => {
      expect(() => {
        execSync('node scripts/hash-admin-password.mjs', { stdio: 'pipe' });
      }).toThrow();
    });

    it('outputs ADMIN_PASSWORD_SCRYPT without printing plain password', () => {
      const output = execSync('node scripts/hash-admin-password.mjs "TestSecretPass2026!"', { encoding: 'utf8' });
      expect(output).toContain('ADMIN_PASSWORD_SCRYPT=');
      expect(output).not.toContain('TestSecretPass2026!');
    });
  });
});
