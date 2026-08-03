import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Campaign } from '../types/campaign';

const COLLECTION = 'campaigns';

interface CampaignsContextType {
  campaigns: Campaign[];
  isLoading: boolean;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'isActive'>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  toggleCampaignStatus: (id: string) => Promise<void>;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export const CampaignsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy('title'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Campaign[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...(docSnap.data() as Omit<Campaign, 'id'>) });
        });
        setCampaigns(fetched);
        setIsLoading(false);
      },
      (error) => {
        console.error('Firestore campaigns onSnapshot error:', error);
        setCampaigns([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addCampaign = async (campaignData: Omit<Campaign, 'id' | 'isActive'>): Promise<void> => {
    await addDoc(collection(db, COLLECTION), {
      ...campaignData,
      isActive: true,
    });
  };

  const deleteCampaign = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION, id));
  };

  const toggleCampaignStatus = async (id: string): Promise<void> => {
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;
    await updateDoc(doc(db, COLLECTION, id), { isActive: !target.isActive });
  };

  return (
    <CampaignsContext.Provider
      value={{
        campaigns,
        isLoading,
        addCampaign,
        deleteCampaign,
        toggleCampaignStatus,
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
