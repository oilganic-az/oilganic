import { NetlifyEvent, NetlifyResponse, jsonResponse, isAllowedOrigin, buildSetCookieHeader } from './_shared/http';
import { getSessionFromHeaders, createSessionCookieFromPayload, SessionPayload } from './_shared/auth';
import { generateCsrfToken } from './_shared/csrf';

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, {});
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  if (!isAllowedOrigin(event)) {
    return jsonResponse(403, { error: 'Forbidden origin' });
  }

  const existingSession = getSessionFromHeaders(event.headers);

  if (!existingSession) {
    return jsonResponse(200, { authenticated: false });
  }

  // Create ONE refreshed SessionPayload
  const refreshedPayload: SessionPayload = {
    username: existingSession.username,
    exp: Date.now() + 1800 * 1000,
    nonce: existingSession.nonce
  };

  // Sign that exact payload into refreshed cookie and CSRF token
  const refreshedCookieValue = createSessionCookieFromPayload(refreshedPayload);
  const csrfToken = generateCsrfToken(refreshedPayload);
  const isDev = process.env.NODE_ENV === 'development';
  const setCookieHeader = buildSetCookieHeader(refreshedCookieValue, 1800, isDev);

  return jsonResponse(
    200,
    {
      authenticated: true,
      username: refreshedPayload.username,
      csrfToken,
      expiresAt: refreshedPayload.exp
    },
    { 'Set-Cookie': setCookieHeader }
  );
}
