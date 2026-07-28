import { describe, it, expect } from 'vitest';
import { normalizeAzText, matchesQuery } from './search';

describe('Search Utility & Azerbaijani Text Normalization', () => {
  it('normalizes Azerbaijani special characters correctly', () => {
    expect(normalizeAzText('Badam Yağı')).toBe('badam yagi');
    expect(normalizeAzText('Şəkərsiz Fıstıq Əzməsi')).toBe('sekersiz fistiq ezmesi');
    expect(normalizeAzText('Öz İstehsalımız Ğ, Ç, Ü')).toBe('oz istehsalimiz g, c, u');
  });

  it('matches product search queries case-insensitively and character-agnostically', () => {
    expect(matchesQuery('Soyuq Sıxım Küncüt Yağı', 'kuncut')).toBe(true);
    expect(matchesQuery('Şəkərsiz Fıstıq Əzməsi', 'ezmesi')).toBe(true);
    expect(matchesQuery('Dağ Balı', 'dag bali')).toBe(true);
    expect(matchesQuery('Kətan Unu', 'nonexistent')).toBe(false);
  });
});
