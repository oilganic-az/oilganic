import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import generatedCampaigns from '../data/campaigns.generated.json';
import type { Campaign } from '../types/campaign';

export interface AdminCampaignResponse {
  success: boolean;
  message: string;
  campaignId?: string;
}

interface CampaignsContextType {
  campaigns: Campaign[];
  isLoading: boolean;
  addCampaign: (
    campaign: Omit<Campaign, 'id' | 'isActive'>,
    csrfToken?: string | null
  ) => Promise<AdminCampaignResponse>;
  deleteCampaign: (
    id: string,
    csrfToken?: string | null
  ) => Promise<AdminCampaignResponse>;
  toggleCampaignStatus: (
    id: string,
    csrfToken?: string | null
  ) => Promise<AdminCampaignResponse>;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

const campaigns = generatedCampaigns.campaigns as Campaign[];

async function sendCampaignMutation(
  action: 'create' | 'update' | 'delete' | 'toggle',
  payload: Record<string, unknown>,
  csrfToken?: string | null
): Promise<AdminCampaignResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch('/api/admin-campaigns', {
    method: action === 'delete' ? 'DELETE' : action === 'update' ? 'PATCH' : 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ action, ...payload })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    const errorMsg = data.error || `Kampaniya əməliyyatı xətası (${response.status})`;
    throw new Error(errorMsg);
  }

  return {
    success: true,
    message: data.message || 'Saxlanıldı, yenilənmə yayımlanır',
    campaignId: data.campaignId
  };
}

const contextValue: CampaignsContextType = {
  campaigns,
  isLoading: false,

  addCampaign: async (campaignData, csrfToken) => {
    const campaign: Campaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      isActive: true
    };
    return sendCampaignMutation('create', { campaign }, csrfToken);
  },

  deleteCampaign: async (id, csrfToken) => {
    return sendCampaignMutation('delete', { campaignId: id }, csrfToken);
  },

  toggleCampaignStatus: async (id, csrfToken) => {
    return sendCampaignMutation('toggle', { campaignId: id }, csrfToken);
  }
};

export const CampaignsProvider = ({
  children,
}: {
  children: ReactNode;
}) => (
  <CampaignsContext.Provider value={contextValue}>
    {children}
  </CampaignsContext.Provider>
);

export const useCampaigns = (): CampaignsContextType => {
  const context = useContext(CampaignsContext);

  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignsProvider');
  }

  return context;
};