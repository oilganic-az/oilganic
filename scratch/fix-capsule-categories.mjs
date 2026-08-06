import fs from 'fs';

const targetProductIds = new Set([
  'prod-8',    // Aclıq otu kapsulu
  'prod-9',    // Alaqanqal kapsulu
  'prod-44',   // Çörəkotu kapsul
  'prod-45',   // Çörəkotu yağ kapsulu
  'prod-90',   // Jenşen kapsul
  'prod-160',  // Ud hindi və çörəkotu kapsulu
  'prod-161',  // Udhindi tablet
  'prod-162',  // Udukumin
  'prod-164'   // Uthindi kapsul
]);

// 1. Update content/catalog-base.json
const catalogBase = JSON.parse(fs.readFileSync('content/catalog-base.json', 'utf8'));

// Filter out the duplicated new products added earlier
catalogBase.products = catalogBase.products.filter(p => !p.id.startsWith('prod-') || !isNaN(Number(p.id.replace('prod-', ''))));

// Update categoryId to 'tablets_capsules' for the 9 original products
let updatedCountBase = 0;
catalogBase.products.forEach(p => {
  if (targetProductIds.has(p.id)) {
    p.categoryId = 'tablets_capsules';
    p.tags = p.tags ? Array.from(new Set(p.tags.map(t => t === 'wellness' ? 'tablets_capsules' : t))) : ['tablets_capsules', 'Oilganic'];
    updatedCountBase++;
  }
});

// Ensure clopos-14 category points to tablets_capsules
const cat14 = catalogBase.categories.find(c => c.cloposId === '14' || c.id === 'clopos-14');
if (cat14) {
  cat14.websiteCategoryId = 'tablets_capsules';
  cat14.slug = 'tablet-ve-kapsullar';
  cat14.name = 'Tablet və kapsullar';
}

fs.writeFileSync('content/catalog-base.json', JSON.stringify(catalogBase, null, 2) + '\n', 'utf8');
console.log(`Updated ${updatedCountBase} products in content/catalog-base.json to tablets_capsules.`);

// 2. Update src/data/products.ts
let productsTs = fs.readFileSync('src/data/products.ts', 'utf8');
const productsTsContent = productsTs.replace(/import[\s\S]*?export const PRODUCTS: Product\[\] = /, '').replace(/;\s*$/, '');

let productsList = JSON.parse(productsTsContent);
productsList = productsList.filter(p => !p.id.startsWith('prod-') || !isNaN(Number(p.id.replace('prod-', ''))));

let updatedCountTs = 0;
productsList.forEach(p => {
  if (targetProductIds.has(p.id)) {
    p.categoryId = 'tablets_capsules';
    p.tags = p.tags ? Array.from(new Set(p.tags.map(t => t === 'wellness' ? 'tablets_capsules' : t))) : ['tablets_capsules', 'Oilganic'];
    updatedCountTs++;
  }
});

const newProductsTs = `import { Product } from '../types/product';\n\nexport const PRODUCTS: Product[] = ${JSON.stringify(productsList, null, 2)};\n`;
fs.writeFileSync('src/data/products.ts', newProductsTs, 'utf8');
fs.writeFileSync('src/data/products.generated.ts', newProductsTs, 'utf8');
console.log(`Updated ${updatedCountTs} products in src/data/products.ts and src/data/products.generated.ts.`);
