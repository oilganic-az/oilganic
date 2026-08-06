import { NetlifyEvent, NetlifyResponse, jsonResponse, isAllowedOrigin, buildSetCookieHeader } from './_shared/http';
import { getSessionFromHeaders, createSessionCookieValue } from './_shared/auth';
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

  const session = getSessionFromHeaders(event.headers);

  if (!session) {
    return jsonResponse(200, { authenticated: false });
  }

  const csrfToken = generateCsrfToken(session);
  const isDev = process.env.NODE_ENV === 'development';
  const refreshedCookie = createSessionCookieValue(session.username, 1800);
  const setCookieHeader = buildSetCookieHeader(refreshedCookie, 1800, isDev);

  return jsonResponse(
    200,
    {
      authenticated: true,
      username: session.username,
      csrfToken,
      expiresAt: session.exp
    },
    { 'Set-Cookie': setCookieHeader }
  );
}
