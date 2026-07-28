export type NavItem = {
  label: string;
  path: string;
};

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Ana səhifə', path: '/' },
  { label: 'Məhsullar', path: '/products' },
  { label: 'Hazırlanma prosesi', path: '/process' },
  { label: 'Haqqımızda', path: '/about' },
  { label: 'Çatdırılma', path: '/delivery' },
  { label: 'Əlaqə', path: '/contact' }
];

export const FOOTER_LEGAL_ITEMS: NavItem[] = [
  { label: 'Məxfilik siyasəti', path: '/privacy' },
  { label: 'İstifadə şartləri', path: '/terms' }
];
