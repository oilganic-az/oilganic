import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import generatedCampaigns from '../data/campaigns.generated.json';
import type { Campaign } from '../types/campaign';

interface CampaignsContextType {
  campaigns: Campaign[];
  isLoading: boolean;
  addCampaign: (
    campaign: Omit<Campaign, 'id' | 'isActive'>
  ) => Promise<void>;
  deleteCampaign: (
    id: string
  ) => Promise<void>;
  toggleCampaignStatus: (
    id: string
  ) => Promise<void>;
}

const CampaignsContext =
  createContext<CampaignsContextType | undefined>(
    undefined
  );

const campaigns =
  generatedCampaigns.campaigns as Campaign[];

const ADMIN_WRITE_ERROR =
  'Admin yazma backend-i hələ aktiv deyil. Kampaniya dəyişiklikləri saxlanılmadı.';

async function rejectAdminMutation(): Promise<never> {
  throw new Error(ADMIN_WRITE_ERROR);
}

const contextValue: CampaignsContextType = {
  campaigns,
  isLoading: false,
  addCampaign: rejectAdminMutation,
  deleteCampaign: rejectAdminMutation,
  toggleCampaignStatus: rejectAdminMutation,
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
    throw new Error(
      'useCampaigns must be used within a CampaignsProvider'
    );
  }

  return context;
};