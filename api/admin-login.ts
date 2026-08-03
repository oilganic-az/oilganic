import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * POST /api/admin-login
 *
 * Body: { username: string; password: string }
 * Returns: { token: string } on success   (200)
 *          { error: string }   on failure  (401 / 400)
 *
 * The JWT is a simple HMAC-SHA256 signed payload. The client stores it in
 * sessionStorage and sends it in the Authorization header when calling any
 * write-capable API routes (future extension).
 *
 * Credentials are read from Vercel environment variables – they are NEVER
 * shipped inside the client-side JavaScript bundle.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://oilganic.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signJwt(payload: object, secret: string, expiresInSeconds = 1800): string {
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64url(
    Buffer.from(
      JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresInSeconds })
    )
  );
  const sig = base64url(
    createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest()
  );
  return `${header}.${body}.${sig}`;
}

function safeEquals(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) {
      // still call timingSafeEqual on same-length buffers to avoid timing leak
      timingSafeEqual(Buffer.alloc(aBuf.length), Buffer.alloc(aBuf.length));
      return false;
    }
    return timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin']);
    res.setHeader('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods']);
    res.setHeader('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers']);
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body ?? {};

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const expectedUsername = process.env.ADMIN_USERNAME ?? '';
  const expectedPassword = process.env.ADMIN_PASSWORD ?? '';
  const jwtSecret = process.env.JWT_SECRET ?? '';

  if (!expectedUsername || !expectedPassword || !jwtSecret) {
    console.error('Admin credentials not configured in environment variables');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const usernameOk = safeEquals(username.trim(), expectedUsername);
  const passwordOk = safeEquals(password, expectedPassword);

  if (!usernameOk || !passwordOk) {
    // Uniform 401 – don't reveal which field was wrong
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signJwt({ sub: username, role: 'admin' }, jwtSecret, 1800); // 30 min

  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  return res.status(200).json({ token });
}
