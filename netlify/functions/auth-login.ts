import { NetlifyEvent, NetlifyResponse, jsonResponse, errorResponse, buildSetCookieHeader, isAllowedOrigin } from './_shared/http';
import { getAdminUsername, verifyPasswordScrypt, createSessionCookieValue } from './_shared/auth';

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, {});
  }

  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'Method Not Allowed');
  }

  if (!isAllowedOrigin(event)) {
    return errorResponse(403, 'Forbidden origin');
  }

  let body: { username?: string; password?: string };
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return errorResponse(400, 'Invalid JSON body');
  }

  const { username, password } = body;
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return errorResponse(400, 'İstifadəçi adı və şifrə tələb olunur.');
  }

  const expectedUsername = getAdminUsername();
  const isUsernameValid = username.trim() === expectedUsername;
  const isPasswordValid = verifyPasswordScrypt(password);

  if (!isUsernameValid || !isPasswordValid) {
    return errorResponse(401, 'İstifadəçi adı və ya şifrə yanlışdır.');
  }

  const isDev = process.env.NODE_ENV === 'development';
  const cookieValue = createSessionCookieValue(expectedUsername, 1800); // 30 minutes
  const setCookieHeader = buildSetCookieHeader(cookieValue, 1800, isDev);

  return jsonResponse(
    200,
    { success: true, username: expectedUsername },
    { 'Set-Cookie': setCookieHeader }
  );
}
