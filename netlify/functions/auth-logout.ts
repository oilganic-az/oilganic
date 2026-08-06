import { NetlifyEvent, NetlifyResponse, jsonResponse, buildClearCookieHeader, isAllowedOrigin } from './_shared/http';

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, {});
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  if (!isAllowedOrigin(event)) {
    return jsonResponse(403, { error: 'Forbidden origin' });
  }

  const isDev = process.env.NODE_ENV === 'development';
  const clearCookieHeader = buildClearCookieHeader(isDev);

  return jsonResponse(
    200,
    { success: true, message: 'Çıxış edildi.' },
    { 'Set-Cookie': clearCookieHeader }
  );
}
