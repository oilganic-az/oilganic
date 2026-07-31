export interface Campaign {
  id: string;
  title: string;
  conditions: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  imageSrc?: string;
}
