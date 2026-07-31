export const NAME_ALIASES: Record<string, string> = {
  "braziilya qozu": "Braziliya qozu",
  "fıstıq+küncüt əzməsi": "Fıstıq + küncüt əzməsi",
  "uthindi toz": "Uthindi tozu",
  "acı badam ləpə": "Acı badam ləpəsi",
  "acı ərik": "Acı ərik tumu",
  "zəncəfil toz": "Zəncəfil tozu"
};

// Azerbaijani-safe slugify helper
export function slugify(text: string): string {
  const charMap: Record<string, string> = {
    'ı': 'i', 'ö': 'o', 'ü': 'u', 'ş': 's', 'ğ': 'g', 'ç': 'c', 'ə': 'e',
    'I': 'i', 'Ö': 'o', 'Ü': 'u', 'Ş': 's', 'Ğ': 'g', 'Ç': 'c', 'Ə': 'e'
  };
  const cleaned = text.split('').map(char => charMap[char] || char).join('');
  return cleaned.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Parse base name and variant label
export function getBaseNameAndVariant(name: string): {
  base: string;
  rawLabel: string;
  isAliasApplied: boolean;
} {
  const regex = /(\b\d+(?:\.\d+)?\s*(?:ml|litr|l|gr|g|qr|qram|kapsul|kapsulu|tablet|paket|paçka|ədəd|əd|kg)\b|\bkg\b)/gi;
  const match = name.match(regex);
  
  if (match) {
    const rawLabel = match[0].trim();
    let base = name.replace(regex, '').replace(/\s+/g, ' ').trim();
    base = base.replace(/^[-\s,]+|[-\s,]+$/g, '');

    const lowerBase = base.toLowerCase();
    let isAliasApplied = false;

    if (NAME_ALIASES[lowerBase]) {
      base = NAME_ALIASES[lowerBase];
      isAliasApplied = true;
    } else if (lowerBase === 'qarazirə yağı suriya toxumu' || lowerBase === 'qarazire yagi suriya toxumu' || lowerBase === 'qarazirə yağı suriya toxumundan') {
      base = 'Qarazirə yağı Suriya toxumundan';
      isAliasApplied = true;
    }

    return { base, rawLabel, isAliasApplied };
  }
  
  const lowerName = name.toLowerCase();
  let baseName = name;
  let isAliasApplied = false;
  if (NAME_ALIASES[lowerName]) {
    baseName = NAME_ALIASES[lowerName];
    isAliasApplied = true;
  }
  return { base: baseName, rawLabel: 'default', isAliasApplied };
}

// Normalize quantity label to standard Azerbaijani formatting
export function normalizeLabel(rawLabel: string): string {
  if (rawLabel === 'default') return 'Standart';
  
  const clean = rawLabel.toLowerCase().replace(/\s+/g, '').trim();
  if (clean === 'kg') return '1 kg';
  if (clean === '0.2kg') return '200 gr';
  
  const numMatch = clean.match(/\d+(?:\.\d+)?/);
  const val = numMatch ? parseFloat(numMatch[0]) : 1;
  
  if (clean.includes('ml')) return `${val} ml`;
  if (clean.includes('kg')) return `${val} kg`;
  if (clean.includes('kapsul')) return `${val} kapsul`;
  if (clean.includes('tablet')) return `${val} tablet`;
  if (clean.includes('paket')) return `${val} paket`;
  if (clean.includes('paçka')) return `${val} paçka`;
  if (clean.includes('litr') || /^(\d+(\.\d+)?)(l)$/i.test(clean)) return `${val} litr`;
  if (clean.includes('gr') || clean.includes('qr') || clean.includes('qram') || /^(\d+(\.\d+)?)(g)$/i.test(clean)) return `${val} gr`;
  if (clean.includes('ədəd') || clean.includes('əd')) return `${val} ədəd`;
  
  return rawLabel;
}

// Parse value and unit from label
export function parseQuantity(label: string): { value: number; unit: string } {
  if (label === 'default' || label === 'Standart') {
    return { value: 1, unit: 'piece' };
  }
  const clean = label.toLowerCase().replace(/\s+/g, '').trim();
  const numMatch = clean.match(/\d+(?:\.\d+)?/);
  const value = numMatch ? parseFloat(numMatch[0]) : 1;
  
  const unitMatch = clean.match(/(ml|litr|l|gr|g|qr|qram|kapsul|kapsulu|tablet|paket|paçka|ədəd|əd|kg)/i);
  let unit = 'piece';
  if (unitMatch) {
    const rawUnit = unitMatch[0].toLowerCase();
    if (rawUnit === 'ml') unit = 'ml';
    else if (rawUnit === 'litr' || rawUnit === 'l') unit = 'l';
    else if (rawUnit === 'gr' || rawUnit === 'g' || rawUnit === 'qr' || rawUnit === 'qram') unit = 'g';
    else if (rawUnit === 'kg') unit = 'kg';
    else if (rawUnit.includes('kapsul')) unit = 'capsule';
    else if (rawUnit.includes('tablet')) unit = 'tablet';
    else if (rawUnit.includes('paket') || rawUnit.includes('paçka')) unit = 'pack';
    else if (rawUnit.includes('ədəd') || rawUnit.includes('əd')) unit = 'piece';
  } else if (clean === 'kg') {
    unit = 'kg';
  }
  
  return { value, unit };
}

// Sort weight mapping
export function getVariantWeight(qty: { value: number; unit: string }): number {
  const multipliers: Record<string, number> = {
    'ml': 1,
    'g': 1,
    'l': 1000,
    'kg': 1000,
    'capsule': 1,
    'tablet': 1,
    'pack': 1,
    'piece': 1
  };
  return qty.value * (multipliers[qty.unit] || 1);
}
