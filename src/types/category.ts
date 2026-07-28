export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  group: 'oils' | 'pastes' | 'sweeteners' | 'beverages' | 'teas' | 'seeds_flours' | 'wellness';
  badge?: string;
};
