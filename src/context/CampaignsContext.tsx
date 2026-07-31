import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campaign } from '../types/campaign';

interface CampaignsContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'isActive'>) => void;
  deleteCampaign: (id: string) => void;
  toggleCampaignStatus: (id: string) => void;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export const CampaignsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('oilganic_campaigns');
    if (stored) {
      try {
        setCampaigns(JSON.parse(stored));
      } catch (e) {
        setCampaigns([]);
      }
    }
  }, []);

  const saveCampaigns = (newCampaigns: Campaign[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem('oilganic_campaigns', JSON.stringify(newCampaigns));
  };

  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'isActive'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      isActive: true
    };
    saveCampaigns([...campaigns, newCampaign]);
  };

  const deleteCampaign = (id: string) => {
    saveCampaigns(campaigns.filter(c => c.id !== id));
  };

  const toggleCampaignStatus = (id: string) => {
    saveCampaigns(
      campaigns.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <CampaignsContext.Provider
      value={{
        campaigns,
        addCampaign,
        deleteCampaign,
        toggleCampaignStatus
      }}
    >
      {children}
    </CampaignsContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignsContext);
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignsProvider');
  }
  return context;
};
