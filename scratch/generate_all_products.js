import fs from 'node:fs';

function slugify(text) {
  const charMap = {
    'ə': 'e', 'Ə': 'e',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ü': 'u', 'Ü': 'u',
    'ğ': 'g', 'Ğ': 'g',
    'ç': 'c', 'Ç': 'c',
    'ş': 's', 'Ş': 's'
  };

  let str = text;
  for (const [key, val] of Object.entries(charMap)) {
    str = str.replaceAll(key, val);
  }

  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function determineCategory(name) {
  const lower = name.toLowerCase();
  if (lower.includes('yağ') || lower.includes('yagi')) return 'oils';
  if (lower.includes('əzmə') || lower.includes('ezme') || lower.includes('tahin')) return 'pastes';
  if (lower.includes('bal') || lower.includes('bəhməz') || lower.includes('behmez') || lower.includes('doşab') || lower.includes('şirə')) return 'sweeteners';
  if (lower.includes('çay') || lower.includes('otu') || lower.includes('çiçək') || lower.includes('sirkə') || lower.includes('suyu')) return 'teas';
  return 'seeds_flours';
}

function extractBaseNameAndSize(productName) {
  const sizeMatch = productName.match(/\s+(\d+(?:\.\d+)?\s*(?:ml|gr|g|kg|l|litr|ədəd|əd))\b/i);
  if (sizeMatch) {
    const sizeLabel = sizeMatch[1].trim();
    const baseName = productName.replace(sizeMatch[0], '').trim();
    return { baseName, sizeLabel };
  }
  return { baseName: productName.trim(), sizeLabel: '1 ədəd' };
}

const rawData = fs.readFileSync('oilganic-products-with-images.json', 'utf8');
const items = JSON.parse(rawData);

const groupsMap = new Map();

items.forEach((item) => {
  const numPrice = parseFloat(item.price.replace('₼', '').trim()) || 0;
  const { baseName, sizeLabel } = extractBaseNameAndSize(item.product);
  const imagePath = `/images/products/${item.filename}`;

  if (!groupsMap.has(baseName)) {
    groupsMap.set(baseName, {
      no: item.no,
      baseName,
      firstProductRawName: item.product,
      alternatives: item.alternatives,
      filename: item.filename,
      sizes: []
    });
  }

  const group = groupsMap.get(baseName);
  group.sizes.push({
    id: `size-${item.no}`,
    label: sizeLabel,
    price: numPrice,
    inStock: true,
    verificationStatus: 'verified',
    imageSrc: imagePath
  });
});

let pIdx = 1;
const products = Array.from(groupsMap.values()).map(group => {
  const primarySize = group.sizes[0];
  const slug = slugify(group.baseName);
  const categoryId = determineCategory(group.baseName);

  return {
    id: `prod-${group.no}`,
    slug,
    name: group.baseName,
    categoryId,
    shortDescription: group.alternatives ? `${group.baseName} - Tərkibi: ${group.alternatives}` : `${group.baseName} - Yerli və şəffaf istehsalat.`,
    description: group.alternatives ? `${group.baseName}. Qeyd / Tərkib: ${group.alternatives}` : `${group.baseName}. Oilganic-də təbii keyfiyyət standartları ilə təqdim edilir.`,
    price: primarySize.price,
    currency: 'AZN',
    sizes: group.sizes,
    images: [
      {
        src: primarySize.imageSrc,
        alt: group.baseName
      }
    ],
    usage: 'İstifadə və rasion üçün uyğundur.',
    storage: 'Sərin və quru yerdə saxlayın.',
    inStock: true,
    featured: pIdx++ <= 8,
    tags: [categoryId, 'Oilganic'],
    woltUrl: 'https://wolt.com/en/aze/baku/venue/oilganic-shop',
    verificationStatus: 'verified'
  };
});

const tsCode = `import { Product } from '../types/product';

export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync('src/data/products.ts', tsCode, 'utf8');
console.log(`✅ Successfully grouped into ${products.length} distinct products in src/data/products.ts`);
