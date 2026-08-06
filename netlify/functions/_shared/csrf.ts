import crypto from 'node:crypto';
import { getSessionSecret, SessionPayload } from './auth';

export function generateCsrfToken(session: SessionPayload): string {
  const secret = getSessionSecret();
  const data = `${session.username}:${session.nonce}:${session.exp}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function verifyCsrfToken(session: SessionPayload, providedToken?: string): boolean {
  if (!providedToken || typeof providedToken !== 'string') return false;

  const expectedToken = generateCsrfToken(session);
  try {
    const providedBuf = Buffer.from(providedToken, 'hex');
    const expectedBuf = Buffer.from(expectedToken, 'hex');

    if (providedBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(providedBuf, expectedBuf);
  } catch (e) {
    return false;
  }
}
