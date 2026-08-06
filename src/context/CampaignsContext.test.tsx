import type { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  CampaignsProvider,
  useCampaigns,
} from './CampaignsContext';

const wrapper = ({
  children,
}: PropsWithChildren) => (
  <CampaignsProvider>
    {children}
  </CampaignsProvider>
);

describe('CampaignsContext admin-owned content', () => {
  it('serves generated campaigns without loading', () => {
    const { result } = renderHook(
      () => useCampaigns(),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.campaigns).toEqual([]);
  });

  it('does not silently persist campaign changes', async () => {
    const { result } = renderHook(
      () => useCampaigns(),
      { wrapper }
    );

    await expect(
      result.current.deleteCampaign('campaign-test')
    ).rejects.toThrow(
      'Admin yazma backend-i hələ aktiv deyil'
    );
  });
});