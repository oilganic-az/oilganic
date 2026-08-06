import { NetlifyEvent, NetlifyResponse, jsonResponse, errorResponse, isAllowedOrigin } from './_shared/http';
import { getSessionFromHeaders } from './_shared/auth';
import { verifyCsrfToken } from './_shared/csrf';
import { getGitHubConfig, fetchGitHubFile, commitSingleFileToGitHub } from './_shared/github';
import { validateCampaignServer } from './_shared/validation';
import { Campaign } from '../../src/types/campaign';

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, {});
  }

  if (!['POST', 'PATCH', 'DELETE'].includes(event.httpMethod)) {
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

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return errorResponse(400, 'Invalid JSON body');
  }

  const action = (body.action as string) || (event.httpMethod === 'DELETE' ? 'delete' : event.httpMethod === 'PATCH' ? 'update' : 'create');
  const ghConfig = getGitHubConfig();

  try {
    const campaignsFile = await fetchGitHubFile(ghConfig, 'content/campaigns.json');
    let campaignsDoc: { schemaVersion?: number; campaigns?: Campaign[] };

    try {
      campaignsDoc = JSON.parse(campaignsFile.content);
    } catch (e) {
      campaignsDoc = { schemaVersion: 1, campaigns: [] };
    }

    const campaigns: Campaign[] = campaignsDoc.campaigns || [];

    if (action === 'create' || action === 'update') {
      const campaign = validateCampaignServer(body.campaign);

      const existingIndex = campaigns.findIndex(c => c.id === campaign.id);
      if (action === 'create' && existingIndex !== -1) {
        return errorResponse(400, `Kampaniya ID artıq mövcuddur: ${campaign.id}`);
      }

      if (existingIndex !== -1) {
        campaigns[existingIndex] = campaign;
      } else {
        campaigns.push(campaign);
      }

      campaignsDoc.campaigns = campaigns;
      const updatedContent = `${JSON.stringify(campaignsDoc, null, 2)}\n`;

      await commitSingleFileToGitHub(
        ghConfig,
        'content/campaigns.json',
        updatedContent,
        `content: ${action} campaign ${campaign.title}`,
        campaignsFile.sha
      );

      return jsonResponse(200, {
        success: true,
        message: 'Saxlanıldı, yenilənmə yayımlanır',
        campaignId: campaign.id
      });
    }

    if (action === 'delete') {
      const campaignId = (body.campaignId as string) || (body.id as string);
      if (!campaignId) return errorResponse(400, 'Kampaniya ID tələb olunur.');

      const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
      campaignsDoc.campaigns = updatedCampaigns;

      const updatedContent = `${JSON.stringify(campaignsDoc, null, 2)}\n`;

      await commitSingleFileToGitHub(
        ghConfig,
        'content/campaigns.json',
        updatedContent,
        `content: delete campaign ${campaignId}`,
        campaignsFile.sha
      );

      return jsonResponse(200, {
        success: true,
        message: 'Saxlanıldı, yenilənmə yayımlanır',
        campaignId
      });
    }

    if (action === 'toggle') {
      const campaignId = (body.campaignId as string) || (body.id as string);
      if (!campaignId) return errorResponse(400, 'Kampaniya ID tələb olunur.');

      const camp = campaigns.find(c => c.id === campaignId);
      if (!camp) return errorResponse(404, `Kampaniya tapılmadı: ${campaignId}`);

      camp.isActive = !camp.isActive;
      campaignsDoc.campaigns = campaigns;

      const updatedContent = `${JSON.stringify(campaignsDoc, null, 2)}\n`;

      await commitSingleFileToGitHub(
        ghConfig,
        'content/campaigns.json',
        updatedContent,
        `content: toggle campaign ${campaignId}`,
        campaignsFile.sha
      );

      return jsonResponse(200, {
        success: true,
        message: 'Saxlanıldı, yenilənmə yayımlanır',
        campaignId,
        isActive: camp.isActive
      });
    }

    return errorResponse(400, `Naməlum əməliyyat: ${action}`);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message && err.message.includes('409 Conflict')) {
      return errorResponse(409, 'Eyni vaxtda başqa redaktə baş verdiyi üçün ziddiyyət yarandı.');
    }
    return errorResponse(500, `Kampaniya saxlanılarkən xəta baş verdi: ${err.message}`);
  }
}
