import fs from 'fs';
import path from 'path';

const rawData = JSON.parse(fs.readFileSync('oilganic-products-with-images.json', 'utf8'));

function slugify(text) {
  const azMap = {
    'Ə': 'e', 'ə': 'e',
    'I': 'i', 'ı': 'i',
    'Ö': 'o', 'ö': 'o',
    'Ü': 'u', 'ü': 'u',
    'Ş': 's', 'ş': 's',
    'Ç': 'c', 'ç': 'c',
    'Ğ': 'g', 'ğ': 'g'
  };

  let str = text;
  for (const [az, en] of Object.entries(azMap)) {
    str = str.replaceAll(az, en);
  }

  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getCategoryId(name) {
  const n = name.toLowerCase();
  if (n.includes('yağ') || n.includes('yagi') || n.includes('yağı')) return 'oils';
  if (n.includes('əzmə') || n.includes('ezme') || n.includes('əzməsi') || n.includes('ezmesi')) return 'pastes';
  if (n.includes('bal') || n.includes('bəhməz') || n.includes('behmez')) return 'sweeteners';
  if (n.includes('şirə') || n.includes('sire') || n.includes('şirəsi')) return 'beverages';
  if (n.includes('sirkə') || n.includes('sirke') || n.includes('sirkəsi')) return 'vinegars';
  if (n.includes('məcun') || n.includes('mecun')) return 'mecunlar';
  if (n.includes('çay') || n.includes('cay') || n.includes('bitki')) return 'teas';
  if (
    n.includes('un') || n.includes('toxum') || n.includes('ədviyyə') ||
    n.includes('edviyye') || n.includes('ləpə') || n.includes('lepe') ||
    n.includes('qabıqlı') || n.includes('qabiqli') || n.includes('çərəz') || n.includes('cerez')
  ) return 'seeds_flours';
  
  return 'wellness';
}

function parsePrice(priceStr) {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = priceStr.replace('₼', '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseProductInfo(productName) {
  let name = productName.trim();
  let sizeLabel = '1 ədəd';
  let unitLabel = 'ədəd';

  if (/\b(1\s*)?kg\b/i.test(name)) {
    sizeLabel = '1 kg';
    unitLabel = 'kg';
  } else if (/\b(\d+)\s*(ml|L)\b/i.test(name)) {
    const m = name.match(/\b(\d+)\s*(ml|L)\b/i);
    sizeLabel = `${m[1]}${m[2].toLowerCase()}`;
    unitLabel = m[2].toLowerCase();
  } else if (/\b(\d+)\s*(gr|g|q)\b/i.test(name)) {
    const m = name.match(/\b(\d+)\s*(gr|g|q)\b/i);
    sizeLabel = `${m[1]}gr`;
    unitLabel = 'gr';
  } else if (/\b(\d+)\s*ədəd\b/i.test(name)) {
    const m = name.match(/\b(\d+)\s*ədəd\b/i);
    sizeLabel = `${m[1]} ədəd`;
    unitLabel = 'ədəd';
  }

  let baseName = name
    .replace(/\b\d+\s*(ml|L|gr|g|q|ədəd)\b/gi, '')
    .replace(/\b(1\s*)?kg\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { baseName, sizeLabel, unitLabel };
}

// Group raw Clopos items by base product name
const groupedMap = new Map();

rawData.forEach((item, idx) => {
  const { baseName, sizeLabel, unitLabel } = parseProductInfo(item.product);
  const price = parsePrice(item.price);
  const imageSrc = `/images/products/${item.filename}`;

  if (!groupedMap.has(baseName)) {
    groupedMap.set(baseName, {
      baseName,
      categoryId: getCategoryId(baseName),
      items: []
    });
  }

  groupedMap.get(baseName).items.push({
    rawNo: item.no || (idx + 1),
    sizeLabel,
    unitLabel,
    price,
    imageSrc
  });
});

const usedSlugs = new Set();
const products = [];

let prodCounter = 1;
for (const [baseName, group] of groupedMap.entries()) {
  const firstItem = group.items[0];
  const categoryId = group.categoryId;

  let baseSlug = slugify(baseName);
  let slug = baseSlug;
  let sCount = 1;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${sCount}`;
    sCount++;
  }
  usedSlugs.add(slug);

  const sizes = group.items.map((item, sizeIdx) => ({
    id: `size-${item.rawNo}-${sizeIdx + 1}`,
    label: item.sizeLabel,
    price: item.price,
    inStock: true,
    verificationStatus: 'verified',
    imageSrc: item.imageSrc
  }));

  const images = group.items.map(item => ({
    src: item.imageSrc,
    alt: `${baseName} (${item.sizeLabel})`
  }));

  products.push({
    id: `prod-${prodCounter++}`,
    slug: slug,
    name: baseName,
    categoryId: categoryId,
    shortDescription: `${baseName} - Təbii və keyfiyyətli Oilganic məhsulu.`,
    description: `${baseName}. Oilganic-də təbii keyfiyyət standartları ilə təqdim edilir.`,
    price: firstItem.price,
    currency: 'AZN',
    unitLabel: firstItem.unitLabel,
    sizes: sizes,
    images: images,
    usage: 'İstifadə və rasion üçün uyğundur.',
    storage: 'Sərin və quru yerdə saxlayın.',
    inStock: true,
    featured: prodCounter <= 12,
    tags: [categoryId, 'Oilganic'],
    verificationStatus: 'verified'
  });
}

const fileContent = `import { Product } from '../types/product';

export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync('src/data/products.ts', fileContent, 'utf8');
console.log(`Successfully generated ${products.length} grouped products in src/data/products.ts`);
