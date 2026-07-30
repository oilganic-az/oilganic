export type ProcessStep = {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  details?: string[];
};

export const PROCESS_STEPS: ProcessStep[] = [
  {
    stepNumber: 1,
    title: 'Seçilmiş xammal',
    subtitle: 'Keyfiyyətli toxumlar və çərəzlər',
    description: 'Yalnız saf, kimyəvi prosesdən keçməyən, təmizlənmiş toxumlar seçilir.',
    details: []
  },
  {
    stepNumber: 2,
    title: 'Soyuq sıxım, isti sıxım, əzmə və üyütmə prosesi',
    subtitle: 'Gözünüzün qarşısında mağazada hazırlanır',
    description: 'Xammal xüsusi aparatlarla hazırlanır.',
    details: []
  },
  {
    stepNumber: 3,
    title: 'Gigiyenik qablaşdırma',
    subtitle: 'Tam steril şüşə qablar',
    description: 'Hazırlanan təbii yağlar və əzmələr dərhal təmiz şüşə qablara doldurulur.',
    details: []
  },
  {
    stepNumber: 4,
    title: 'Take away və ya çatdırılma',
    subtitle: 'Birbaşa müştəriyə və ya çatdırılma',
    description: 'Sifariş edilən məhsul müştərinin gözü qarşısında hazırlanır və müştəriyə təhvil verilir.',
    details: []
  }
];
