export interface NetlifyEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
  isBase64Encoded?: boolean;
}

export interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body: string;
}

export const COOKIE_NAME = 'oilganic_admin_session';

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      list[name] = decodeURIComponent(val);
    }
  });

  return list;
}

export function buildSetCookieHeader(value: string, maxAgeSeconds: number = 1800, isDev: boolean = false): string {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`
  ];

  if (!isDev) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function buildClearCookieHeader(isDev: boolean = false): string {
  return buildSetCookieHeader('', 0, isDev);
}

export function isAllowedOrigin(event: NetlifyEvent): boolean {
  const origin = event.headers['origin'] || event.headers['Referer'] || event.headers['referer'];
  if (!origin) return true; // Direct same-origin requests might not send Origin header in all browsers

  const allowedOriginsStr = process.env.ALLOWED_ORIGINS || '';
  const allowedList = allowedOriginsStr
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  // Defaults
  allowedList.push('https://oilganic.az');
  if (process.env.URL) allowedList.push(process.env.URL);
  if (process.env.DEPLOY_PRIME_URL) allowedList.push(process.env.DEPLOY_PRIME_URL);
  if (process.env.NODE_ENV === 'development') {
    allowedList.push('http://localhost:5173', 'http://localhost:8888', 'http://127.0.0.1:5173');
  }

  try {
    const requestOrigin = new URL(origin).origin;
    return allowedList.some(allowed => {
      try {
        return new URL(allowed).origin === requestOrigin;
      } catch (e) {
        return allowed === requestOrigin;
      }
    });
  } catch (e) {
    return false;
  }
}

export function jsonResponse(statusCode: number, data: unknown, extraHeaders: Record<string, string> = {}): NetlifyResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      ...extraHeaders
    },
    body: JSON.stringify(data)
  };
}

export function errorResponse(statusCode: number, message: string, extraHeaders: Record<string, string> = {}): NetlifyResponse {
  return jsonResponse(statusCode, { error: message }, extraHeaders);
}
