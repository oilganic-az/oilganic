import crypto from 'node:crypto';
import { NetlifyEvent, NetlifyResponse, jsonResponse, errorResponse, isAllowedOrigin } from './_shared/http';
import { getSessionFromHeaders } from './_shared/auth';
import { verifyCsrfToken } from './_shared/csrf';
import { getGitHubConfig, commitSingleFileToGitHub } from './_shared/github';
import { validateImageSignature } from './_shared/validation';

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

  const session = getSessionFromHeaders(event.headers);
  if (!session) {
    return errorResponse(401, 'Sessiyanın vaxtı bitib və ya daxil olunmayıb.');
  }

  const csrfToken = event.headers['x-csrf-token'] || event.headers['X-CSRF-Token'];
  if (!verifyCsrfToken(session, csrfToken)) {
    return errorResponse(403, 'CSRF doğrulama xətası.');
  }

  let body: { fileData?: string; folder?: string; filename?: string };
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return errorResponse(400, 'Invalid JSON body');
  }

  const { fileData, folder = 'products' } = body;
  if (!fileData || typeof fileData !== 'string') {
    return errorResponse(400, 'Şəkil faylı (Base64) tələb olunur.');
  }

  if (!['products', 'campaigns'].includes(folder)) {
    return errorResponse(400, 'Keçərsiz qovluq təyinatı.');
  }

  // Extract base64 payload
  const base64Clean = fileData.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  const imageBuffer = Buffer.from(base64Clean, 'base64');

  // Check 2 MB size limit
  if (imageBuffer.length > 2 * 1024 * 1024) {
    return errorResponse(413, 'Şəkil faylının həcmi 2 MB-dan çox ola bilməz.');
  }

  // Validate magic bytes signature
  let ext: string;
  try {
    ext = validateImageSignature(imageBuffer);
  } catch (err: unknown) {
    return errorResponse(422, (err as Error).message);
  }

  // Generate safe unique filename
  const randomHash = crypto.randomBytes(4).toString('hex');
  const safeFilename = `${folder === 'products' ? 'prod' : 'camp'}-${Date.now()}-${randomHash}.${ext}`;
  const targetPath = `public/uploads/${folder}/${safeFilename}`;
  const publicUrl = `/uploads/${folder}/${safeFilename}`;

  const ghConfig = getGitHubConfig();

  try {
    await commitSingleFileToGitHub(
      ghConfig,
      targetPath,
      imageBuffer,
      `content: upload admin image ${safeFilename}`
    );

    return jsonResponse(200, {
      success: true,
      message: 'Şəkil uöurlu yükləndi',
      url: publicUrl
    });
  } catch (e: unknown) {
    const err = e as Error;
    return errorResponse(500, `Şəkil yüklənərkən xəta baş verdi: ${err.message}`);
  }
}
