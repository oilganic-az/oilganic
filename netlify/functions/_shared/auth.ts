import crypto from 'node:crypto';
import { parseCookies, COOKIE_NAME } from './http';

export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'development' || process.env.VITEST) {
      return 'dev-session-secret-change-in-production-1234567890';
    }
    throw new Error('ADMIN_SESSION_SECRET environment variable is missing.');
  }
  return secret;
}

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || 'oilganic.admin';
}

export function verifyPasswordScrypt(plainPassword: string, scryptHashStr?: string): boolean {
  const targetHashStr = scryptHashStr || process.env.ADMIN_PASSWORD_SCRYPT;
  if (!targetHashStr || !targetHashStr.includes(':')) {
    return false;
  }

  const [saltHex, keyHex] = targetHashStr.split(':');
  if (!saltHex || !keyHex) return false;

  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expectedKey = Buffer.from(keyHex, 'hex');
    const derivedKey = crypto.scryptSync(plainPassword, salt, expectedKey.length);

    if (derivedKey.length !== expectedKey.length) return false;
    return crypto.timingSafeEqual(derivedKey, expectedKey);
  } catch (e) {
    return false;
  }
}

export interface SessionPayload {
  username: string;
  exp: number; // Unix timestamp ms
  nonce: string;
}

export function createSessionCookieFromPayload(payload: SessionPayload): string {
  const secret = getSessionSecret();
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadBase64);
  const signatureHex = hmac.digest('hex');

  return `${payloadBase64}.${signatureHex}`;
}

export function createSessionCookieValue(username: string, maxAgeSeconds: number = 1800): string {
  const payload: SessionPayload = {
    username,
    exp: Date.now() + maxAgeSeconds * 1000,
    nonce: crypto.randomBytes(16).toString('hex')
  };

  return createSessionCookieFromPayload(payload);
}

export function verifySessionCookie(cookieValue?: string): SessionPayload | null {
  if (!cookieValue || !cookieValue.includes('.')) return null;

  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, providedSigHex] = parts;
  const secret = getSessionSecret();

  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadBase64);
    const expectedSigHex = hmac.digest('hex');

    const sigBuf = Buffer.from(providedSigHex, 'hex');
    const expectedBuf = Buffer.from(expectedSigHex, 'hex');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload: SessionPayload = JSON.parse(payloadJson);

    if (!payload || typeof payload.exp !== 'number' || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}

export function getSessionFromHeaders(headers: Record<string, string | undefined>): SessionPayload | null {
  const cookieHeader = headers['cookie'] || headers['Cookie'];
  const cookies = parseCookies(cookieHeader);
  const cookieVal = cookies[COOKIE_NAME];
  return verifySessionCookie(cookieVal);
}
